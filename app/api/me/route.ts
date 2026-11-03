import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';
import { isStripeConfigured } from '@/lib/stripe';
import { EXPERT_VOLUNTEER_MODE } from '@/lib/config';

// 画面側（クライアントコンポーネント）が「ログイン中か」「読み放題会員として有効か」
// 「決済機能（Stripe）が今使える状態か」を判定するための軽量エンドポイント。
// 動的なRoute Handlerなので、ここでCookieを読んでもCDNキャッシュ汚染の心配はない
// （lib/consultations.ts のコメント参照）。
//
// 2026-11-01、専門家への質問を恒久的に無料化したのに合わせて、質問時の財源判定
// （無料枠・チケット・都度払い¥600）に関わる値はここから削除した。質問する側は
// 誰でも無料になったため判定自体が不要（旧ロジックはlib/expertQuota.ts等に残っている
// が、呼び出し元がなくなった）。stripeConfiguredは読み放題会員登録（有料化予定）側で
// まだ使うため残している（app/expertlist/ExpertListClient.tsx参照）。
export async function GET() {
  const member = await getCurrentMember();
  return NextResponse.json({
    loggedIn: !!member,
    active: isSubscriptionActive(member),
    email: member?.email || null,
    stripeConfigured: isStripeConfigured(),
    // EXPERT_VOLUNTEER_MODE中は、stripeConfiguredがfalseでも会員登録自体は
    // （決済を挟まず）その場で無料で有効化される（/api/membership-checkout参照）。
    // app/account/MembershipPanel.tsxはこれを踏まえて「準備中」表示を出し分けて
    // いたが、/expertlist・/senpailistはstripeConfiguredだけを見ていたため、
    // 実際には登録できるのに「準備中・近日公開」と表示されてしまっていた
    // （2026-11-03、指摘を受けて追加・両ページを修正）。
    volunteerMode: EXPERT_VOLUNTEER_MODE,
  });
}
