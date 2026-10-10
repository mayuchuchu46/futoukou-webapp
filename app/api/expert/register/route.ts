import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { EXPERT_COOKIE_NAME } from '@/lib/expertAuth';

export async function POST(req: NextRequest) {
  const { email, password, name, credential, bio, license_number } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'メールアドレス・パスワード・名前は必須です' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 });
  }
  if (!license_number || !license_number.trim()) {
    return NextResponse.json({ error: '資格の登録番号を入力してください（運営が本人確認のため使用します）' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('experts').select('id').eq('email', email).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data: expert, error } = await supabase
    .from('experts')
    .insert({
      email,
      password_hash,
      name,
      credential: credential || '公認心理師',
      bio: bio || '',
      license_number: license_number.trim(),
      verified: false,
    })
    .select('id')
    .single();

  if (error || !expert) {
    return NextResponse.json({ error: error?.message || '登録に失敗しました' }, { status: 500 });
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
