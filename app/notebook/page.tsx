'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ConsultationSummaryCard from './ConsultationSummaryCard';
import { getUid } from '@/lib/uid';

// 「分析ノート」専用ページ。ボトムナビの独立タブからいつでも開ける（元はマイページ内の
// カードだった）。会員登録・読み放題会員登録への導線を強めるのが目的（2026-10-12 追加）。
// このページ自体は投稿した相談の件数（ownCount）だけ把握すればよく、相談の一覧表示自体は
// 従来どおりマイページが担当する（役割を分け、重複表示を避ける）。
export default function NotebookPage() {
  const [ownCount, setOwnCount] = useState<number | null>(null);

  useEffect(() => {
    const uid = getUid();
    fetch(`/api/consultations?author_id=${uid}&viewer_id=${uid}`)
      .then((r) => r.json())
      .then((d) => setOwnCount((d.consultations || []).length))
      .catch(() => setOwnCount(0));
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">分析ノート</h2>
        <div className="muted" style={{ marginBottom: 4 }}>
          相談を重ねるほど、どうする先生が今のお子さんの状況をここにまとめます
        </div>

        {ownCount !== null && <ConsultationSummaryCard ownCount={ownCount} />}

        <Link href="/mypage" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>これまで投稿した相談を見る</span>
          <span className="muted">›</span>
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
