'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationCard from '@/components/ConsultationCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

export default function ExpertListPage() {
  const [items, setItems] = useState<Consultation[] | null>(null);

  useEffect(() => {
    fetch(`/api/consultations?expert_answered=1&viewer_id=${getUid()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.consultations || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <Link href="/" className="backlink" style={{ margin: '14px 0' }}>← もどる</Link>
        <h2 className="pagetitle">専門家が回答した相談</h2>
        <div className="muted" style={{ marginBottom: 14 }}>
          AIの自動回答とは別に、専門家（公認心理師など）本人が相談文を読んで直接回答したものです。読み放題会員（月¥800）になると、ここに並ぶ専門家回答がすべて読めます。さらに会員は、月1回は無料で専門家に質問でき、使い切った後も1回¥600、またはお得なチケット（6回¥3000）で質問できます。相談を重ねるほど、AIがお子さんの状況をまとめ、次の一手の具体的なアドバイスも読めるようになります（マイページ）。
        </div>
        <Link href="/experts" className="backlink" style={{ margin: '-6px 0 14px' }}>
          どんな専門家が回答していますか？ →
        </Link>

        {items === null ? (
          <div className="muted">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="empty">まだ専門家が回答した相談がありません。</div>
        ) : (
          items.map((item) => <ConsultationCard key={item.id} item={item} />)
        )}
      </div>
      <BottomNav />
    </div>
  );
}
