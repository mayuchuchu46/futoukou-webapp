import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { EXPERT_PRICE_JPY } from '@/lib/config';
import { checkExpertRequestRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';

// 専門家への都度質問（¥500）は、読み放題会員（月¥800のサブスク）限定。
// 非会員はAIの無料相談のみ利用可（2026-10-10 決定の価格体系）。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member || !isSubscriptionActive(member)) {
    return NextResponse.json(
      { error: '専門家への質問は、読み放題会員（月¥800）の登録が必要です', needsMembership: true },
      { status: 403 }
    );
  }

  const { category, text, author_id, grade, gender, requested_expert_id } = await req.json();
  if (!category || !text || !text.trim() || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const ip = getClientIp(req);
  const limit = await checkExpertRequestRateLimit(author_id, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();

  // 専門家一覧から指名された場合、なりすましの指名（本人確認未完了の専門家IDを
  // 渡す等）を避けるため、本人確認済みの専門家であることをここで確認してから保存する。
  let requestedExpertId: string | null = null;
  if (requested_expert_id) {
    const { data: expertRow } = await supabase
      .from('experts')
      .select('id')
      .eq('id', requested_expert_id)
      .eq('verified', true)
      .single();
    requestedExpertId = expertRow?.id || null;
  }

  const { data: row, error: insertErr } = await supabase
    .from('consultations')
    .insert({
      category,
      question: text.trim(),
      answer: '',
      grade: grade || null,
      gender: gender || null,
      author_id,
      client_ip: ip,
      request_type: 'expert',
      price_jpy: EXPERT_PRICE_JPY,
      paid: false,
      expert_status: 'pending',
      requested_expert_id: requestedExpertId,
    })
    .select('id')
    .single();

  if (insertErr || !row) {
    return NextResponse.json({ error: insertErr?.message || '相談の登録に失敗しました' }, { status: 500 });
  }

  const origin = req.nextUrl.origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: { name: '専門家への相談（どうする先生）' },
            unit_amount: EXPERT_PRICE_JPY,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/result/${row.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ask`,
      metadata: { consultation_id: row.id },
    });

    await supabase.from('consultations').update({ stripe_session_id: session.id }).eq('id', row.id);

    return NextResponse.json({ ok: true, url: session.url, consultation_id: row.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '決済の準備に失敗しました: ' + message }, { status: 502 });
  }
}
