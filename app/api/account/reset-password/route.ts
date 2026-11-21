import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { MEMBER_COOKIE_NAME, MEMBER_COOKIE_MAX_AGE } from '@/lib/memberAuth';

// 会員向けパスワード再設定の2通目：メール内のリンクのトークンと新しい
// パスワードを受け取り、有効なトークンならpassword_hashを更新する
// （2026-11-21追加）。更新後はトークンを使い捨てにするためNULLに戻し、
// そのままログイン状態にしてログインの手間を減らす。
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: '無効なリンクです' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: member } = await supabase
    .from('members')
    .select('id, reset_token_expires_at')
    .eq('reset_token', token)
    .maybeSingle();

  if (!member || !member.reset_token_expires_at || new Date(member.reset_token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'リンクの有効期限が切れています。もう一度パスワード再設定をお申し込みください' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { error } = await supabase
    .from('members')
    .update({ password_hash, reset_token: null, reset_token_expires_at: null })
    .eq('id', member.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
