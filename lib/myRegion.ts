// 「自分の地域（都道府県・市区町村）」登録機能（2026-11-01追加、「自分の自治体を
// 登録すると、その自治体の情報が優先的に表示されるようにしたい」との要望を受けて）。
// ログイン不要・匿名で、lib/favorites.ts・lib/uid.tsと同じ考え方でlocalStorageだけに
// 保存する（サーバー側には何も送らない）。localStorageが使えない環境（プライベート
// モード等）でもページ自体は壊れないよう、SSRガードとtry/catchを必ず入れる。

export type MyRegion = { prefecture: string; city: string };

const MY_REGION_KEY = 'dsk_my_region';

export function getMyRegion(): MyRegion | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MY_REGION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.prefecture === 'string' &&
      typeof parsed.city === 'string' &&
      parsed.prefecture &&
      parsed.city
    ) {
      return { prefecture: parsed.prefecture, city: parsed.city };
    }
    return null;
  } catch {
    return null;
  }
}

export function setMyRegion(region: MyRegion) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MY_REGION_KEY, JSON.stringify(region));
  } catch {
    // localStorageが使えない環境では何もしない（ページは壊さない）
  }
}

export function clearMyRegion() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MY_REGION_KEY);
  } catch {
    // 同上
  }
}
