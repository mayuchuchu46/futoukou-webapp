'use client';

import { useEffect, useState } from 'react';
import { FavoriteType, isFavorite, toggleFavorite } from '@/lib/favorites';

// 学校詳細ページ（学びの多様化学校・フリースクール地域・通信制高校・オンライン
// フリースクール）共通の「お気に入り保存」ボタン（2026-10-22追加）。
//
// 各詳細ページの既存のXシェアボタン（.share-btn）の隣に置く想定。保存状態は
// マウント後にlocalStorageから読むため、SSR直後は常に未保存表示になる
// （lib/uid.tsのAskDraft等と同じ、ハイドレーション不一致を避けるための作り）。
export default function FavoriteButton({
  type,
  no,
  name,
  meta,
}: {
  type: FavoriteType;
  no: number;
  name: string;
  meta?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(type, no));
  }, [type, no]);

  return (
    <button
      type="button"
      className="fav-btn"
      aria-pressed={saved}
      style={{ width: '100%' }}
      onClick={() => setSaved(toggleFavorite({ type, no, name, meta }))}
    >
      <span className="fav-btn-icon">{saved ? '★' : '☆'}</span>
      {saved ? 'お気に入り保存済み' : 'お気に入りに保存'}
    </button>
  );
}
