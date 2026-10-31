import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentExpert } from '@/lib/expertAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SENPAI_CREDENTIAL } from '@/lib/config';
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
    // review_statusで3状態を出し分ける（2026-10-13追加）。旧データ（review_statusが
    // まだ無い行）はpending相当として扱われるよう、DB側のdefaultを'pending'にしてある。
    const reviewStatus = expert.review_status || 'pending';

    if (reviewStatus === 'rejected') {
      return (
        <div className="app-shell">
          <div className="header">
            <a className="btn-ghost" href="/">← トップへ</a>
            <div className="header-row">
              <div style={{ fontWeight: 700, fontSize: 16 }}>専門家ダッシュボード</div>
            </div>
          </div>
          <div className="main">
            <div className="card">
              <div style={{ fontWeight: 700 }}>ご登録について</div>
              {/* 却下理由は登録証の不備・有効期限切れが多いが、それ以外の理由のケースもあるため、
                  具体例を書くと「自分は当てはまらないのに」と不正確・不自然に見える。個別の
                  やり取り（問い合わせ→回答）も発生させたくないので、理由を特定しない中立的な
                  定型文にした（2026-10-13、「不備・期限切れがない場合は何でと思われそう」との
                  指摘を受けて変更）。 */}
              <div className="qtext">
                この度は「どうする先生」専門家登録にご関心をお寄せいただき、ありがとうございました。
                ご提出いただいた内容を確認した結果、今回は登録要件を満たしていることを確認できなかったため、ご登録を見送らせていただくこととなりました。
              </div>
              {expert.review_note && (
                <div className="qtext" style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
                  {expert.review_note}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (reviewStatus === 'needs_fix') {
      return (
        <div className="app-shell">
          <div className="header">
            <a className="btn-ghost" href="/">← トップへ</a>
            <div className="header-row">
              <div style={{ fontWeight: 700, fontSize: 16 }}>専門家ダッシュボード</div>
            </div>
          </div>
          <div className="main">
            <div className="card">
              <div style={{ fontWeight: 700 }}>ご登録内容の修正をお願いします</div>
              <div className="qtext">
                ご登録いただいた内容を確認したところ、以下の点についてご修正・再提出をお願いしたく、ご連絡いたしました。
              </div>
              {expert.review_note && (
                <div className="qtext" style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
                  {expert.review_note}
                </div>
              )}
              <a className="btn-primary" href="/expert/profile">
                登録内容を修正する
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="app-shell">
        <div className="header">
          {/* 専門家ログイン周りのページには戻る手段が無かったため追加（2026-10-12）。 */}
          <a className="btn-ghost" href="/">← トップへ</a>
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
  // 指名された本人にのみ表示する。指名なし（null）の相談は誰でも回答できる……が、
  // 先輩保護者（経験者）は資格を前提とした¥600都度払い等の専門家向け有料相談の
  // 対象外（別の価格体系・ブランディングのため）。先輩保護者には出さない
  // （2026-10-31、専門家向けキューに先輩保護者が混在してしまう不具合を防ぐため）。
  const isSenpai = expert.credential === SENPAI_CREDENTIAL;
  const pending = isSenpai
    ? []
    : (
        await supabase
          .from('consultations')
          .select('*')
          .eq('request_type', 'expert')
          .eq('paid', true)
          .eq('expert_status', 'pending')
          .or(`requested_expert_id.is.null,requested_expert_id.eq.${expert.id}`)
          .order('created_at', { ascending: true })
      ).data;

  const { data: answeredByMe } = await supabase
    .from('consultations')
    .select('*')
    .eq('expert_id', expert.id)
    .eq('expert_status', 'answered')
    .order('created_at', { ascending: false })
    .limit(20);

  return <DashboardClient expert={expert} pending={pending || []} answeredByMe={answeredByMe || []} />;
}
