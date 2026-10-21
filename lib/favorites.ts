// 学校詳細ページ（学びの多様化学校・フリースクール地域・通信制高校・オンライン
// フリースクール）の「お気に入り保存」機能（2026-10-22追加）。
//
// オーガニック検索から各学校の詳細ページに来た訪問者が、他のページを見ずに
// 離脱してしまうのを防ぐための仕組みのひとつ。ログイン不要・匿名で、
// lib/uid.tsと同じ考え方でlocalStorageだけに保存する（サーバー側には何も送らない）。
// localStorageが使えない環境（プライベートモード等）でもページ自体は壊れないよう、
// SSRガードとtry/catchをlib/uid.tsと同じスタイルで必ず入れる。

export type FavoriteType = 'school' | 'free' | 'tsushin' | 'online';

export type FavoriteItem = {
  type: FavoriteType;
  no: number;
  name: string;
  // 一覧表示用の補足（都道府県+市区町村など、カテゴリごとに内容が変わる）。
  meta?: string;
  savedAt: number;
};

const FAVORITES_KEY = 'dsk_favorites';

function favoriteKey(type: FavoriteType, no: number): string {
  return `${type}:${no}`;
}

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FavoriteItem[];
  } catch {
    return [];
  }
}

function saveFavorites(items: FavoriteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  } catch {
    // localStorageが使えない環境では何もしない（保存できないだけで、閲覧自体は可能）
  }
}

export function isFavorite(type: FavoriteType, no: number): boolean {
  const key = favoriteKey(type, no);
  return getFavorites().some((item) => favoriteKey(item.type, item.no) === key);
}

// 保存/解除を切り替える。切り替え後の状態（true=保存された）を返す。
export function toggleFavorite(item: Omit<FavoriteItem, 'savedAt'>): boolean {
  const key = favoriteKey(item.type, item.no);
  const current = getFavorites();
  const exists = current.some((f) => favoriteKey(f.type, f.no) === key);
  if (exists) {
    saveFavorites(current.filter((f) => favoriteKey(f.type, f.no) !== key));
    return false;
  }
  // 同じ学校を何度も保存操作しても重複登録しないよう、既存分は除いてから先頭に追加する。
  saveFavorites([{ ...item, savedAt: Date.now() }, ...current.filter((f) => favoriteKey(f.type, f.no) !== key)]);
  return true;
}

export function removeFavorite(type: FavoriteType, no: number) {
  const key = favoriteKey(type, no);
  saveFavorites(getFavorites().filter((f) => favoriteKey(f.type, f.no) !== key));
}

// サーバー側（会員アカウントに紐づくfavoritesテーブル、app/api/favorites/route.ts）の
// 最新状態でこの端末のlocalStorageを上書きする。ログイン中は複数端末で保存できるため、
// この端末のlocalStorageだけでは他端末での保存状況が分からない（2026-10-22追加、
// lib/favoritesSync.ts参照）。
export function replaceFavorites(items: FavoriteItem[]) {
  saveFavorites(items);
}
