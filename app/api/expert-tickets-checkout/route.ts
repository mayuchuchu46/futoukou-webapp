import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { EXPERT_TICKET_PACK_PRICE_JPY, EXPERT_TICKET_PACK_COUNT } from '@/lib/config';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';

// 専門家への質問チケット（6回¥3000パック）の購入。月1回の無料枠を使い切った会員が、
// 都度¥600より割安にまとめ買いできる（読み放題会員限定。lib/config.ts参照）。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member || !isSubscriptionActive(member)) {
    return NextResponse.json(
      { error: 'チケットの購入は、読み放題会員（月¥800）の登録が必要です', needsMembership: true },
      { status: 403 }
    );
  }

  const supabase = getSupabaseAdmin();
  const origin = req.nextUrl.origin;

  try {
    const stripe = getStripe();

    let customerId = member.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: member.email,
        metadata: { member_id: member.id },
      });
      customerId = customer.id;
      await supabase.from('members').update({ stripe_customer_id: customerId }).eq('id', member.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: { name: `専門家への質問チケット${EXPERT_TICKET_PACK_COUNT}回分（どうする先生）` },
            unit_amount: EXPERT_TICKET_PACK_PRICE_JPY,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/account?tickets_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/account`,
      metadata: { member_id: member.id, credits: String(EXPERT_TICKET_PACK_COUNT) },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '決済の準備に失敗しました: ' + message }, { status: 502 });
  }
}
