import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt, buildFollowupPrompt } from '@/lib/prompt';
import { findMentionedSchool, buildSchoolFactsBlock } from '@/lib/schoolFacts';
import { findMentionedInstitutions, buildInstitutionFactsBlock } from '@/lib/institutionFacts';

// 無料AI相談（request_type='ai'）のAI回答を、現在のプロンプト設定（文字数の目安など）で
// 作り直すための管理者向けエンドポイント。プロンプトを調整したあと、既存の投稿
// （特にサンプル相談）を新しい文字数感に合わせ直したいケースのために追加（2026-10-13）。
// 専門家が回答した相談（request_type='expert'）は対象外。
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('id, category, question, grade, gender, request_type, parent_id')
    .eq('id', id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: '相談が見つかりません' }, { status: 404 });
  }
  if (row.request_type !== 'ai') {
    return NextResponse.json({ error: '無料AI相談のみ再生成できます（専門家回答は対象外）' }, { status: 400 });
  }

  const { data: guidelines } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  const guideCat = guidelines?.categories?.[row.category];

  // この行が返信（ラリー、parent_idあり）の場合、元の相談（親）の質問・回答を
  // 渡さずbuildPrompt（新規相談用）でこの行の質問文単体だけを再生成すると、
  // 会話の前提（例：親の質問で話題になっていた学校種別）が失われ、AIが
  // 「何との違いか」等を文脈なしで当てずっぽうに補ってしまう不具合があった
  // （2026-10-21、「フリースクールとどう違う？」という返信を再生成したら、
  // 元の質問が「学びの多様化学校」についてだったのに、全く無関係な
  // 「教育支援センター」との比較に化けてしまった事例で発覚）。
  // parent_idがあれば親を取得し、buildFollowupPromptで会話の続きとして再生成する。
  let prompt: string;
  if (row.parent_id) {
    const { data: parent, error: parentErr } = await supabase
      .from('consultations')
      .select('id, category, question, answer, grade, gender')
      .eq('id', row.parent_id)
      .single();
    if (parentErr || !parent) {
      return NextResponse.json({ error: '元の相談（親）が見つかりませんでした' }, { status: 404 });
    }
    const mentionedSchool = findMentionedSchool([parent.question, row.question]);
    const schoolFactsBlock = mentionedSchool ? buildSchoolFactsBlock(mentionedSchool) : undefined;
    const mentionedInstitutions = findMentionedInstitutions([parent.question, parent.answer, row.question]);
    const institutionFactsBlock = buildInstitutionFactsBlock(mentionedInstitutions);
    const factsBlock = [schoolFactsBlock, institutionFactsBlock].filter(Boolean).join('\n');
    prompt = buildFollowupPrompt(
      row.category,
      parent.question,
      parent.answer,
      row.question,
      guideCat,
      row.grade || null,
      row.gender || null,
      !!guidelines?.supervised,
      factsBlock || undefined
    );
  } else {
    // 既存の相談文に学校名が含まれていれば、再生成時もサイト側の確認済み情報を渡す
    // （lib/schoolFacts.ts参照、2026-10-18追加）。制度・施設レベルの言及も同様に渡す
    // （lib/institutionFacts.ts参照、2026-10-21追加）。
    const mentionedSchool = findMentionedSchool([row.question]);
    const schoolFactsBlock = mentionedSchool ? buildSchoolFactsBlock(mentionedSchool) : undefined;
    const mentionedInstitutions = findMentionedInstitutions([row.question]);
    const institutionFactsBlock = buildInstitutionFactsBlock(mentionedInstitutions);
    const factsBlock = [schoolFactsBlock, institutionFactsBlock].filter(Boolean).join('\n');
    prompt = buildPrompt(
      row.category,
      row.question,
      guideCat,
      row.grade || null,
      row.gender || null,
      !!guidelines?.supervised,
      undefined,
      undefined,
      factsBlock || undefined
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
    });
    const textBlocks = msg.content.filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text');
    answer = textBlocks.map((b) => b.text).join('').trim();
    if (!answer) {
      throw new Error(`empty response (stop_reason=${msg.stop_reason}, blocks=${msg.content.map((b) => b.type).join(',')})`);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'AI回答の生成に失敗しました: ' + message }, { status: 502 });
  }

  const { error: updateErr } = await supabase.from('consultations').update({ answer }).eq('id', id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, answer });
}
