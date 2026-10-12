// 専門家の「本名」（name、本人確認用。運営のみが参照）と「表示名」（display_name、
// 相談者に公開される名前）を分離している（2026-10-13追加）。表示名が未設定の場合は
// 本名をそのまま公開表示に使う。本人確認・支払いなど運営向けの処理では、この関数を使わず
// 常に name（本名）をそのまま使うこと。
export function expertDisplayName(expert: { name: string; display_name?: string | null }): string {
  return (expert.display_name && expert.display_name.trim()) || expert.name;
}
