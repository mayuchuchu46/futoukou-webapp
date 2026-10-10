// 有料の「公認心理師に相談」機能の設定。
// 支払い自体はStripeで受け取るが、専門家への報酬は今のところ手動振込で管理する
// （Stripe Connect等の自動振込は専門家の人数が増えてから別途検討する）。

export const EXPERT_PRICE_JPY = Number(process.env.EXPERT_PRICE_JPY || 500);
export const EXPERT_PAYOUT_JPY = Number(process.env.EXPERT_PAYOUT_JPY || 400); // 専門家への報酬（固定額。残りが運営分）

export function expertPayout(_priceJpy: number) {
  return EXPERT_PAYOUT_JPY;
}

// 無料AI相談を累計でこの回数使った利用者に、専門家への相談（有料）を案内する閾値。
// 実利用データに基づく数値ではなく仮説（2026-10-11時点）。公開後のログを見て調整する。
export const AI_USAGE_UPSELL_THRESHOLD = Number(process.env.AI_USAGE_UPSELL_THRESHOLD || 3);
