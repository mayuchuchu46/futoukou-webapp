'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function MyPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--yellow-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🙂</div>
          <div style={{ fontWeight: 700 }}>ゲスト</div>
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
