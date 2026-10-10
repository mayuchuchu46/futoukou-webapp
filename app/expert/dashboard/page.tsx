import { redirect } from 'next/navigation';
import { getCurrentExpert } from '@/lib/expertAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

// ログイン中の専門家ごとに内容が変わるページなので、プリレンダーせず常に動的に実行する
export const instant = false;

export default async function ExpertDashboardPage() {
  const expert = await getCurrentExpert();
  if (!expert) redirect('/expert/login');

  if (!expert.verified) {
    return (
      <div className="app-shell">
        <div className="header">
          <div className="header-row">
            <div style={{ fontWeight: 700, fontSize: 16 }}>専門家ダッシュボード</div>
          </div>
        </div>
        <div className="main">
          <div className="card">
            <div style={{ fontWeight: 700 }}>本人確認中です</div>
            <div className="qtext">
              ご登録いただいた資格情報を、運営が確認しています。確認が完了するまで、有料相談への回答や報酬の受け取りはできません。確認が完了すると、このページから相談への回答ができるようになります。
            </div>
          </div>
        </div>
      </div>
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: pending } = await supabase
    .from('consultations')
    .select('*')
    .eq('request_type', 'expert')
    .eq('paid', true)
    .eq('expert_status', 'pending')
    .order('created_at', { ascending: true });

  const { data: answeredByMe } = await supabase
    .from('consultations')
    .select('*')
    .eq('expert_id', expert.id)
    .eq('expert_status', 'answered')
    .order('created_at', { ascending: false })
    .limit(20);

  return <DashboardClient expert={expert} pending={pending || []} answeredByMe={answeredByMe || []} />;
}
