'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getUid } from '@/lib/uid';

export default function MyPage() {
  const [membership, setMembership] = useState<{ active: boolean; expiresAt: string | null } | null>(null);

  useEffect(() => {
    fetch(`/api/membership?author_id=${getUid()}`)
      .then((r) => r.json())
      .then(setMembership)
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--yellow-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🙂</div>
          <div style={{ fontWeight: 700 }}>ゲスト</div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13 }}>専門家回答 読み放題</div>
          {membership?.active ? (
            <div className="muted" style={{ fontSize: 12 }}>
              有効（{new Date(membership.expiresAt as string).toLocaleDateString('ja-JP')}まで）。期間中は他の人の専門家回答も読めます。
            </div>
          ) : (
            <div className="muted" style={{ fontSize: 12 }}>
              現在は無効です。公認心理師に¥500で相談すると、その日から30日間、他の人の専門家回答も読み放題になります。
            </div>
          )}
        </div>

        <Link href="/terms" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>利用規約・免責事項</span>
          <span className="muted">›</span>
        </Link>

        <div className="card">
          <div className="muted" style={{ fontSize: 12 }}>
            このアプリは試験公開中のベータ版です。ご意見・不具合の報告はaini schoolスタッフまでお願いします。
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
