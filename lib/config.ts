// 先輩保護者（経験者）のcredential値。専門家（公認心理師など）とは別枠の制度だが、
// DBテーブル（experts）・ログイン・ダッシュボードは共通のため、「専門家一覧」
// 「専門家に相談する」等、資格を前提とした専門家向けの公開画面・有料チャット相談
// フローからは、このcredentialの行を除外する（2026-10-31、先輩保護者が専門家一覧
// に混ざって表示されていた不具合の指摘を受けて、該当箇所をまとめて除外）。
export const SENPAI_CREDENTIAL = '先輩保護者（経験者）';

// 専門家への質問について。
// 2026-10-11〜10-31は「読み放題会員限定・月1回無料／チケット6回¥3000／都度¥600、
// 専門家への報酬は一律¥400」という価格体系だったが、2026-11-01に恒久的に無料化した
// （質問する・回答するのどちらも無料。専門家・先輩保護者にとっての対価は、回答に
// 付くプロフィールへの誘導＝宣伝効果。回答を読むには読み放題会員登録が必要という
// 部分だけは残る）。EXPERT_PRICE_JPY・EXPERT_PAYOUT_JPY・チケット関連の定数、
// lib/expertQuota.tsの財源判定は、この旧モデルの名残で、現在どこからも呼ばれていない
// （過去にその価格体系で発生した実際の報酬の記録・振込確認のためだけに残している。
// app/expert/earnings/page.tsx参照）。
export const EXPERT_PRICE_JPY = Number(process.env.EXPERT_PRICE_JPY || 600);
export const EXPERT_PAYOUT_JPY = Number(process.env.EXPERT_PAYOUT_JPY || 400);

export const EXPERT_TICKET_PACK_PRICE_JPY = Number(process.env.EXPERT_TICKET_PACK_PRICE_JPY || 3000);
export const EXPERT_TICKET_PACK_COUNT = Number(process.env.EXPERT_TICKET_PACK_COUNT || 6);

// 読み放題会員（月額サブスク）。質問・回答自体は無料になったが、回答を読むにはこの
// 会員登録が必要（将来的に有料化する想定。現在はEXPERT_VOLUNTEER_MODE中のため無料）。
export const MEMBERSHIP_PRICE_JPY = Number(process.env.MEMBERSHIP_PRICE_JPY || 800);

// 旧価格体系（都度払い／チケット／無料枠）で発生した報酬の金額。現在の
// 'volunteer'（恒久的に無料）な相談には使われない（app/api/expert/answer/route.ts
// 参照）。
export function expertPayout(_priceJpy: number) {
  return EXPERT_PAYOUT_JPY;
}

// 無料AI相談を累計でこの回数使った利用者に、専門家への相談を案内する閾値。
// 実利用データに基づく数値ではなく仮説（2026-10-11時点）。公開後のログを見て調整する。
export const AI_USAGE_UPSELL_THRESHOLD = Number(process.env.AI_USAGE_UPSELL_THRESHOLD || 3);

// Stripeのアカウントがカードネットワーク側の都合で利用できなくなっており（2026-10-31〜）、
// 乗り換え先の決済代行会社の準備が整うまでの間、読み放題会員登録（/api/membership-checkout）
// をStripe決済なしでその場で有効化するためのフラグ。trueの間、会員登録ボタンを押すと
// Stripeを経由せずsubscription_status='active'になる（＝今だけ無料で読み放題会員になれる）。
// 新しい決済代行会社が決まり、会員登録を通常の有料運用に戻すタイミングでfalseに変更する。
//
// 以前はこのフラグが「専門家への質問を無料開放する」判定にも使われていたが、2026-11-01に
// 専門家への質問・回答そのものを恒久的に無料化したことで、その判定は不要になった
// （Stripeの復旧状況に関係なく、質問・回答は常に無料。app/api/expert-checkout/route.ts
// 参照）。このフラグが指すのは今はもう「読み放題会員登録のStripeバイパス」だけ。
export const EXPERT_VOLUNTEER_MODE = true;
