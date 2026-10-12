import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { MEMBER_COOKIE_NAME } from '@/lib/memberAuth';

// 「お知らせ・メルマガを受け取る」の同意を、登録後にアカウントページから
// いつでもON/OFFできるようにするためのエンドポイント（2026-10-12追加）。
// 配信機能自体は未実装で、現時点では同意の記録のみを更新する。
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get(MEMBER_COOKIE_NAME)?.value;
  if (!memberId) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { optIn } = await req.json();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('members')
    .update({ newsletter_opt_in: !!optIn })
    .eq('id', memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
