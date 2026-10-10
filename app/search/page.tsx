'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationCard from '@/components/ConsultationCard';
import { CATS } from '@/lib/categories';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

function SearchInner() {
  const params = useSearchParams();
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/consultations/counts')
      .then((r) => r.json())
      .then((d) => { setCounts(d.counts || {}); setTotal(d.total || 0); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ viewer_id: getUid() });
    if (category !== 'all') params.set('category', category);
    if (q.trim()) params.set('q', q.trim());
    fetch(`/api/consultations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.consultations || []))
      .finally(() => setLoading(false));
  }, [category, q]);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <input
          className="input"
          placeholder="キーワードで検索…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="chip-row">
          <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
            すべて（{total}）
          </button>
          {Object.entries(CATS).map(([key, c]) => (
            <button key={key} className={`chip ${category === key ? 'active' : ''}`} onClick={() => setCategory(key)}>
              {c.short}（{counts[key] || 0}）
            </button>
          ))}
        </div>

        {loading && <div className="muted">読み込み中…</div>}
        {!loading && items.length === 0 && <div className="muted">該当する相談が見つかりません。</div>}
        {items.map((item) => (
          <ConsultationCard key={item.id} item={item} />
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
