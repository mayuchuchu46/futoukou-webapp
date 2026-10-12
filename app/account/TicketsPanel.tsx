'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 専門家への質問チケット（6回¥3000パック）の残数表示・購入導線。
// 読み放題会員のみ対象（非会員はMembershipPanel側でまず会員登録を案内しているため、
// ここでは「会員のときだけ表示する」判断は呼び出し側＝account/page.tsxに任せる）。
export default function TicketsPanel({
  initialCredits,
  priceJpy,
  packCount,
  stripeConfigured,
}: {
  initialCredits: number;
  priceJpy: number;
  packCount: number;
  stripeConfigured: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('tickets_session_id');
  const [credits, setCredits] = useState(initialCredits);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    setConfirming(true);
    fetch('/api/expert-tickets-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.expert_credits === 'number') setCredits(d.expert_credits);
      })
      .finally(() => {
        setConfirming(false);
        router.replace('/account');
        router.refresh();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function buyTickets() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/expert-tickets-checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || '失敗しました');
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="card" style={{ gap: 6 }}>
        <div className="muted">決済結果を確認しています…</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ gap: 10, alignItems: 'flex-start' }}>
      <div style={{ fontWeight: 700 }}>専門家への質問チケット</div>
      <div className="muted" style={{ fontSize: 13 }}>
        残り{credits}枚。月1回の無料分を使い切った後の質問に使えます（1回の質問につき1枚消費）。
        {packCount}枚セットのまとめ買いで、都度払いより1枚あたりお得です。
      </div>
      {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
      {stripeConfigured ? (
        <button className="btn-secondary" onClick={buyTickets} disabled={loading}>
          {loading ? '決済ページへ移動中…' : `${packCount}回分のチケットを購入`}
        </button>
      ) : (
        <button className="btn-secondary" disabled>
          現在準備中です
        </button>
      )}
    </div>
  );
}
