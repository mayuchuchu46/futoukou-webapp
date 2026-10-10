'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationCard from '@/components/ConsultationCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

export default function MyPage() {
  const [items, setItems] = useState<Consultation[] | null>(null);

  useEffect(() => {
    const uid = getUid();
    fetch(`/api/consultations?author_id=${uid}&viewer_id=${uid}`)
      .then((r) => r.json())
      .then((d) => setItems(d.consultations || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">マイページ</h2>
        <div className="muted" style={{ marginBottom: 4 }}>自分が投稿した相談だけを表示しています</div>

        {items === null ? (
          <div className="muted">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="empty">
            まだ投稿がありません。<br />「相談する」から質問してみてください。
          </div>
        ) : (
          items.map((item) => <ConsultationCard key={item.id} item={item} />)
        )}

        <Link href="/about" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>どうする先生について</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/terms" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>利用規約・免責事項</span>
          <span className="muted">›</span>
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
