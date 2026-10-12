'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
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
      <div className="main page-with-sidebar">
        <div className="page-main">
        <h2 className="pagetitle">マイページ</h2>
        <div className="muted" style={{ marginBottom: 4 }}>自分が投稿した相談だけを表示しています</div>

        {/* AIによる状況分析は独立した「分析ノート」タブに移動したため、ここは誘導リンクのみ。 */}
        <Link href="/notebook" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/assets/icon_book.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            分析ノートを見る
          </span>
          <span className="muted">›</span>
        </Link>

        {items === null ? (
          <div className="muted">読み込み中…</div>
        ) : items.length === 0 ? (
          <>
            <div className="empty">
              まだ投稿がありません。<br />「相談する」から質問してみてください。
            </div>
            <Link href="/ask" className="btn-primary">相談する</Link>
          </>
        ) : (
          items.map((item) => (
            <ConsultationCard
              key={item.id}
              item={item}
              showDelete
              onDeleted={(id) => setItems((prev) => (prev || []).filter((c) => c.id !== id))}
            />
          ))
        )}

        <Link href="/account" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>アカウント（ログイン）</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/about" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>どうする先生について</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/terms" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>利用規約・免責事項</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/privacy" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>プライバシーポリシー</span>
          <span className="muted">›</span>
        </Link>
        <Link href="/expert/login" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>専門家として登録・ログイン</span>
          <span className="muted">›</span>
        </Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
