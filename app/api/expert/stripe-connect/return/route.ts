import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { fetchPayoutsEnabled } from '@/lib/stripeConnect';

// Stripeのオンボーディング画面から戻ってきたときの着地点。
// その場でStripe側の最新状態（振込を受け取れるようになったか）を取得し、
// experts.stripe_payouts_enabled に反映してからプロフィール編集画面へリダイレクトする。
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const expert = await getCurrentExpert();
  if (!expert || !expert.stripe_account_id) {
    return NextResponse.redirect(`${origin}/expert/profile`);
  }

  try {
    const enabled = await fetchPayoutsEnabled(expert.stripe_account_id);
    const supabase = getSupabaseAdmin();
    await supabase.from('experts').update({ stripe_payouts_enabled: enabled }).eq('id', expert.id);
  } catch {
    // 取得に失敗しても、ひとまずプロフィール編集画面に戻す（状態は未更新のまま残る）。
  }

  return NextResponse.redirect(`${origin}/expert/profile?stripe=done`);
}
