// 有料の「専門家に相談」機能の設定。
// 支払い自体はStripeで受け取るが、専門家への報酬は今のところ手動振込で管理する
// （Stripe Connect等の自動振込は専門家の人数が増えてから別途検討する）。

// 専門家への質問は、読み放題会員（lib/membership.ts参照）が次の3通りで利用できる
// （2026-10-11 価格体系見直し）。
// 1. 月1回、無料（会員特典として会員のサブスク更新周期ごとに1回。ユーザー負担は¥0だが、
//    専門家への報酬¥400は運営が負担する＝「無料」はユーザー視点の話で、原価がかかっている）
// 2. チケット（6回¥3000＝実質1回¥500。単発より割安）
// 3. 都度払い（1回¥600）
// どの経路で質問しても、専門家への報酬は一律¥400（lib/expertQuota.ts参照）。
export const EXPERT_PRICE_JPY = Number(process.env.EXPERT_PRICE_JPY || 600);
export const EXPERT_PAYOUT_JPY = Number(process.env.EXPERT_PAYOUT_JPY || 400); // 専門家への報酬（固定額。財源（都度払い／チケット／無料枠）によらず一律）

export const EXPERT_TICKET_PACK_PRICE_JPY = Number(process.env.EXPERT_TICKET_PACK_PRICE_JPY || 3000);
export const EXPERT_TICKET_PACK_COUNT = Number(process.env.EXPERT_TICKET_PACK_COUNT || 6);

// 読み放題会員（月額サブスク）。内訳：運営¥400 / 専門家¥400（都度質問とは別建て）。
export const MEMBERSHIP_PRICE_JPY = Number(process.env.MEMBERSHIP_PRICE_JPY || 800);

export function expertPayout(_priceJpy: number) {
  return EXPERT_PAYOUT_JPY;
}

// 無料AI相談を累計でこの回数使った利用者に、専門家への相談（有料）を案内する閾値。
// 実利用データに基づく数値ではなく仮説（2026-10-11時点）。公開後のログを見て調整する。
export const AI_USAGE_UPSELL_THRESHOLD = Number(process.env.AI_USAGE_UPSELL_THRESHOLD || 3);
