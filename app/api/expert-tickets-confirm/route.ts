import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { getCurrentMember } from '@/lib/memberAuth';

// Stripeチェックアウトから /account?tickets_session_id=... に戻ってきた直後に、
// その場でチケット残数に反映する確認エンドポイント。
// expert_ticket_purchases（stripe_session_idが主キー）にinsertできた時だけ
// 残数を加算することで、このエンドポイントが何度呼ばれても二重付与されないようにする。
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
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.metadata?.member_id !== member.id) {
      return NextResponse.json({ error: 'invalid session' }, { status: 403 });
    }
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: true, credited: false });
    }

    const credits = Number(session.metadata?.credits || 0);
    if (!credits) {
      return NextResponse.json({ ok: true, credited: false });
    }

    const supabase = getSupabaseAdmin();
    const { error: insertErr } = await supabase
      .from('expert_ticket_purchases')
      .insert({ stripe_session_id: session_id, member_id: member.id, credits });

    if (insertErr) {
      // 主キー重複（既にこのセッションで付与済み）は想定内なので、エラーにはしない。
      return NextResponse.json({ ok: true, credited: false, alreadyCredited: true });
    }

    const { data: current } = await supabase
      .from('members')
      .select('expert_credits')
      .eq('id', member.id)
      .single();
    const newCredits = (current?.expert_credits || 0) + credits;
    await supabase.from('members').update({ expert_credits: newCredits }).eq('id', member.id);

    return NextResponse.json({ ok: true, credited: true, expert_credits: newCredits });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
