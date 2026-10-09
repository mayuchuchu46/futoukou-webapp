'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationCard from '@/components/ConsultationCard';
import { CATS } from '@/lib/categories';
import { Consultation } from '@/lib/types';

export default function HomePage() {
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [supervised, setSupervised] = useState(false);

  useEffect(() => {
    fetch('/api/guidelines')
      .then((r) => r.json())
      .then((d) => setSupervised(!!d.guidelines?.supervised))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = category === 'all' ? '' : `?category=${category}`;
    fetch(`/api/consultations${qs}`)
      .then((r) => r.json())
      .then((d) => setItems(d.consultations || []))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="app-shell">
      <Header supervised={supervised} />
      <div className="main">
        <div className="chip-row">
          <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
            すべて
          </button>
          {Object.entries(CATS).map(([key, c]) => (
            <button key={key} className={`chip ${category === key ? 'active' : ''}`} onClick={() => setCategory(key)}>
              {c.label}
            </button>
          ))}
        </div>

        {loading && <div className="muted">読み込み中…</div>}
        {!loading && items.length === 0 && <div className="muted">まだ相談がありません。</div>}
        {items.map((item) => (
          <ConsultationCard key={item.id} item={item} />
        ))}
      </div>

      <Link href="/ask" className="fab">＋</Link>
      <BottomNav />
    </div>
  );
}
