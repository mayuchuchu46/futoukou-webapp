'use client';

import { useState } from 'react';
import { CATS } from '@/lib/categories';

type UnverifiedExpert = {
  id: string;
  name: string;
  display_name?: string | null;
  email: string;
  credential: string;
  license_number: string;
  license_doc_path: string | null;
  verification_method?: 'upload' | 'call'; // 2026-10-30追加
  specialty_categories?: string[]; // 2026-10-30追加
  experienced_school_names?: string[]; // 2026-10-31追加（先輩保護者が話せる学校名）
  review_status?: string; // 'pending' | 'needs_fix'（一覧に残るのはこの2つ。rejectedは一覧から除外済み）
  review_note?: string | null;
  created_at: string;
};

type VerifiedExpert = {
  id: string;
  name: string;
  display_name?: string | null;
  email: string;
  credential: string;
  created_at: string;
};

type RecentConsultation = {
  id: string;
  category: string;
  question: string;
  author_id: string;
  hidden: boolean;
  request_type: 'ai' | 'expert';
  created_at: string;
  reports?: number;
};

type ReportedDailyComment = {
  id: string;
  question_slug: string;
  value: string;
  comment: string;
  comment_reports: number;
  comment_hidden: boolean;
  created_at: string;
};

type OverdueExpertRequest = {
  id: string;
  question: string;
  price_jpy: number | null;
  created_at: string;
  stripe_session_id: string | null;
};

type SidebarBanner = {
  enabled: boolean;
  image_url: string;
  link_url: string;
  alt_text: string;
};

type UnpaidPayoutSummary = {
  count: number;
  total: number;
};

type AiLimitHitSummary = {
  hitCount: number;
  uniqueUserCount: number;
};

// 希死念慮・自傷等の安全上書き（crisis_detected）が実際にどれくらいの頻度で発動しているか
// を把握するための集計。「AIがいつもその手の回答ばかりになっていないか（過剰発動では
// ないか）」を確認したいとの要望を受けて追加した（2026-10-14）。自動投稿（auto-seed）分は
// 実際のユーザーの相談とは別物なので、分けて数える。
type CrisisDetectedSummary = {
  realCount: number;
  realTotal: number;
  autoSeedCount: number;
  autoSeedTotal: number;
};

// 閲覧数の上位表示用（2026-10-14追加）。
type TopViewedConsultation = {
  id: string;
  question: string;
  category: string;
  views: number;
  request_type: 'ai' | 'expert';
};

type PayoutResult = {
  paid: { expertName: string; amount: number; count: number }[];
  skipped: { expertName: string; amount: number; count: number; reason: string }[];
  errors: { expertName: string; message: string }[];
};

type RecentExpertAnswer = {
  id: string;
  question: string;
  expert_answer: string | null;
  expert_answer_helpful: boolean | null;
  created_at: string;
  experts: { name: string; credential: string } | null;
};

export default function AdminClient({
  unverifiedExperts,
  verifiedExperts,
  recentConsultations,
  reportedConsultations,
  reportedDailyComments,
  overdueExpertRequests,
  recentExpertAnswers,
  initialSidebarBanner,
  unpaidPayoutSummary,
  aiLimitHitSummary,
  crisisDetectedSummary,
  totalViews,
  topViewedConsultations,
  stripeConfigured,
}: {
  unverifiedExperts: UnverifiedExpert[];
  verifiedExperts: VerifiedExpert[];
  recentConsultations: RecentConsultation[];
  reportedConsultations: RecentConsultation[];
  reportedDailyComments: ReportedDailyComment[];
  overdueExpertRequests: OverdueExpertRequest[];
  recentExpertAnswers: RecentExpertAnswer[];
  initialSidebarBanner: SidebarBanner;
  unpaidPayoutSummary: UnpaidPayoutSummary;
  aiLimitHitSummary: AiLimitHitSummary;
  crisisDetectedSummary: CrisisDetectedSummary;
  totalViews: number;
  topViewedConsultations: TopViewedConsultation[];
  stripeConfigured: boolean;
}) {
  const [experts, setExperts] = useState(unverifiedExperts);
  const [consultations, setConsultations] = useState(recentConsultations);
  const [reported, setReported] = useState(reportedConsultations);
  const [reportedComments, setReportedComments] = useState(reportedDailyComments);
  const [overdue, setOverdue] = useState(overdueExpertRequests);
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState(initialSidebarBanner);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [payoutSummary, setPayoutSummary] = useState(unpaidPayoutSummary);
  const [payoutRunning, setPayoutRunning] = useState(false);
  const [payoutResult, setPayoutResult] = useState<PayoutResult | null>(null);
  const [payoutError, setPayoutError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  async function viewLicenseDoc(id: string) {
    setBusy(id);
    const res = await fetch('/api/admin/experts/doc-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expert_id: id }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      alert(data.error || '取得に失敗しました');
      return;
    }
    window.open(data.url, '_blank', 'noopener,noreferrer');
  }

  async function verifyExpert(id: string) {
    setBusy(id);
    const res = await fetch('/api/admin/experts/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expert_id: id, action: 'approve' }),
    });
    setBusy(null);
    if (res.ok) {
      setExperts((list) => list.filter((e) => e.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || '失敗しました');
    }
  }

  // 差し戻し：何を直してほしいかが本人に伝わらないと再提出できないため、理由の入力を必須にする。
  // 却下：却下理由は登録証の不備・期限切れなど事務的なものが大半で、ダッシュボード側に
  // 既に定型文があるため、本人への問い合わせを誘発する個別の理由入力は求めない
  // （2026-10-13、「理由を聞いて答える流れはやめたい」との指摘を受けて変更）。
  // 運営の内部メモとして一言残したい場合だけ、任意でnoteを入力できる。
  async function reviewExpert(id: string, action: 'needs_fix' | 'reject') {
    let note = '';
    if (action === 'needs_fix') {
      const input = window.prompt(
        '差し戻しの理由（本人に表示されます）を入力してください\n例：登録証の画像が不鮮明なため、再度ご提出ください',
        ''
      );
      if (input === null) return; // キャンセル
      if (!input.trim()) {
        alert('差し戻しには、本人に伝える理由の入力が必要です');
        return;
      }
      note = input.trim();
    }
    // reject時の確認ダイアログは呼び出し元（却下するボタンのonClick）で既に出しているので、ここでは出さない。
    setBusy(id);
    const res = await fetch('/api/admin/experts/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expert_id: id, action, note: note || undefined }),
    });
    setBusy(null);
    if (res.ok) {
      setExperts((list) => (action === 'reject' ? list.filter((e) => e.id !== id) : list));
      if (action === 'needs_fix') {
        setExperts((list) =>
          list.map((e) => (e.id === id ? { ...e, review_status: 'needs_fix', review_note: note } : e))
        );
      }
    } else {
      const data = await res.json();
      alert(data.error || '失敗しました');
    }
  }

  async function toggleHidden(id: string, hidden: boolean) {
    setBusy(id);
    const res = await fetch('/api/admin/consultations/hide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, hidden }),
    });
    setBusy(null);
    if (res.ok) {
      setConsultations((list) => list.map((c) => (c.id === id ? { ...c, hidden } : c)));
      setReported((list) => list.map((c) => (c.id === id ? { ...c, hidden } : c)));
    } else {
      const data = await res.json();
      alert(data.error || '失敗しました');
    }
  }

  async function toggleCommentHidden(id: string, hidden: boolean) {
    setBusy(id);
    const res = await fetch('/api/admin/daily-comments/hide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, hidden }),
    });
    setBusy(null);
    if (res.ok) {
      setReportedComments((list) => list.map((c) => (c.id === id ? { ...c, comment_hidden: hidden } : c)));
    } else {
      const data = await res.json();
      alert(data.error || '失敗しました');
    }
  }

  function startEdit(c: RecentConsultation) {
    setEditingId(c.id);
    setEditText(c.question);
  }

  // プロンプトの文字数の目安などを変えたあと、既存の投稿（特にサンプル相談）を
  // 新しい設定で作り直したいケース向け（2026-10-13追加）。無料AI相談のみ対象。
  async function regenerateOne(id: string): Promise<boolean> {
    const res = await fetch('/api/admin/consultations/regenerate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  }

  async function regenerateAnswer(id: string) {
    if (!window.confirm('この相談のAI回答を、今のプロンプト設定で作り直します。元の回答は上書きされます。よろしいですか？')) return;
    setBusy(id);
    const ok = await regenerateOne(id);
    setBusy(null);
    alert(ok ? 'AI回答を再生成しました' : '再生成に失敗しました');
  }

  // 「公開前に、これまでの回答を全部見直したい」という要望向け（2026-10-13、
  // 当初は「今日投稿した分だけ」だったが、サービス公開前の一括見直しに対象を広げた）。
  // 直近50件の一覧に含まれる無料AI相談すべてをまとめて再生成する
  // （1件ずつ順番に処理。Anthropic APIへの同時多発リクエストを避けるため並列化はしない）。
  const [bulkRegenerating, setBulkRegenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const allAiConsultations = consultations.filter((c) => c.request_type === 'ai');
  // 自動投稿（サンプル相談）のみを抽出（2026-10-17追加）。「質問文がAIっぽく、
  // 同じ人が書いたように見える。過去の分も直したい」との指摘を受けた一括再生成用。
  // 実ユーザーの相談は対象外（/api/admin/consultations/regenerate-auto-seed側でも
  // author_id='auto-seed'以外は拒否するが、ボタンの対象自体もここで絞っている）。
  const autoSeedConsultations = consultations.filter((c) => c.author_id === 'auto-seed');

  async function regenerateAllAi() {
    const targets = allAiConsultations;
    if (targets.length === 0) return;
    if (
      !window.confirm(
        `無料AI相談、${targets.length}件のAI回答をまとめて作り直します。元の回答は上書きされます。よろしいですか？`
      )
    )
      return;
    setBulkRegenerating(true);
    let okCount = 0;
    let ngCount = 0;
    for (let i = 0; i < targets.length; i++) {
      setBulkProgress({ done: i, total: targets.length });
      const ok = await regenerateOne(targets[i].id);
      if (ok) okCount++;
      else ngCount++;
    }
    setBulkProgress(null);
    setBulkRegenerating(false);
    alert(`完了：成功${okCount}件${ngCount ? `／失敗${ngCount}件` : ''}`);
  }

  // 自動投稿（サンプル相談）の質問文＋回答をまとめて作り直す（2026-10-17追加）。
  // 「質問文がAIっぽく、同じ人が書いたように見える。過去の分も直したい」との指摘向け。
  const [autoSeedRegenerating, setAutoSeedRegenerating] = useState(false);
  const [autoSeedProgress, setAutoSeedProgress] = useState<{ done: number; total: number } | null>(null);

  async function regenerateAutoSeedOne(id: string): Promise<{ ok: boolean; question?: string; answer?: string }> {
    const res = await fetch('/api/admin/consultations/regenerate-auto-seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, question: data.question, answer: data.answer };
  }

  async function regenerateAutoSeedQuestion(id: string) {
    if (!window.confirm('この自動投稿の質問文・回答を、新しいロジックで作り直します。元の内容は上書きされます。よろしいですか？')) return;
    setBusy(id);
    const result = await regenerateAutoSeedOne(id);
    setBusy(null);
    if (result.ok && result.question) {
      setConsultations((list) => list.map((c) => (c.id === id ? { ...c, question: result.question! } : c)));
    }
    alert(result.ok ? '質問文・回答を再生成しました' : '再生成に失敗しました');
  }

  async function regenerateAllAutoSeed() {
    const targets = autoSeedConsultations;
    if (targets.length === 0) return;
    if (
      !window.confirm(
        `自動投稿（サンプル）、${targets.length}件の質問文・回答をまとめて作り直します。元の内容は上書きされます。よろしいですか？`
      )
    )
      return;
    setAutoSeedRegenerating(true);
    let okCount = 0;
    let ngCount = 0;
    for (let i = 0; i < targets.length; i++) {
      setAutoSeedProgress({ done: i, total: targets.length });
      const result = await regenerateAutoSeedOne(targets[i].id);
      if (result.ok && result.question) {
        okCount++;
        setConsultations((list) =>
          list.map((c) => (c.id === targets[i].id ? { ...c, question: result.question! } : c))
        );
      } else {
        ngCount++;
      }
    }
    setAutoSeedProgress(null);
    setAutoSeedRegenerating(false);
    alert(`完了：成功${okCount}件${ngCount ? `／失敗${ngCount}件` : ''}`);
  }

  // 「通報された相談」「相談一覧」の両方で同じカード見た目を使うための共通レンダラー
  // （通報件数バッジを両方に出したいので2026-10-12に関数へ切り出した）。
  function renderConsultationCard(c: RecentConsultation) {
    const cat = CATS[c.category as keyof typeof CATS] || CATS.other;
    return (
      <div key={c.id} className="card" style={{ opacity: c.hidden ? 0.5 : 1 }}>
        <div className="row">
          <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
          <span className="muted">{c.request_type === 'expert' ? '有料' : '無料AI'}</span>
          {!!c.reports && (
            <span
              className="muted"
              style={{ color: '#C0392B', fontWeight: 700, marginLeft: 'auto' }}
            >
              ⚠ 通報 {c.reports}件
            </span>
          )}
        </div>
        {editingId === c.id ? (
          <textarea
            className="input"
            style={{ width: '100%', minHeight: 80 }}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        ) : (
          <div className="qtext">{c.question}</div>
        )}
        <div className="muted">{new Date(c.created_at).toLocaleString('ja-JP')}</div>
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn-secondary"
            disabled={busy === c.id}
            onClick={() => toggleHidden(c.id, !c.hidden)}
          >
            {busy === c.id ? '処理中…' : c.hidden ? '表示に戻す' : '非表示にする'}
          </button>
          {editingId === c.id ? (
            <>
              <button className="btn-primary" disabled={busy === c.id} onClick={() => saveEdit(c.id)}>
                {busy === c.id ? '保存中…' : '保存'}
              </button>
              <button className="btn-secondary" disabled={busy === c.id} onClick={() => setEditingId(null)}>
                キャンセル
              </button>
            </>
          ) : (
            <button className="btn-secondary" disabled={busy === c.id} onClick={() => startEdit(c)}>
              本文を編集
            </button>
          )}
          {c.request_type === 'ai' && (
            <button className="btn-secondary" disabled={busy === c.id} onClick={() => regenerateAnswer(c.id)}>
              {busy === c.id ? '処理中…' : 'AI回答を再生成'}
            </button>
          )}
          {c.author_id === 'auto-seed' && (
            <button className="btn-secondary" disabled={busy === c.id} onClick={() => regenerateAutoSeedQuestion(c.id)}>
              {busy === c.id ? '処理中…' : '質問文も含めて作り直す'}
            </button>
          )}
        </div>
      </div>
    );
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) {
      alert('本文を入力してください');
      return;
    }
    setBusy(id);
    const res = await fetch('/api/admin/consultations/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, question: editText }),
    });
    setBusy(null);
    if (res.ok) {
      setConsultations((list) => list.map((c) => (c.id === id ? { ...c, question: editText.trim() } : c)));
      setReported((list) => list.map((c) => (c.id === id ? { ...c, question: editText.trim() } : c)));
      setEditingId(null);
    } else {
      const data = await res.json();
      alert(data.error || '失敗しました');
    }
  }

  async function refund(id: string) {
    if (!confirm('この相談の決済を返金します。よろしいですか？')) return;
    setBusy(id);
    const res = await fetch('/api/admin/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setBusy(null);
    if (res.ok) {
      setOverdue((list) => list.filter((o) => o.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || '失敗しました');
    }
  }

  async function runPayout() {
    if (!confirm(`未振込分（${payoutSummary.count}件・¥${payoutSummary.total.toLocaleString()}）を、Stripe設定済みの専門家へ一括送金します。よろしいですか？`)) return;
    setPayoutRunning(true);
    setPayoutError('');
    setPayoutResult(null);
    const res = await fetch('/api/admin/payout/run', { method: 'POST' });
    const data = await res.json();
    setPayoutRunning(false);
    if (!res.ok) {
      setPayoutError(data.error || '失敗しました');
      return;
    }
    setPayoutResult(data);
    const paidCount = (data.paid as PayoutResult['paid']).reduce((sum, p) => sum + p.count, 0);
    setPayoutSummary((s) => ({ count: s.count - paidCount, total: s.total - (data.paid as PayoutResult['paid']).reduce((sum, p) => sum + p.amount, 0) }));
  }

  async function saveBanner() {
    setBannerSaving(true);
    setBannerMessage('');
    const res = await fetch('/api/admin/sidebar-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner),
    });
    setBannerSaving(false);
    if (res.ok) {
      setBannerMessage('保存しました');
    } else {
      const data = await res.json();
      setBannerMessage(data.error || '保存に失敗しました');
    }
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div style={{ fontWeight: 700, fontSize: 16 }}>管理画面</div>
      </div>
      <div className="main">
        <div style={{ fontWeight: 700 }}>専門家への報酬振込</div>
        <div className="card" style={{ gap: 10, alignItems: 'flex-start' }}>
          {!stripeConfigured ? (
            <div className="muted" style={{ fontSize: 13 }}>決済機能の準備中のため、振込はまだ実行できません（STRIPE_SECRET_KEY未設定）。</div>
          ) : (
            <>
              <div className="muted" style={{ fontSize: 13 }}>
                未振込：{payoutSummary.count}件・¥{payoutSummary.total.toLocaleString()}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Stripeアカウントの設定が完了している専門家にだけ送金します。未完了の専門家の分はスキップされ、設定が完了すれば次回対象になります。
              </div>
              <button className="btn-primary" onClick={runPayout} disabled={payoutRunning || payoutSummary.count === 0}>
                {payoutRunning ? '振込処理中…' : '今回分を一括振込する'}
              </button>
              {payoutError && <div style={{ color: '#C0392B', fontSize: 13 }}>{payoutError}</div>}
              {payoutResult && (
                <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {payoutResult.paid.map((p, i) => (
                    <div key={i} style={{ color: 'var(--main)' }}>✓ {p.expertName}：¥{p.amount.toLocaleString()}（{p.count}件）送金しました</div>
                  ))}
                  {payoutResult.skipped.map((s, i) => (
                    <div key={i} className="muted">－ {s.expertName}：¥{s.amount.toLocaleString()}（{s.count}件）{s.reason}のためスキップ</div>
                  ))}
                  {payoutResult.errors.map((e, i) => (
                    <div key={i} style={{ color: '#C0392B' }}>✕ {e.expertName}：送金エラー（{e.message}）</div>
                  ))}
                  {payoutResult.paid.length === 0 && payoutResult.skipped.length === 0 && payoutResult.errors.length === 0 && (
                    <div className="muted">対象の未振込分はありませんでした。</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ fontWeight: 700, marginTop: 16 }}>ホーム画面サイドバーのバナー（PC表示のみ）</div>
        <div className="card" style={{ gap: 10, alignItems: 'stretch' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={banner.enabled}
              onChange={(e) => setBanner((b) => ({ ...b, enabled: e.target.checked }))}
            />
            表示する
          </label>
          <input
            className="input"
            placeholder="画像URL（例：https://...banner.png）"
            value={banner.image_url}
            onChange={(e) => setBanner((b) => ({ ...b, image_url: e.target.value }))}
          />
          <input
            className="input"
            placeholder="リンク先URL（アフィリエイトリンク等）"
            value={banner.link_url}
            onChange={(e) => setBanner((b) => ({ ...b, link_url: e.target.value }))}
          />
          <input
            className="input"
            placeholder="代替テキスト（画像が表示できない時用）"
            value={banner.alt_text}
            onChange={(e) => setBanner((b) => ({ ...b, alt_text: e.target.value }))}
          />
          {banner.enabled && banner.image_url && (
            <img src={banner.image_url} alt={banner.alt_text} style={{ maxWidth: 260, borderRadius: 8 }} />
          )}
          <div className="row">
            <button className="btn-primary" disabled={bannerSaving} onClick={saveBanner}>
              {bannerSaving ? '保存中…' : '保存する'}
            </button>
            {bannerMessage && <span className="muted">{bannerMessage}</span>}
          </div>
        </div>

        {/* 無料AI相談の1日10回の上限に実際に当たっている人の数（2026-10-13追加）。
            「もっと使いたい人」向け有料プランを作るかどうかの判断材料として、
            ユーザーには見せずにここでだけ確認する。 */}
        <div style={{ fontWeight: 700, marginTop: 16 }}>AI相談の上限到達状況（直近30日）</div>
        <div className="card">
          <div className="qtext">
            1日10回の上限に当たった回数：{aiLimitHitSummary.hitCount}回（のべ{aiLimitHitSummary.uniqueUserCount}人）
          </div>
        </div>

        {/* 希死念慮・自傷等の安全上書き（ホットライン案内のみの回答）が実際にどのくらいの
            頻度で発動しているかの確認用（2026-10-14追加）。「AIがいつもその手の回答ばかりに
            なっていないか」を、印象ではなく実数で確認できるようにした。自動投稿
            （auto-seed）分は実ユーザーの相談とは別物なので分けて表示する。 */}
        <div style={{ fontWeight: 700, marginTop: 16 }}>安全上書き（希死念慮等）の発動状況（直近30日）</div>
        <div className="card">
          <div className="qtext">
            実ユーザーの相談：{crisisDetectedSummary.realTotal}件中{crisisDetectedSummary.realCount}件
            {crisisDetectedSummary.realTotal > 0 &&
              `（${((crisisDetectedSummary.realCount / crisisDetectedSummary.realTotal) * 100).toFixed(1)}%）`}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            自動投稿（サンプル）：{crisisDetectedSummary.autoSeedTotal}件中{crisisDetectedSummary.autoSeedCount}件
          </div>
        </div>

        {/* 閲覧数は各相談カード・詳細ページに個別には出ているが、全体の合計や上位を
            まとめて見られる場所が無かったため追加（2026-10-14）。 */}
        <div style={{ fontWeight: 700, marginTop: 16 }}>閲覧数</div>
        <div className="card">
          <div className="qtext">合計閲覧数：{totalViews.toLocaleString()}</div>
        </div>
        <div className="muted" style={{ margin: '4px 0 2px', fontSize: 12 }}>閲覧数が多い相談（上位10件）</div>
        {topViewedConsultations.length === 0 ? (
          <div className="muted" style={{ fontSize: 13 }}>まだ相談がありません。</div>
        ) : (
          topViewedConsultations.map((c, i) => {
            const cat = CATS[c.category] || CATS.other;
            return (
              <a
                key={c.id}
                href={`/result/${c.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, textDecoration: 'none' }}
              >
                <span className="muted" style={{ fontSize: 12, flex: '0 0 auto' }}>{i + 1}</span>
                <span className={`cat-badge ${cat.cls}`} style={{ fontSize: 11, padding: '2px 8px', flex: '0 0 auto' }}>
                  {cat.label}
                </span>
                <span className="qtext" style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.question}
                </span>
                <span className="muted" style={{ fontSize: 12, flex: '0 0 auto' }}>👁 {c.views}</span>
              </a>
            );
          })
        )}

        <div style={{ fontWeight: 700, marginTop: 16 }}>専門家の本人確認待ち（{experts.length}件）</div>
        {experts.length === 0 && <div className="muted">確認待ちの専門家はいません。</div>}
        {experts.map((e) => (
          <div key={e.id} className="card">
            <div style={{ fontWeight: 700 }}>{e.credential}・{e.name}（本名）</div>
            {e.display_name && <div className="muted">表示名：{e.display_name}</div>}
            <div className="muted">{e.email}</div>
            <div className="muted">登録番号：{e.license_number || '（未入力）'}</div>
            {!!e.specialty_categories?.length && (
              <div className="muted">
                対応カテゴリ：{e.specialty_categories.map((k) => CATS[k]?.label || k).join('・')}
              </div>
            )}
            {!!e.experienced_school_names?.length && (
              <div className="muted">
                話せる学校：{e.experienced_school_names.join('・')}
              </div>
            )}
            {e.review_status === 'needs_fix' && (
              <div className="muted" style={{ color: 'var(--orange-text)' }}>
                差し戻し中（本人の再提出待ち）：{e.review_note}
              </div>
            )}
            {/* 「気軽に登録できる流れがいいな」との指摘を受けて（2026-10-31）、
                通話を前提とした案内文から、登録内容を読んで直接承認してよい
                （必要な場合のみ連絡する）という案内に変更。 */}
            {e.verification_method === 'call' && (
              <div className="muted" style={{ color: 'var(--orange-text)' }}>
                資格証の提出なし。登録内容（自己紹介文）を確認し、問題なければそのまま「確認済みにする」で承認してください。内容に確認したい点がある場合のみ、ご本人のメールアドレスへ連絡してください。
              </div>
            )}
            <div className="row">
              {e.verification_method !== 'call' && (
                <button className="btn-secondary" disabled={busy === e.id || !e.license_doc_path} onClick={() => viewLicenseDoc(e.id)}>
                  {e.license_doc_path ? (busy === e.id ? '取得中…' : '登録証を確認') : '登録証未提出'}
                </button>
              )}
              <button className="btn-primary" disabled={busy === e.id} onClick={() => verifyExpert(e.id)}>
                {busy === e.id ? '処理中…' : '確認済みにする'}
              </button>
            </div>
            <div className="row">
              <button className="btn-secondary" disabled={busy === e.id} onClick={() => reviewExpert(e.id, 'needs_fix')}>
                差し戻す
              </button>
              <button
                className="btn-secondary"
                style={{ color: '#C0392B' }}
                disabled={busy === e.id}
                onClick={() => {
                  if (window.confirm(`${e.name}さんを却下します。よろしいですか？`)) reviewExpert(e.id, 'reject');
                }}
              >
                却下する
              </button>
            </div>
          </div>
        ))}

        {/* Stripe登録の案内など、専門家への連絡は今のところ自動メールの仕組みが無く、
            運営から手動でメールする運用にしたため、確認済みの専門家の連絡先を
            ここでまとめて見られるようにした（2026-10-13）。 */}
        <div style={{ fontWeight: 700, marginTop: 16 }}>確認済みの専門家（{verifiedExperts.length}件）</div>
        {verifiedExperts.length === 0 && <div className="muted">確認済みの専門家はまだいません。</div>}
        {verifiedExperts.map((e) => (
          <div key={e.id} className="card">
            <div style={{ fontWeight: 700 }}>{e.credential}・{e.name}（本名）</div>
            {e.display_name && <div className="muted">表示名：{e.display_name}</div>}
            <div className="muted">
              <a href={`mailto:${e.email}`}>{e.email}</a>
            </div>
          </div>
        ))}

        <div style={{ fontWeight: 700, marginTop: 16 }}>未回答の有料相談（5日以上経過・{overdue.length}件）</div>
        {overdue.length === 0 && <div className="muted">対象の相談はありません。</div>}
        {overdue.map((o) => (
          <div key={o.id} className="card">
            <div className="qtext">{o.question}</div>
            <div className="muted">¥{(o.price_jpy || 0).toLocaleString()}・{new Date(o.created_at).toLocaleDateString('ja-JP')}</div>
            <button className="btn-secondary" disabled={busy === o.id} onClick={() => refund(o.id)}>
              {busy === o.id ? '処理中…' : '返金する'}
            </button>
          </div>
        ))}

        <div style={{ fontWeight: 700, marginTop: 16 }}>専門家の回答（直近30件・事後チェック用）</div>
        {recentExpertAnswers.length === 0 && <div className="muted">まだ回答された相談はありません。</div>}
        {recentExpertAnswers.map((a) => (
          <div key={a.id} className="card">
            <div className="row">
              <span style={{ fontWeight: 700 }}>
                {a.experts ? `${a.experts.credential}・${a.experts.name}` : '（専門家情報なし）'}
              </span>
              <span className="muted">{new Date(a.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div className="qtext">💬 {a.question}</div>
            <div className="qtext" style={{ whiteSpace: 'pre-wrap', background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
              {a.expert_answer}
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              利用者フィードバック：
              {a.expert_answer_helpful === true && '👍 参考になった'}
              {a.expert_answer_helpful === false && '👎 あまり'}
              {a.expert_answer_helpful === null && '（未評価）'}
            </div>
          </div>
        ))}

        {/* 通報された相談（2026-10-12追加）。直近50件の一覧に埋もれると見逃されるため、
            通報が1件以上あるものだけを別枠で、件数が多い順に出す。 */}
        <div style={{ fontWeight: 700, marginTop: 16 }}>通報された相談</div>
        {reported.length === 0 ? (
          <div className="muted">現在、通報はありません。</div>
        ) : (
          reported.map((c) => renderConsultationCard(c))
        )}

        {/* 「みんなのデータ」の任意コメントが通報された場合の確認・非表示切り替え
            （2026-10-17追加。コメント機能自体の設計意図はapp/api/daily-question/
            route.tsのコメント参照）。 */}
        <div style={{ fontWeight: 700, marginTop: 16 }}>通報されたコメント（みんなのデータ）</div>
        {reportedComments.length === 0 ? (
          <div className="muted">現在、通報はありません。</div>
        ) : (
          reportedComments.map((c) => (
            <div key={c.id} className="card" style={{ opacity: c.comment_hidden ? 0.5 : 1 }}>
              <div className="row">
                <span className="muted">{c.question_slug}</span>
                <span
                  className="muted"
                  style={{ color: '#C0392B', fontWeight: 700, marginLeft: 'auto' }}
                >
                  ⚠ 通報 {c.comment_reports}件
                </span>
              </div>
              <div className="qtext">{c.comment}</div>
              <div className="muted">{new Date(c.created_at).toLocaleString('ja-JP')}</div>
              <div className="row" style={{ gap: 8 }}>
                <button
                  className="btn-secondary"
                  disabled={busy === c.id}
                  onClick={() => toggleCommentHidden(c.id, !c.comment_hidden)}
                >
                  {busy === c.id ? '処理中…' : c.comment_hidden ? '表示に戻す' : '非表示にする'}
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ fontWeight: 700, marginTop: 16 }}>相談一覧（直近50件）</div>
        {allAiConsultations.length > 0 && (
          <div className="card" style={{ gap: 8 }}>
            <div className="muted">無料AI相談：{allAiConsultations.length}件</div>
            <button className="btn-secondary" disabled={bulkRegenerating} onClick={regenerateAllAi}>
              {bulkRegenerating
                ? `再生成中…（${bulkProgress ? bulkProgress.done + 1 : 1}/${allAiConsultations.length}）`
                : 'AI相談をまとめて再生成（公開前の一括見直し）'}
            </button>
          </div>
        )}
        {/* 自動投稿（サンプル相談）の質問文がAIっぽく見える、という指摘への対応
            （2026-10-17追加）。質問文・回答の両方を新しいロジックで作り直す。直近50件の
            一覧に含まれる分のみが対象（それより古い自動投稿は、ここには出てこない）。 */}
        {autoSeedConsultations.length > 0 && (
          <div className="card" style={{ gap: 8 }}>
            <div className="muted">自動投稿（サンプル）：{autoSeedConsultations.length}件</div>
            <button className="btn-secondary" disabled={autoSeedRegenerating} onClick={regenerateAllAutoSeed}>
              {autoSeedRegenerating
                ? `再生成中…（${autoSeedProgress ? autoSeedProgress.done + 1 : 1}/${autoSeedConsultations.length}）`
                : '自動投稿を質問文も含めてまとめて作り直す'}
            </button>
          </div>
        )}
        {consultations.map((c) => renderConsultationCard(c))}
      </div>
    </div>
  );
}
