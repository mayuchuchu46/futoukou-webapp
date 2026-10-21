'use client';

import { useEffect, useRef, useState } from 'react';
import { FavoriteType, isFavorite, toggleFavorite } from '@/lib/favorites';
import { fetchServerFavorites, pushFavoriteToServer, removeFavoriteFromServer } from '@/lib/favoritesSync';

// 学校詳細ページ（学びの多様化学校・フリースクール地域・通信制高校・オンライン
// フリースクール）共通の「お気に入り保存」ボタン（2026-10-22追加）。
//
// 各詳細ページの既存のXシェアボタン（.share-btn）の隣に置く想定。保存状態は
// マウント後にlocalStorageから読むため、SSR直後は常に未保存表示になる
// （lib/uid.tsのAskDraft等と同じ、ハイドレーション不一致を避けるための作り）。
//
// 会員ログイン中は、他の端末での保存状況も反映できるよう、マウント時にサーバー
// （app/api/favorites/route.ts）の最新状態を問い合わせて上書きする。未ログインの
// 場合はローカル保存だけで動く（lib/favoritesSync.ts参照）。
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
  const loggedInRef = useRef(false);

  useEffect(() => {
    setSaved(isFavorite(type, no)); // まずローカルの状態で即時表示

    let cancelled = false;
    fetchServerFavorites().then(({ loggedIn, favorites }) => {
      if (cancelled) return;
      loggedInRef.current = loggedIn;
      if (!loggedIn) return;
      setSaved(favorites.some((f) => f.type === type && f.no === no));
    });
    return () => {
      cancelled = true;
    };
  }, [type, no]);

  function handleClick() {
    const next = toggleFavorite({ type, no, name, meta });
    setSaved(next);
    if (loggedInRef.current) {
      if (next) pushFavoriteToServer({ type, no, name, meta });
      else removeFavoriteFromServer(type, no);
    }
  }

  return (
    <button type="button" className="fav-btn" aria-pressed={saved} style={{ width: '100%' }} onClick={handleClick}>
      <span className="fav-btn-icon">{saved ? '★' : '☆'}</span>
      {saved ? 'お気に入り保存済み' : 'お気に入りに保存'}
    </button>
  );
}
