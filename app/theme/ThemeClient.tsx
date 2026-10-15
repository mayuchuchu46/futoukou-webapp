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
        {/* カードの遷移先は、相談一覧（/?category=）ではなく「お悩み辞典」ページ
            （/dictionary/[category]）にした。実際の相談の集約＋AI解説文を先に見せ、
            そこから一覧へ進める導線の方が、テーマ選びの手がかりになる
            （2026-10-15、「ChatGPTと何が違うの」という課題への対策として追加）。 */}
        {Object.entries(CATS).map(([key, c]) => (
          <Link key={key} href={`/dictionary/${key}`} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
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
