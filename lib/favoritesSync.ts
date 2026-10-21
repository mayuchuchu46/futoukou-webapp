// lib/favorites.ts（ブラウザのlocalStorageだけへの保存）と、会員アカウントに紐づく
// サーバー側のfavoritesテーブル（app/api/favorites/route.ts）をつなぐクライアント側
// ヘルパー（2026-10-22追加）。
//
// 未ログイン時はこれらの関数は何もしない（サーバーが401を返すだけで、呼び出し側は
// catchで無視すればよい）。ログイン・会員登録の直後にpushLocalFavoritesToServerを
// 呼ぶことで、未ログイン時代にこの端末で保存していたお気に入りを会員アカウントへ
// 引き継ぐ。

import { FavoriteItem, FavoriteType, getFavorites } from './favorites';

export type FavoritesApiResult = { loggedIn: boolean; favorites: FavoriteItem[] };

// サーバー側のお気に入り一覧を取得する。未ログインでもエラーにはならず
// loggedIn:false・favorites:[]が返る（呼び出し側はこの1回のレスポンスだけで
// ログイン状態の判定と一覧表示の両方を済ませられる）。
export async function fetchServerFavorites(): Promise<FavoritesApiResult> {
  try {
    const res = await fetch('/api/favorites');
    if (!res.ok) return { loggedIn: false, favorites: [] };
    return (await res.json()) as FavoritesApiResult;
  } catch {
    return { loggedIn: false, favorites: [] };
  }
}

// この端末のlocalStorage分をまとめてサーバーに反映する（upsertなので重複登録はされない）。
// ログイン・会員登録フォームの送信成功直後に呼ぶ想定。
export async function pushLocalFavoritesToServer(): Promise<void> {
  const items = getFavorites();
  if (items.length === 0) return;
  try {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {
    // 失敗してもローカル保存は残っているので、サイト利用自体には影響しない
  }
}

export async function pushFavoriteToServer(item: Omit<FavoriteItem, 'savedAt'>): Promise<void> {
  try {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  } catch {
    // noop（ローカルには保存済みなので、次にログイン状態で開いたときに再同期される）
  }
}

export async function removeFavoriteFromServer(type: FavoriteType, no: number): Promise<void> {
  try {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, no }),
    });
  } catch {
    // noop
  }
}
