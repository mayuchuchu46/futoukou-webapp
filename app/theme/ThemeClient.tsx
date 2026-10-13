'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { CATS } from '@/lib/categories';

export default function ThemeClient() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/consultations/counts')
      .then((r) => r.json())
      .then((d) => setCounts(d.counts || {}))
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
        {Object.entries(CATS).map(([key, c]) => (
          <Link key={key} href={`/?category=${key}`} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={c.icon} style={{ width: 20, height: 20 }} alt="" />
            </div>
            <div style={{ fontWeight: 700, flex: 1 }}>{c.label}</div>
            <div className="muted">{counts[key] || 0}件</div>
          </Link>
        ))}
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
