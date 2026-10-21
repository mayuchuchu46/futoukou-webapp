'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConsultationCard from '@/components/ConsultationCard';
import { Consultation } from '@/lib/types';
import { getUid } from '@/lib/uid';

// 最初に表示する件数。「もっと見る」を押すたびにこの件数ずつ増える。
const PAGE_SIZE = 5;

// 旧/mypageの「自分が投稿した相談」一覧（2026-10-21、マイページをアカウントページに
// 統合した際に移設）。ログイン状態に関係なく、ローカルのuid（lib/uid.ts）に紐づく
// 投稿を表示する匿名利用前提の機能のため、cookies()を読むAccountPageContent
// （ログイン必須の会員情報パネル）とは分離し、常に表示される側に置いている。
// 全件取得したうえで先頭5件だけ表示し、「もっと見る」で5件ずつ追加表示する
// （2026-10-22、投稿一覧が長くなるとページが重くなる問題への対処）。
export default function MyConsultationsPanel() {
  const [items, setItems] = useState<Consultation[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
        <>
          {items.slice(0, visibleCount).map((item) => (
            <ConsultationCard
              key={item.id}
              item={item}
              showDelete
              onDeleted={(id) => setItems((prev) => (prev || []).filter((c) => c.id !== id))}
            />
          ))}
          {visibleCount < items.length && (
            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            >
              もっと見る（残り{items.length - visibleCount}件）
            </button>
          )}
        </>
      )}
    </>
  );
}
