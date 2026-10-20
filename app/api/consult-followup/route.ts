import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildFollowupPrompt } from '@/lib/prompt';
import { findMentionedSchool, buildSchoolFactsBlock } from '@/lib/schoolFacts';
import { checkAiConsultRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';

// AIの回答に対して、その場で返信（ラリー）できる機能のAPI（2026-10-16追加）。
// /api/consult（新規相談）とほぼ同じ流れだが、新規に質問内容を一から書くのではなく、
// 既存の相談（parent）の質問・回答を会話の続きとしてAIに渡す点が異なる。
// できた行はparent_idを持つ「続き」として保存し、一覧・テーマ件数には出さない
// （lib/consultations.ts等、parent_id is null を条件にしている箇所を参照）。
export async function POST(req: NextRequest) {
  const { parent_id, text, author_id } = await req.json();

  if (!parent_id || !text || !text.trim() || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const ip = getClientIp(req);
  const limit = await checkAiConsultRateLimit(author_id, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();

  // 返信先（parent）は、本人の相談であることを確認する（他人の相談には返信できない）。
  // author_idはクライアントのローカルuid。会員ログインでの投稿も、投稿時のauthor_idは
  // 常にセットされているため、これだけで本人確認として十分（他のAPIと同じ方式）。
  const { data: parent } = await supabase
    .from('consultations')
    .select('id, category, question, answer, grade, gender, author_id, member_id, request_type, child_id')
    .eq('id', parent_id)
    .single();

  if (!parent || parent.author_id !== author_id) {
    return NextResponse.json({ error: '元の相談が見つかりませんでした' }, { status: 404 });
  }
  if (parent.request_type !== 'ai' || !parent.answer) {
    return NextResponse.json({ error: 'この相談には返信できません' }, { status: 400 });
  }

  const { data: guidelines } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  const guideCat = guidelines?.categories?.[parent.category];

  // 返信（ラリー）では今回のメッセージ自体に学校名が出てこないこともあるため
  // （最初の相談で学校名を出し、返信では事実だけ聞くパターン）、最初の相談文も
  // あわせて学校名を検索する（lib/schoolFacts.ts参照、2026-10-18追加）。
  const mentionedSchool = findMentionedSchool([parent.question, text]);
  const schoolFactsBlock = mentionedSchool ? buildSchoolFactsBlock(mentionedSchool) : undefined;

  const prompt = buildFollowupPrompt(
    parent.category,
    parent.question,
    parent.answer,
    text.trim(),
    guideCat,
    parent.grade,
    parent.gender,
    !!guidelines?.supervised,
    schoolFactsBlock
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      // app/api/consult/route.tsと同じ理由でmax_tokensを増やしている
      // （検索結果のテキストも出力トークン予算に含まれるため）。
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      // 返信（ラリー）には元々web_searchが付いておらず、最新情報が必要な
      // 深掘り質問（例：「学びの多様化学校も民間あるよね？」）にAIの古い・不正確な
      // 知識のまま断定で答えてしまう問題があったため、/api/consultと同じ設定で追加
      // （2026-10-21）。レート制限（1日10回等）は最初の相談と合算でそのまま効くため、
      // 追加コストの上限（最悪ケースで1日$6程度）は変わらない。
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
    });
    // app/api/consult/route.tsと同じ理由で、全textブロックを結合する
    // （検索を挟む場合、content配列に複数のtextブロックが含まれることがあるため）。
    const textBlocks = msg.content.filter(
      (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
    );
    answer = textBlocks.map((b) => b.text).join('').trim();
    if (!answer) {
      throw new Error(
        `empty response (stop_reason=${msg.stop_reason}, blocks=${msg.content.map((b) => b.type).join(',')})`
      );
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'AI回答の生成に失敗しました: ' + message }, { status: 502 });
  }

  // /api/consultと同じ判定（lib/prompt.tsの安全上書きが発動したかどうか）。
  const crisisDetected = answer.includes('0120-0-78310');

  // ログイン中の会員かどうかは、元の相談のmember_idではなく、今リクエストしている
  // ブラウザの会員状態をそのまま使う（別の端末から返信する場合もあり得るため）。
  const member = await getCurrentMember();

  const { data: row, error: insertErr } = await supabase
    .from('consultations')
    .insert({
      category: parent.category,
      question: text.trim(),
      answer,
      grade: parent.grade,
      gender: parent.gender,
      author_id,
      member_id: member?.id || parent.member_id || null,
      // 返信（ラリー）も元の相談と同じ子どものこととして扱う（2026-10-16追加）。
      child_id: parent.child_id || null,
      client_ip: ip,
      likes: 0,
      liked_by: [],
      views: 0,
      crisis_detected: crisisDetected,
      parent_id: parent.id,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, consultation: row });
}
