'use client';

import { useState } from 'react';
import { CATS } from '@/lib/categories';

type UnverifiedExpert = {
  id: string;
  name: string;
  email: string;
  credential: string;
  license_number: string;
  license_doc_path: string | null;
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
  recentConsultations,
  reportedConsultations,
  overdueExpertRequests,
  recentExpertAnswers,
  initialSidebarBanner,
  unpaidPayoutSummary,
  stripeConfigured,
}: {
  unverifiedExperts: UnverifiedExpert[];
  recentConsultations: RecentConsultation[];
  reportedConsultations: RecentConsultation[];
  overdueExpertRequests: OverdueExpertRequest[];
  recentExpertAnswers: RecentExpertAnswer[];
  initialSidebarBanner: SidebarBanner;
  unpaidPayoutSummary: UnpaidPayoutSummary;
  stripeConfigured: boolean;
}) {
  const [experts, setExperts] = useState(unverifiedExperts);
  const [consultations, setConsultations] = useState(recentConsultations);
  const [reported, setReported] = useState(reportedConsultations);
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
      body: JSON.stringify({ expert_id: id, verified: true }),
    });
    setBusy(null);
    if (res.ok) {
      setExperts((list) => list.filter((e) => e.id !== id));
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

  function startEdit(c: RecentConsultation) {
    setEditingId(c.id);
    setEditText(c.question);
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

        <div style={{ fontWeight: 700, marginTop: 16 }}>専門家の本人確認待ち（{experts.length}件）</div>
        {experts.length === 0 && <div className="muted">確認待ちの専門家はいません。</div>}
        {experts.map((e) => (
          <div key={e.id} className="card">
            <div style={{ fontWeight: 700 }}>{e.credential}・{e.name}</div>
            <div className="muted">{e.email}</div>
            <div className="muted">登録番号：{e.license_number || '（未入力）'}</div>
            <div className="row">
              <button className="btn-secondary" disabled={busy === e.id || !e.license_doc_path} onClick={() => viewLicenseDoc(e.id)}>
                {e.license_doc_path ? (busy === e.id ? '取得中…' : '登録証を確認') : '登録証未提出'}
              </button>
              <button className="btn-primary" disabled={busy === e.id} onClick={() => verifyExpert(e.id)}>
                {busy === e.id ? '処理中…' : '確認済みにする'}
              </button>
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

        <div style={{ fontWeight: 700, marginTop: 16 }}>相談一覧（直近50件）</div>
        {consultations.map((c) => renderConsultationCard(c))}
      </div>
    </div>
  );
}
