import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { EXPERT_PRICE_JPY } from '@/lib/config';
import { checkExpertRequestRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const { category, text, author_id, grade, gender } = await req.json();
  if (!category || !text || !text.trim() || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const ip = getClientIp(req);
  const limit = await checkExpertRequestRateLimit(author_id, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();
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
            product_data: { name: '公認心理師への相談（どうする先生）' },
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
