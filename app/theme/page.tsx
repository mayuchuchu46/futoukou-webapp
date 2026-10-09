'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CATS } from '@/lib/categories';

export default function ThemePage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        {Object.entries(CATS).map(([key, c]) => (
          <Link key={key} href={`/search?category=${key}`} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={c.icon} style={{ width: 20, height: 20 }} alt="" />
            </div>
            <div style={{ fontWeight: 700 }}>{c.label}</div>
          </Link>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
