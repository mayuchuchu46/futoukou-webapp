'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { FavoriteItem, FavoriteType, getFavorites, removeFavorite } from '@/lib/favorites';

// 学校詳細ページで保存した「お気に入り」の一覧ページ（2026-10-22追加）。
//
// 保存先はlocalStorageのみ（lib/favorites.ts）でサーバーには何も送らないため、
// このページもサーバーコンポーネントではなく、マウント後にクライアント側で
// 読み込む作りにしている（他の端末・ブラウザとは共有されない）。
const TYPE_PATH: Record<FavoriteType, string> = {
  school: 'school',
  free: 'free',
  tsushin: 'tsushin',
  online: 'online',
};

const TYPE_LABEL: Record<FavoriteType, string> = {
  school: '学びの多様化学校',
  free: 'フリースクール',
  tsushin: '通信制高校',
  online: 'オンラインフリースクール',
};

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[] | null>(null);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">お気に入り</h2>

          {items === null ? (
            <div className="muted">読み込み中…</div>
          ) : items.length === 0 ? (
            <>
              <div className="empty">
                まだお気に入りがありません。<br />
                学校・フリースクールの詳細ページにある「お気に入りに保存」から追加できます。
              </div>
              <Link href="/gakko/matome" className="btn-primary">学校・フリースクールを探す</Link>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {items.map((item) => (
                <div
                  key={`${item.type}:${item.no}`}
                  className="card"
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}
                >
                  <Link
                    href={`/gakko/${TYPE_PATH[item.type]}/${item.no}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: 2, textDecoration: 'none', color: 'inherit', minWidth: 0 }}
                  >
                    <span className="muted" style={{ fontSize: 11 }}>{TYPE_LABEL[item.type]}</span>
                    <span className="qtext" style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</span>
                    {item.meta && <span className="muted" style={{ fontSize: 12 }}>{item.meta}</span>}
                  </Link>
                  <button
                    type="button"
                    className="muted"
                    style={{ fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', flex: '0 0 auto' }}
                    onClick={() => {
                      removeFavorite(item.type, item.no);
                      setItems((prev) => (prev || []).filter((i) => !(i.type === item.type && i.no === item.no)));
                    }}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
