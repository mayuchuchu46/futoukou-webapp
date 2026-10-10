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
    .select('id, stripe_session_id, paid, refunded')
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

  await supabase.from('consultations').update({ refunded: true }).eq('id', id);
  return NextResponse.json({ ok: true });
}
