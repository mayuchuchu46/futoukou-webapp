'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConsultationCard from '@/components/ConsultationCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

// 旧/mypageの「自分が投稿した相談」一覧（2026-10-21、マイページをアカウントページに
// 統合した際に移設）。ログイン状態に関係なく、ローカルのuid（lib/uid.ts）に紐づく
// 投稿を表示する匿名利用前提の機能のため、cookies()を読むAccountPageContent
// （ログイン必須の会員情報パネル）とは分離し、常に表示される側に置いている。
export default function MyConsultationsPanel() {
  const [items, setItems] = useState<Consultation[] | null>(null);

  useEffect(() => {
    const uid = getUid();
    fetch(`/api/consultations?author_id=${uid}&viewer_id=${uid}`)
      .then((r) => r.json())
      .then((d) => setItems(d.consultations || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <>
      <div className="muted" style={{ marginBottom: 4 }}>自分が投稿した相談だけを表示しています</div>

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
    </>
  );
}
