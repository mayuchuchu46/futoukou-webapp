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
};

type OverdueExpertRequest = {
  id: string;
  question: string;
  price_jpy: number | null;
  created_at: string;
  stripe_session_id: string | null;
};

export default function AdminClient({
  unverifiedExperts,
  recentConsultations,
  overdueExpertRequests,
}: {
  unverifiedExperts: UnverifiedExpert[];
  recentConsultations: RecentConsultation[];
  overdueExpertRequests: OverdueExpertRequest[];
}) {
  const [experts, setExperts] = useState(unverifiedExperts);
  const [consultations, setConsultations] = useState(recentConsultations);
  const [overdue, setOverdue] = useState(overdueExpertRequests);
  const [busy, setBusy] = useState<string | null>(null);

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

  return (
    <div className="app-shell">
      <div className="header">
        <div style={{ fontWeight: 700, fontSize: 16 }}>管理画面</div>
      </div>
      <div className="main">
        <div style={{ fontWeight: 700 }}>専門家の本人確認待ち（{experts.length}件）</div>
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

        <div style={{ fontWeight: 700, marginTop: 16 }}>相談一覧（直近50件）</div>
        {consultations.map((c) => {
          const cat = CATS[c.category as keyof typeof CATS] || CATS.other;
          return (
            <div key={c.id} className="card" style={{ opacity: c.hidden ? 0.5 : 1 }}>
              <div className="row">
                <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
                <span className="muted">{c.request_type === 'expert' ? '有料' : '無料AI'}</span>
              </div>
              <div className="qtext">{c.question}</div>
              <div className="muted">{new Date(c.created_at).toLocaleString('ja-JP')}</div>
              <button
                className="btn-secondary"
                disabled={busy === c.id}
                onClick={() => toggleHidden(c.id, !c.hidden)}
              >
                {busy === c.id ? '処理中…' : c.hidden ? '表示に戻す' : '非表示にする'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
