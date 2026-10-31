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
  stripeConfigured,
  volunteerMode,
}: {
  active: boolean;
  periodEnd: string | null;
  stripeConfigured: boolean;
  // Stripeアカウント自体が使えない間（lib/config.tsのEXPERT_VOLUNTEER_MODE）は、
  // 決済を挟まずその場で会員を無料で有効化する（2026-10-31追加）。
  volunteerMode: boolean;
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
      if (!res.ok) throw new Error(data.error || '失敗しました');
      if (data.activated) {
        // ボランティア期間中は決済を挟まずその場で有効化される。Stripeへの
        // リダイレクトは発生しないので、画面を更新して会員状態を反映するだけでよい。
        router.refresh();
        setLoading(false);
        return;
      }
      if (!data.url) throw new Error(data.error || '失敗しました');
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
          {volunteerMode
            ? '他の利用者への専門家回答もすべて読めます。'
            : '他の利用者への専門家回答もすべて読めます。専門家への質問は月1回無料で、使い切った後は都度払い、またはお得なまとめ買いチケットで利用できます。'}
          {periodEnd ? `（次回更新日：${formatDate(periodEnd)}）` : ''}
        </div>
        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        {stripeConfigured && !volunteerMode && (
          <button className="btn-secondary" onClick={openPortal} disabled={loading}>
            {loading ? '移動中…' : '支払い方法の変更・解約はこちら'}
          </button>
        )}
      </div>
    );
  }

  // ベータ版・期間限定で、会員登録（無料）だけで専門家回答が読み放題になることを
  // 大きく打ち出して登録につなげる（2026-10-31、「今はベータ版で期間限定で無料会員
  // 登録で読み放題という特典をでかでかとかいて会員登録に結びつけて」との方針確認を
  // 受けて変更）。
  if (volunteerMode) {
    return (
      <div className="card" style={{ gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--main)' }}>
          今だけ、無料のご登録で専門家の回答が読み放題
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          現在ベータ版・期間限定で、通常は月額の「読み放題会員」に無料でご登録いただけます。会員になると、他の利用者への専門家回答がすべて読めます。
        </div>
        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={startCheckout} disabled={loading}>
          {loading ? '登録中…' : '無料で読み放題会員になる'}
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ gap: 10, alignItems: 'flex-start' }}>
      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        読み放題会員ではありません
        {!stripeConfigured && <span className="comingsoon-badge">準備中・近日公開</span>}
      </div>
      <div className="muted" style={{ fontSize: 13 }}>
        読み放題会員になると、他の利用者への専門家回答がすべて読み放題になります。さらに専門家への質問が、月1回は無料でできます。
      </div>
      {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
      {stripeConfigured ? (
        <button className="btn-primary" onClick={startCheckout} disabled={loading}>
          {loading ? '決済ページへ移動中…' : '読み放題会員になる'}
        </button>
      ) : (
        <button className="btn-primary" disabled>
          現在準備中です
        </button>
      )}
    </div>
  );
}
