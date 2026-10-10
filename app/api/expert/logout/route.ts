import { NextResponse } from 'next/server';
import { EXPERT_COOKIE_NAME } from '@/lib/expertAuth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(EXPERT_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return res;
}
