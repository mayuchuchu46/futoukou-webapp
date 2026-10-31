// 先輩保護者（経験者）のcredential値。専門家（公認心理師など）とは別枠の制度だが、
// DBテーブル（experts）・ログイン・ダッシュボードは共通のため、「専門家一覧」
// 「専門家に相談する」等、資格を前提とした専門家向けの公開画面・有料チャット相談
// フローからは、このcredentialの行を除外する（2026-10-31、先輩保護者が専門家一覧
// に混ざって表示されていた不具合の指摘を受けて、該当箇所をまとめて除外）。
export const SENPAI_CREDENTIAL = '先輩保護者（経験者）';

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

// Stripeのアカウントがカードネットワーク側の都合で利用できなくなり（2026-10-31）、
// 乗り換え先の決済代行会社がまだ未確定の間、専門家・先輩保護者への質問機能を完全に
// 止めてしまうのではなく、「当面は利用者には無料で開放し、専門家・先輩保護者には
// ボランティアで協力してもらう」運用に切り替えるためのフラグ。
// trueの間は、/api/expert-checkoutが読み放題会員登録・Stripe決済を要求せず、
// 誰でも無料で専門家・先輩保護者に質問できる（expert_funding: 'volunteer'として記録）。
// 専門家への報酬記録（expert_payout_jpy）自体は通常どおり計算・保存されるため、
// 有償化した際に過去の貢献分を把握できる（実際に支払うかは別途判断）。
// 新しい決済代行会社が決まり、通常の有料運用に戻すタイミングでfalseに変更する。
export const EXPERT_VOLUNTEER_MODE = true;
