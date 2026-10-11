import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';
import { hasFreeMonthlyQuestion } from '@/lib/expertQuota';
import { EXPERT_PRICE_JPY, EXPERT_TICKET_PACK_PRICE_JPY, EXPERT_TICKET_PACK_COUNT } from '@/lib/config';
import { isStripeConfigured } from '@/lib/stripe';

// 画面側（クライアントコンポーネント）が「ログイン中か」「読み放題会員として有効か」
// 「専門家への質問が今どの財源で利用できるか」を判定するための軽量エンドポイント。
// 価格はサーバー側のlib/config.ts（非NEXT_PUBLIC環境変数）の値をここで返すことで、
// クライアントバンドルに直接埋め込まれない値も画面に正しく表示できるようにする。
// 動的なRoute Handlerなので、ここでCookieを読んでもCDNキャッシュ汚染の心配はない
// （lib/consultations.ts のコメント参照）。
export async function GET() {
  const member = await getCurrentMember();
  return NextResponse.json({
    loggedIn: !!member,
    active: isSubscriptionActive(member),
    email: member?.email || null,
    freeQuestionAvailable: hasFreeMonthlyQuestion(member),
    expertCredits: member?.expert_credits || 0,
    expertPriceJpy: EXPERT_PRICE_JPY,
    ticketPackPriceJpy: EXPERT_TICKET_PACK_PRICE_JPY,
    ticketPackCount: EXPERT_TICKET_PACK_COUNT,
    stripeConfigured: isStripeConfigured(),
  });
}
