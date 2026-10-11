import { isSubscriptionActive } from '@/lib/membership';
import type { CurrentMember } from '@/lib/memberAuth';

// 専門家への質問は、読み放題会員（アクティブなサブスク）が次の3通りで利用できる
// （2026-10-11 価格体系見直し。lib/config.tsのコメント参照）。
// 1. 月1回、無料（会員のサブスク更新周期ごとに1回）
// 2. チケット消費（6回¥3000パックの残数）
// 3. 都度¥600払い
//
// 「月1回無料」の判定：members.last_free_expert_question_period_end に、無料枠を
// 使った時点のsubscription_current_period_endを記録しておく。現在のperiod_endが
// それより新しければ（＝サブスクが更新された＝新しい周期に入った）、無料枠が復活している。
type MemberQuota = Pick<
  CurrentMember,
  'subscription_status' | 'subscription_current_period_end' | 'expert_credits' | 'last_free_expert_question_period_end'
>;

export function hasFreeMonthlyQuestion(member: MemberQuota | null | undefined): boolean {
  if (!isSubscriptionActive(member)) return false;
  if (!member?.subscription_current_period_end) return false;
  if (!member.last_free_expert_question_period_end) return true;
  return (
    new Date(member.subscription_current_period_end).getTime() >
    new Date(member.last_free_expert_question_period_end).getTime()
  );
}

export type ExpertFunding = 'free_monthly' | 'ticket' | 'paid';

// 質問時点でどの財源を使うか（優先順位：無料枠 → チケット → 都度払い）。
export function resolveExpertFunding(member: MemberQuota | null | undefined): ExpertFunding {
  if (hasFreeMonthlyQuestion(member)) return 'free_monthly';
  if ((member?.expert_credits || 0) > 0) return 'ticket';
  return 'paid';
}
