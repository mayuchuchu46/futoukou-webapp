import { cookies } from 'next/headers';
import { getSupabaseAdmin } from './supabase';

// 利用者（保護者）アカウントのログインCookie。
// 専門家ログイン（EXPERT_COOKIE_NAME）・管理画面ログインとは別の、独立したセッション。
const COOKIE_NAME = 'dsk_member_id';

export type CurrentMember = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
  expert_credits: number;
  last_free_expert_question_period_end: string | null;
  newsletter_opt_in: boolean;
};

export async function getCurrentMember(): Promise<CurrentMember | null> {
  const cookieStore = await cookies();
  const memberId = cookieStore.get(COOKIE_NAME)?.value;
  if (!memberId) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('members')
    .select(
      'id, email, name, created_at, stripe_customer_id, subscription_status, subscription_current_period_end, expert_credits, last_free_expert_question_period_end, newsletter_opt_in'
    )
    .eq('id', memberId)
    .single();
  return data || null;
}

export const MEMBER_COOKIE_NAME = COOKIE_NAME;
export const MEMBER_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90日
