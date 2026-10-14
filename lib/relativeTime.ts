// 相談カードの投稿日時を「3分前」「2時間前」のような相対表示にするヘルパー。
// ホームの一覧が「今まさに動いている」感を出せるようにとの要望（2026-10-15）で追加。
// 絶対日付（10/1 等）に比べ、実際の投稿頻度がそのまま伝わるのが狙い。
export function relativeTimeLabel(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return 'たった今';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}日前`;

  const d = new Date(then);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 投稿から1時間以内かどうか（NEWバッジの表示判定用）。
export function isRecentPost(isoDate: string): boolean {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return false;
  return Date.now() - then < 60 * 60 * 1000;
}
