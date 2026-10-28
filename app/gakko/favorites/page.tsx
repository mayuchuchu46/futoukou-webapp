'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { FavoriteItem, FavoriteType, getFavorites, removeFavorite, replaceFavorites } from '@/lib/favorites';
import { fetchServerFavorites, pushLocalFavoritesToServer, removeFavoriteFromServer } from '@/lib/favoritesSync';

// 学校詳細ページで保存した「お気に入り」の一覧ページ（2026-10-22追加）。
//
// 未ログイン時はブラウザのlocalStorageのみ（lib/favorites.ts）、ログイン中は
// 会員アカウントに紐づくサーバー側（favoritesテーブル）が正となる。ここでは
// マウント時に「ローカル分をサーバーへ反映→サーバーの最新一覧を取得」の順で
// 呼ぶことで、以前匿名で保存していた分も含めて正しく表示する。
const TYPE_PATH: Record<FavoriteType, string> = {
  school: 'school',
  free: 'free',
  tsushin: 'tsushin',
  online: 'online',
  teiji: 'teiji',
};

const TYPE_LABEL: Record<FavoriteType, string> = {
  school: '学びの多様化学校',
  free: 'フリースクール',
  tsushin: '通信制高校',
  online: 'オンラインフリースクール',
  teiji: '定時制高校',
};

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[] | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 未ログイン時代にこの端末で保存していた分をサーバーに引き継いでおく
      // （ログイン・登録直後にも呼んでいるが、取りこぼし対策としてここでも呼ぶ）。
      await pushLocalFavoritesToServer();
      const { loggedIn: isLoggedIn, favorites } = await fetchServerFavorites();
      if (cancelled) return;
      setLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        replaceFavorites(favorites); // この端末のローカル保存もサーバーの最新状態に合わせておく
        setItems(favorites);
      } else {
        setItems(getFavorites());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleRemove(item: FavoriteItem) {
    removeFavorite(item.type, item.no);
    if (loggedIn) removeFavoriteFromServer(item.type, item.no);
    setItems((prev) => (prev || []).filter((i) => !(i.type === item.type && i.no === item.no)));
  }

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
            <>
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
                      onClick={() => handleRemove(item)}
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>

              {/* 未ログインの場合だけ、会員登録すれば他の端末でも見られることを
                  控えめに案内する（/result/[id]のSaveConsultationPromptと同じ考え方で、
                  相談自体と同様「登録しないと使えない」という強制はしない）。 */}
              {!loggedIn && (
                <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
                  <div className="answer-label" style={{ fontSize: 14 }}>このお気に入り、残しておけます</div>
                  <div className="qtext" style={{ fontSize: 13 }}>
                    今はこの端末・このブラウザだけに保存されています。無料の会員登録をすると、スマホとパソコンなど他の端末からも同じお気に入りを見られるようになります。
                  </div>
                  <a className="btn-primary" href={`/account/register?next=${encodeURIComponent('/gakko/favorites')}`}>
                    無料で登録する
                  </a>
                </div>
              )}
            </>
          )}
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
