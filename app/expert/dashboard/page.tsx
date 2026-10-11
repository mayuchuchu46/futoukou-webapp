import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentExpert } from '@/lib/expertAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export default function ExpertDashboardPage() {
  // Cache Componentsではcookies()を読むコンポーネントをSuspense配下に置かないと、
  // レンダリング結果がCDNの共有キャッシュに乗ってしまい、別の専門家・未ログインの訪問者にも
  // 直前にアクセスした人の内容がそのまま配信される（instant=falseだけでは防げない）。
  return (
    <Suspense fallback={null}>
      <ExpertDashboardContent />
    </Suspense>
  );
}

async function ExpertDashboardContent() {
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
  // 利用者が専門家一覧から名前を指名して質問した相談（requested_expert_id）は、
  // 指名された本人にのみ表示する。指名なし（null）の相談は誰でも回答できる。
  const { data: pending } = await supabase
    .from('consultations')
    .select('*')
    .eq('request_type', 'expert')
    .eq('paid', true)
    .eq('expert_status', 'pending')
    .or(`requested_expert_id.is.null,requested_expert_id.eq.${expert.id}`)
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
