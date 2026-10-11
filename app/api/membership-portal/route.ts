import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getCurrentMember } from '@/lib/memberAuth';

// 支払い方法の変更・解約は、独自UIを作らずStripeのカスタマーポータルに任せる。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member || !member.stripe_customer_id) {
    return NextResponse.json({ error: '会員登録情報が見つかりません' }, { status: 400 });
  }

  const origin = req.nextUrl.origin;

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: member.stripe_customer_id,
      return_url: `${origin}/account`,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '管理ページの準備に失敗しました: ' + message }, { status: 502 });
  }
}
