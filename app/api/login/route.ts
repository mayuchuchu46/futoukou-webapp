import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password, next } = await req.json();

  if (!process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'サーバー側でパスワードが設定されていません' }, { status: 500 });
  }

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, next: next || '/' });
  res.cookies.set('dsk_auth', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30日
  });
  return res;
}
