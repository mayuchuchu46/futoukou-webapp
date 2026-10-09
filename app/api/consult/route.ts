import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt } from '@/lib/prompt';

export async function POST(req: NextRequest) {
  const { category, text, author_id } = await req.json();

  if (!category || !text || !text.trim() || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  const { data: guidelines } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  const guideCat = guidelines?.categories?.[category];

  const prompt = buildPrompt(category, text.trim(), guideCat);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = msg.content[0];
    answer = block.type === 'text' ? block.text.trim() : '';
    if (!answer) throw new Error('empty response');
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'AI回答の生成に失敗しました: ' + message }, { status: 502 });
  }

  const { data: row, error: insertErr } = await supabase
    .from('consultations')
    .insert({
      category,
      question: text.trim(),
      answer,
      author_id,
      likes: 0,
      liked_by: [],
      comment_count: 0,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, consultation: row });
}
