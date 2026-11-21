import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { EXPERT_COOKIE_NAME } from '@/lib/expertAuth';

// 専門家・経験者向けパスワード再設定の2通目。app/api/account/reset-password と
// 同じ考え方（2026-11-21追加）。
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: '無効なリンクです' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: expert } = await supabase
    .from('experts')
    .select('id, reset_token_expires_at')
    .eq('reset_token', token)
    .maybeSingle();

  if (!expert || !expert.reset_token_expires_at || new Date(expert.reset_token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'リンクの有効期限が切れています。もう一度パスワード再設定をお申し込みください' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { error } = await supabase
    .from('experts')
    .update({ password_hash, reset_token: null, reset_token_expires_at: null })
    .eq('id', expert.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
