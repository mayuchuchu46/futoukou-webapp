import { getSupabaseAdmin } from '@/lib/supabase';
import AdminClient from './AdminClient';

// 管理者ごとに内容が変わるわけではないが、常に最新のDB状態を見る必要があるページ
export const instant = false;

export default async function AdminPage() {
  const supabase = getSupabaseAdmin();

  const { data: unverifiedExperts } = await supabase
    .from('experts')
    .select('id, name, email, credential, license_number, created_at')
    .eq('verified', false)
    .order('created_at', { ascending: true });

  const { data: recentConsultations } = await supabase
    .from('consultations')
    .select('id, category, question, author_id, hidden, request_type, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const { data: overdueExpertRequests } = await supabase
    .from('consultations')
    .select('id, question, price_jpy, created_at, stripe_session_id')
    .eq('request_type', 'expert')
    .eq('paid', true)
    .eq('expert_status', 'pending')
    .eq('refunded', false)
    .lt('created_at', fiveDaysAgo)
    .order('created_at', { ascending: true });

  return (
    <AdminClient
      unverifiedExperts={unverifiedExperts || []}
      recentConsultations={recentConsultations || []}
      overdueExpertRequests={overdueExpertRequests || []}
    />
  );
}
