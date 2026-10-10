import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { EXPERT_COOKIE_NAME } from '@/lib/expertAuth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: expert } = await supabase
    .from('experts')
    .select('id, password_hash')
    .eq('email', email)
    .maybeSingle();

  if (!expert || !(await bcrypt.compare(password, expert.password_hash))) {
    return NextResponse.json({ error: 'メールアドレスまたはパスワードが違います' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(EXPERT_COOKIE_NAME, expert.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
