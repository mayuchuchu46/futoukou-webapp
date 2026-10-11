// 専門家への報酬振込（Stripe Connect / Expressアカウント）まわりの共通処理。
//
// 専門家ごとにStripeの「Expressアカウント」を1つ持たせ、本人確認・振込先口座の入力は
// Stripeが用意するホスト型のオンボーディング画面（Account Link）で行ってもらう
// （運営側で口座番号等を扱わずに済むため、ExpressはCustomより運用負荷が小さい）。
// 実際の送金は運営が管理画面から「今回分を一括振込」を実行したタイミングでのみ行う
// （半自動：集計・送金候補の抽出は自動、実行は運営の操作をトリガーにする）。
import { getStripe } from '@/lib/stripe';

// 専門家のStripe Expressアカウントを作成する（未作成の場合のみ）。
// 作成済みのaccountIdがあればそれをそのまま返す。
export async function ensureExpertStripeAccount(expertId: string, email: string, existingAccountId: string | null): Promise<string> {
  if (existingAccountId) return existingAccountId;

  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'JP',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: { expert_id: expertId },
  });
  return account.id;
}

// Stripeのホスト型オンボーディング画面へのリンクを発行する。
// refreshUrl：リンクの有効期限切れ等で再度開き直す必要があるときの戻り先
// returnUrl：一通り入力を終えて（必ずしも完了していなくても）Stripe側から戻ってくる先
export async function createOnboardingLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
  return link.url;
}

// Stripe側の最新状態（振込を受け取れる状態になったか）を取得する。
export async function fetchPayoutsEnabled(accountId: string): Promise<boolean> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);
  return !!account.payouts_enabled;
}
