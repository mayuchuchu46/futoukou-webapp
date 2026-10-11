import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

// 読み放題会員（サブスクリプション）の更新・解約・支払い失敗を、以後も継続して
// 会員ステータスに反映するためのWebhook。/api/membership-confirm は決済直後の
// 一度きりの反映しか行わないため、次回更新や解約はこちらが唯一の反映経路になる。
//
// Stripeダッシュボード（開発者 > Webhook）で、このURL（/api/stripe/webhook）宛に
// customer.subscription.updated / customer.subscription.deleted を送るエンドポイントを
// 作成し、発行されたシークレットを環境変数 STRIPE_WEBHOOK_SECRET に設定してください。
// 未設定の間は、会員登録直後の反映（/api/membership-confirm）のみで動作する
// （＝次回更新・解約が自動反映されない）ので、本番公開前に必ず設定すること。
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET が設定されていません' }, { status: 500 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const status =
      sub.status === 'active' || sub.status === 'trialing'
        ? 'active'
        : sub.status === 'canceled'
          ? 'canceled'
          : sub.status; // past_due / unpaid / incomplete_expired 等はそのまま記録
    // current_period_end はサブスク直下ではなく各サブスクアイテム側にある
    // （/api/membership-confirm と同じ理由。1商品のみのサブスクなので先頭アイテムを見る）。
    const itemPeriodEnd = sub.items.data[0]?.current_period_end;
    const periodEnd = itemPeriodEnd ? new Date(itemPeriodEnd * 1000).toISOString() : null;

    const supabase = getSupabaseAdmin();
    await supabase
      .from('members')
      .update({ subscription_status: status, subscription_current_period_end: periodEnd })
      .eq('stripe_subscription_id', sub.id);
  }

  return NextResponse.json({ received: true });
}
