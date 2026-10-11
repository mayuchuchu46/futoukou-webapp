import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

// 専門家への都度質問（¥500、一回払い）の決済確認。
// 読み放題特典の付与はここでは行わない。読み放題は別建ての会員登録（月¥800の
// サブスク、/api/membership-checkout・/api/membership-confirm）側の責務。
export async function POST(req: NextRequest) {
  const { session_id, consultation_id } = await req.json();
  if (!session_id || !consultation_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: true, paid: false });
    }

    const supabase = getSupabaseAdmin();
    await supabase.from('consultations').update({ paid: true }).eq('id', consultation_id);

    return NextResponse.json({ ok: true, paid: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
