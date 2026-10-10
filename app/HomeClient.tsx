'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationCard from '@/components/ConsultationCard';
import { CATS } from '@/lib/categories';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

export default function HomeClient({
  initialItems,
  initialSupervised,
  initialCounts,
  initialTotal,
}: {
  initialItems: Consultation[];
  initialSupervised: boolean;
  initialCounts: Record<string, number>;
  initialTotal: number;
}) {
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState<Consultation[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const supervised = initialSupervised;
  const counts = initialCounts;
  const total = initialTotal;

  async function fetchCategory(next: string, { showLoading }: { showLoading: boolean }) {
    if (showLoading) setLoading(true);
    const params = new URLSearchParams({ viewer_id: getUid() });
    if (next !== 'all') params.set('category', next);
    try {
      const res = await fetch(`/api/consultations?${params.toString()}`);
      const d = await res.json();
      setItems(d.consultations || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  function selectCategory(next: string) {
    setCategory(next);
    fetchCategory(next, { showLoading: true });
  }

  useEffect(() => {
    // 初回表示はサーバー側（匿名扱い）の一覧をそのまま見せ、
    // マウント後に本当のviewer_id（本人・会員かどうか）で静かに再取得して
    // ロック解除などの表示を正しいものに差し替える。
    fetchCategory('all', { showLoading: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={supervised} />
      <div className="main">
        <div className="chip-row">
          <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => selectCategory('all')}>
            すべて（{total}）
          </button>
          {Object.entries(CATS).map(([key, c]) => (
            <button
              key={key}
              className={`chip ${category === key ? 'active' : ''}`}
              onClick={() => selectCategory(key)}
            >
              {c.short}（{counts[key] || 0}）
            </button>
          ))}
        </div>

        {loading && <div className="muted">読み込み中…</div>}
        {!loading && items.length === 0 && <div className="muted">まだ相談がありません。</div>}
        {!loading && items.map((item) => <ConsultationCard key={item.id} item={item} />)}
      </div>

      <BottomNav />
    </div>
  );
}
