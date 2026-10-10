import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { MEMBER_COOKIE_NAME, MEMBER_COOKIE_MAX_AGE } from '@/lib/memberAuth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: member } = await supabase
    .from('members')
    .select('id, password_hash')
    .eq('email', email)
    .maybeSingle();

  if (!member || !(await bcrypt.compare(password, member.password_hash))) {
    return NextResponse.json({ error: 'メールアドレスまたはパスワードが違います' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE_NAME, member.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MEMBER_COOKIE_MAX_AGE,
  });
  return res;
}
