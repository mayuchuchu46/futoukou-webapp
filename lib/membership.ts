// 読み放題会員（月¥800のStripeサブスクリプション）の有効判定。
//
// 以前は「専門家への都度質問（¥500）を一度払うと30日間読み放題」という
// 1階建てのモデルで、匿名ブラウザID（author_id）単位の expert_memberships
// テーブルで管理していた。2026-10-10 決定の価格体系では、
// 「月¥800の読み放題会員（サブスク）」と「会員限定・都度¥500の専門家質問」の
// 2階建てになったため、会員（ログインアカウント = members テーブル）単位の
// サブスク状態で判定する方式に変更した。
//
// members.subscription_status は、
// - 決済直後：/api/membership-confirm（Stripeチェックアウトからの戻り時）
// - その後の更新・解約：/api/stripe/webhook（Stripe Webhook）
// で同期する。
export function isSubscriptionActive(
  member: { subscription_status?: string | null } | null | undefined
): boolean {
  return member?.subscription_status === 'active';
}
