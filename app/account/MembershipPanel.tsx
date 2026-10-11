'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function formatDate(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// 読み放題会員（月¥800）の状態表示と、登録・解約導線。
// Stripeチェックアウトから /account?membership_session_id=... に戻ってきた直後は、
// ここでその場の確認（/api/membership-confirm）を行い、結果をサーバー側の表示に
// 反映させるため router.refresh() する。
export default function MembershipPanel({
  active,
  periodEnd,
}: {
  active: boolean;
  periodEnd: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('membership_session_id');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    setConfirming(true);
    fetch('/api/membership-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .finally(() => {
        setConfirming(false);
        router.replace('/account');
        router.refresh();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function startCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/membership-checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || '失敗しました');
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      setLoading(false);
    }
  }

  async function openPortal() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/membership-portal', { method: 'POST' });
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

  if (active) {
    return (
      <div className="card" style={{ gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 700 }}>読み放題会員です</div>
        <div className="muted" style={{ fontSize: 13 }}>
          他の利用者への専門家回答もすべて読めます。専門家への質問は月1回無料で、使い切った後は1回¥600、またはお得なチケット（6回¥3000）で利用できます。
          {periodEnd ? `（次回更新日：${formatDate(periodEnd)}）` : ''}
        </div>
        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-secondary" onClick={openPortal} disabled={loading}>
          {loading ? '移動中…' : '支払い方法の変更・解約はこちら'}
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ gap: 10, alignItems: 'flex-start' }}>
      <div style={{ fontWeight: 700 }}>読み放題会員ではありません</div>
      <div className="muted" style={{ fontSize: 13 }}>
        月¥800で、他の利用者への専門家回答がすべて読み放題になります。さらに専門家への質問が、月1回は無料でできます。
      </div>
      {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
      <button className="btn-primary" onClick={startCheckout} disabled={loading}>
        {loading ? '決済ページへ移動中…' : '月¥800で読み放題会員になる'}
      </button>
    </div>
  );
}
