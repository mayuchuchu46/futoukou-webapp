'use client';

import { useState } from 'react';

// 「お知らせ・メルマガを受け取る」の同意を、登録後にいつでも変更できるようにする
// トグル。配信機能自体はまだ無いが、受け取る/受け取らないの同意だけは先に
// 整えておく（2026-10-12追加、同意はオプトイン＝デフォルトOFF）。
export default function NewsletterPanel({ initialOptIn }: { initialOptIn: boolean }) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    const next = !optIn;
    setOptIn(next);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/account/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn: next }),
      });
      if (!res.ok) throw new Error('失敗しました');
    } catch {
      setOptIn(!next); // 失敗時は表示を元に戻す
      setError('変更できませんでした。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ gap: 8, alignItems: 'flex-start' }}>
      <div style={{ fontWeight: 700 }}>お知らせ・メルマガ</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
        <input type="checkbox" checked={optIn} onChange={toggle} disabled={loading} />
        お知らせ・メルマガを受け取る
      </label>
      {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
    </div>
  );
}
