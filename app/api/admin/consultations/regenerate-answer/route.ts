import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt } from '@/lib/prompt';

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
    .select('id, category, question, grade, gender, request_type')
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

  const prompt = buildPrompt(row.category, row.question, guideCat, row.grade || null, row.gender || null, !!guidelines?.supervised);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = msg.content.find((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text');
    answer = textBlock ? textBlock.text.trim() : '';
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
