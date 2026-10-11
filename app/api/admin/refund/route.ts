import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from('consultations')
    .select('id, stripe_session_id, paid, refunded, expert_status, expert_payout_jpy, payout_status')
    .eq('id', id)
    .single();

  if (!row || !row.stripe_session_id) {
    return NextResponse.json({ error: '決済情報が見つかりません' }, { status: 400 });
  }
  if (!row.paid) {
    return NextResponse.json({ error: 'この相談は決済が完了していません' }, { status: 400 });
  }
  if (row.refunded) {
    return NextResponse.json({ error: 'この相談は既に返金済みです' }, { status: 409 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(row.stripe_session_id);
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (!paymentIntentId) {
      return NextResponse.json({ error: '決済情報（payment_intent）が見つかりません' }, { status: 400 });
    }
    await stripe.refunds.create({ payment_intent: paymentIntentId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '返金処理に失敗しました: ' + message }, { status: 502 });
  }

  // 利用者へ返金した分、運営が専門家にも報酬を払うと「返金額＋報酬」を運営が負担する
  // 逆ざやになるため、返金と同時に専門家への報酬（未払いの場合のみ）も無効化する。
  // 既に振込済み（payout_status: 'paid'）の場合は、運営判断で別途対応するため変更しない。
  const update: Record<string, unknown> = { refunded: true };
  if (row.expert_status === 'answered' && row.payout_status !== 'paid') {
    update.expert_payout_jpy = 0;
    update.payout_status = 'void';
  }
  await supabase.from('consultations').update(update).eq('id', id);
  return NextResponse.json({ ok: true });
}
