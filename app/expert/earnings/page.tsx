import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentExpert } from '@/lib/expertAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

export default function ExpertEarningsPage() {
  // Cache Componentsではcookies()を読むコンポーネントをSuspense配下に置かないと、
  // レンダリング結果がCDNの共有キャッシュに乗ってしまい、別の専門家・未ログインの訪問者にも
  // 直前にアクセスした人の報酬額がそのまま配信される（instant=falseだけでは防げない）。
  return (
    <Suspense fallback={null}>
      <ExpertEarningsContent />
    </Suspense>
  );
}

async function ExpertEarningsContent() {
  const expert = await getCurrentExpert();
  if (!expert) redirect('/expert/login');

  const supabase = getSupabaseAdmin();
  const { data: answered } = await supabase
    .from('consultations')
    .select('id, created_at, expert_payout_jpy, payout_status')
    .eq('expert_id', expert.id)
    .eq('expert_status', 'answered')
    .order('created_at', { ascending: false });

  const rows = answered || [];
  const totalEarned = rows.reduce((sum, r) => sum + (r.expert_payout_jpy || 0), 0);
  const totalUnpaid = rows.filter((r) => r.payout_status === 'unpaid').reduce((sum, r) => sum + (r.expert_payout_jpy || 0), 0);

  const payoutsEnabled = !!expert.stripe_payouts_enabled;

  return (
    <div className="app-shell">
      <div className="header">
        <a className="btn-ghost" href="/expert/dashboard">← ダッシュボードへ</a>
        <div style={{ fontWeight: 700, fontSize: 16 }}>報酬</div>
      </div>
      <div className="main">
        <div className="card">
          <div className="muted">これまでの回答件数</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{rows.length}件</div>
          <div className="muted" style={{ marginTop: 8 }}>累計報酬額</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>¥{totalEarned.toLocaleString()}</div>
          <div className="muted" style={{ marginTop: 8 }}>未振込分</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--main)' }}>¥{totalUnpaid.toLocaleString()}</div>
        </div>
        <div className="noticebox" style={{ background: 'var(--sub)', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#1F4A3C' }}>
          {payoutsEnabled
            ? '振込は、運営が内容を確認のうえ、Stripe経由で毎月まとめて行います。振込状況についてのお問い合わせは運営までご連絡ください。'
            : <>振込を受け取るには、Stripeアカウントの登録（本人確認・振込先口座の入力）が必要です。<a href="/expert/profile">プロフィール編集画面</a>から設定してください。</>}
        </div>
        <div style={{ fontWeight: 700, marginTop: 12 }}>内訳</div>
        {rows.map((r) => (
          <div key={r.id} className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <span className="muted">{new Date(r.created_at).toLocaleDateString('ja-JP')}</span>
            <span className={r.payout_status === 'void' ? 'muted' : ''}>¥{(r.expert_payout_jpy || 0).toLocaleString()}</span>
            <span
              className={r.payout_status === 'paid' || r.payout_status === 'void' ? 'muted' : ''}
              style={{ color: r.payout_status === 'unpaid' ? 'var(--orange-text)' : undefined, fontWeight: 700 }}
            >
              {r.payout_status === 'paid' ? '振込済み' : r.payout_status === 'void' ? '返金により無効' : '未振込'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
