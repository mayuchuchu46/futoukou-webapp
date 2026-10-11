import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getCurrentMember } from '@/lib/memberAuth';

// Stripeチェックアウトから /account?membership_session_id=... に戻ってきた直後に、
// その場で会員ステータスを反映するための確認エンドポイント
// （以後の更新・解約の同期は /api/stripe/webhook が担当する）。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { session_id } = await req.json();
  if (!session_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    if (session.metadata?.member_id !== member.id) {
      return NextResponse.json({ error: 'invalid session' }, { status: 403 });
    }

    const subscription = session.subscription;
    if (!subscription || typeof subscription === 'string') {
      return NextResponse.json({ ok: true, active: false });
    }

    const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status;
    // Stripeの新しいAPIバージョンでは current_period_end はサブスク直下ではなく
    // 各サブスクアイテム側に付く（1商品のみのサブスクなので先頭アイテムを見れば良い）。
    const itemPeriodEnd = subscription.items.data[0]?.current_period_end;
    const periodEnd = itemPeriodEnd ? new Date(itemPeriodEnd * 1000).toISOString() : null;

    const supabase = getSupabaseAdmin();
    await supabase
      .from('members')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: status,
        subscription_current_period_end: periodEnd,
      })
      .eq('id', member.id);

    return NextResponse.json({ ok: true, active: status === 'active' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
