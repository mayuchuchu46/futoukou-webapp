// 「親のご褒美クラブ」のご褒美提案に「これやってみる！」チェックを付けた後、
// 次回訪問時に「やりましたか？」と軽く気づかせる仕組み（2026-11-11追加）。
// 単発の提案で終わらせず、継続利用のきっかけにするための第一歩として、
// サーバー保存・ログイン・通知の仕組みは作らず、lib/uid.tsと同じ
// localStorageのみで完結させる（プッシュ通知等は将来の検討事項）。

export type GohoubiTriedItem = {
  title: string;
  category: string;
  savedAt: string; // ISO文字列
  status: 'pending' | 'done' | 'skipped';
};

const GOHOUBI_TRIED_KEY = 'dsk_gohoubi_tried';

export function getGohoubiTried(): GohoubiTriedItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GOHOUBI_TRIED_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GohoubiTriedItem;
  } catch {
    return null;
  }
}

export function setGohoubiTried(title: string, category: string) {
  if (typeof window === 'undefined') return;
  try {
    const item: GohoubiTriedItem = {
      title,
      category,
      savedAt: new Date().toISOString(),
      status: 'pending',
    };
    localStorage.setItem(GOHOUBI_TRIED_KEY, JSON.stringify(item));
  } catch {
    // localStorageが使えない環境では何もしない（チェック機能が無くても提案自体は可能）
  }
}

export function updateGohoubiTriedStatus(status: 'done' | 'skipped') {
  if (typeof window === 'undefined') return;
  try {
    const current = getGohoubiTried();
    if (!current) return;
    const updated: GohoubiTriedItem = { ...current, status };
    localStorage.setItem(GOHOUBI_TRIED_KEY, JSON.stringify(updated));
  } catch {
    // noop
  }
}

export function clearGohoubiTried() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GOHOUBI_TRIED_KEY);
  } catch {
    // noop
  }
}
