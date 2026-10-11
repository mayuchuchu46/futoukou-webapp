import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt, PastConsultation } from '@/lib/prompt';
import { checkAiConsultRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';

export async function POST(req: NextRequest) {
  const { category, text, author_id, grade, gender } = await req.json();

  if (!category || !text || !text.trim() || !author_id) {
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

  // ログイン中の会員であれば、過去の相談履歴（直近分）を取得してAIの回答に反映する。
  // このroute自体はクライアントからのfetch経由でのみ呼ばれる動的なRoute Handlerなので、
  // ここでCookieから会員情報を読んでも共有キャッシュに乗る心配はない（lib/consultations.tsのコメント参照）。
  const member = await getCurrentMember();
  let history: PastConsultation[] | undefined;
  if (member) {
    const { data: pastRows } = await supabase
      .from('consultations')
      .select('category, question, created_at')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (pastRows && pastRows.length) {
      history = pastRows as PastConsultation[];
    }
  }

  const { data: guidelines } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  const guideCat = guidelines?.categories?.[category];

  const prompt = buildPrompt(
    category,
    text.trim(),
    guideCat,
    grade || null,
    gender || null,
    !!guidelines?.supervised,
    history
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer: string;
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    // 応答の先頭ブロックが常にtextとは限らない（拡張思考ブロック等が
    // 先に来るケースがある）ため、content配列からtextブロックを探す。
    const textBlock = msg.content.find(
      (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
    );
    answer = textBlock ? textBlock.text.trim() : '';
    if (!answer) {
      throw new Error(
        `empty response (stop_reason=${msg.stop_reason}, blocks=${msg.content.map((b) => b.type).join(',')})`
      );
    }
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
      grade: grade || null,
      gender: gender || null,
      author_id,
      member_id: member?.id || null,
      client_ip: ip,
      likes: 0,
      liked_by: [],
      views: 0,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, consultation: row });
}
