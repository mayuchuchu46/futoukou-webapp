import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';

// 画面側（クライアントコンポーネント）が「ログイン中か」「読み放題会員として有効か」を
// 判定するための軽量エンドポイント。動的なRoute Handlerなので、ここでCookieを読んでも
// CDNキャッシュ汚染の心配はない（lib/consultations.ts のコメント参照）。
export async function GET() {
  const member = await getCurrentMember();
  return NextResponse.json({
    loggedIn: !!member,
    active: isSubscriptionActive(member),
    email: member?.email || null,
  });
}
