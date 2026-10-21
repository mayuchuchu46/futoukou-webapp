import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { MEMBER_COOKIE_NAME, MEMBER_COOKIE_MAX_AGE } from '@/lib/memberAuth';

export async function POST(req: NextRequest) {
  const { email, password, name, newsletterOptIn, uid } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('members').select('id').eq('email', email).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  // newsletter_opt_in は「お知らせ・メルマガを受け取る」チェックボックスへの同意。
  // 配信機能自体は未実装だが、特定電子メール法のオプトイン要件に合わせ、同意の記録は
  // 登録時点から取っておく（デフォルトOFF、2026-10-12）。
  const { data: member, error } = await supabase
    .from('members')
    .insert({ email, password_hash, name: name || null, newsletter_opt_in: !!newsletterOptIn })
    .select('id')
    .single();

  if (error || !member) {
    return NextResponse.json({ error: error?.message || '登録に失敗しました' }, { status: 500 });
  }

  // 会員登録前に匿名（dsk_uid）で投稿した相談を、この会員アカウントに紐付ける。
  if (uid && typeof uid === 'string' && uid.startsWith('u_')) {
    await supabase
      .from('consultations')
      .update({ member_id: member.id })
      .eq('author_id', uid)
      .is('member_id', null);
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
