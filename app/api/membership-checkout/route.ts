import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getCurrentMember } from '@/lib/memberAuth';
import { MEMBERSHIP_PRICE_JPY } from '@/lib/config';

// 読み放題会員（月¥800のサブスクリプション）の決済開始。
// アカウント（members、メール／パスワードでログイン）単位の会員登録であり、
// 匿名ブラウザID（author_id）とは別物。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
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
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: { name: '読み放題会員（どうする先生）' },
            unit_amount: MEMBERSHIP_PRICE_JPY,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/account?membership_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/account`,
      metadata: { member_id: member.id },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '決済の準備に失敗しました: ' + message }, { status: 502 });
  }
}
