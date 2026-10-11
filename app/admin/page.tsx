import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { deleteExpiredLicenseDocs } from '@/lib/expertLicenseDoc';
import AdminClient from './AdminClient';

// Cache Componentsではcookies()を読むコンポーネントをSuspense配下に置かないと、
// レンダリング結果がCDNの共有キャッシュに乗ってしまい、未ログインの訪問者にも
// 直前にアクセスした内容がそのまま配信される（instant=falseだけでは防げない）。
export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageContent />
    </Suspense>
  );
}

async function AdminPageContent() {
  const admin = await isAdmin();
  if (!admin) redirect('/admin/login');

  const supabase = getSupabaseAdmin();

  // 本人確認完了から一定期間が過ぎた登録証（本人確認書類）を自動削除する。
  // 専用のスケジューラは設けず、運営がこの管理画面を開いたタイミングで実行する。
  await deleteExpiredLicenseDocs();

  const { data: unverifiedExperts } = await supabase
    .from('experts')
    .select('id, name, email, credential, license_number, license_doc_path, created_at')
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

  const { data: sidebarBanner } = await supabase
    .from('sidebar_banners')
    .select('enabled, image_url, link_url, alt_text')
    .eq('id', 'default')
    .single();

  // 専門家の回答は送信後すぐに公開されるため、運営が後から質をチェックできるよう、
  // 直近の回答を一覧表示する（事前審査はしない＝公開を遅らせない）。
  const { data: recentExpertAnswersRaw } = await supabase
    .from('consultations')
    .select('id, question, expert_answer, expert_answer_helpful, created_at, experts(name, credential)')
    .eq('request_type', 'expert')
    .eq('expert_status', 'answered')
    .order('created_at', { ascending: false })
    .limit(30);

  // supabase-jsはこの形のjoinを配列型として推論するため、1件のオブジェクト（またはnull）に正規化する。
  const recentExpertAnswers = (recentExpertAnswersRaw || []).map((row) => ({
    ...row,
    experts: Array.isArray(row.experts) ? row.experts[0] || null : row.experts,
  }));

  return (
    <AdminClient
      unverifiedExperts={unverifiedExperts || []}
      recentConsultations={recentConsultations || []}
      overdueExpertRequests={overdueExpertRequests || []}
      recentExpertAnswers={recentExpertAnswers}
      initialSidebarBanner={
        sidebarBanner || { enabled: false, image_url: '', link_url: '', alt_text: '' }
      }
    />
  );
}
