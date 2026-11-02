// 都道府県ごとの一覧系タブ（学びの多様化学校・フリースクール・教育支援センター・
// 助成金・支援制度など）で、その都道府県の情報が見つからなかった時に出す案内文の
// 共通テンプレート。
//
// 元は/gakko/matome/page.tsxだけに定義されていたが、各タブ本体
// （FreeSchoolExplorer.tsx・ShienExplorer.tsx・JoseiExplorer.tsx等）にはそれぞれ
// 独自の文言が残っていて、「見つかりませんでした」「確認できませんでした」など
// 言い回しが微妙に不統一だった（学び場UI/UX見直し、futoukou-gakko-ux-review.md
// のP3）。matomeページで統一時に作ったこのテンプレートを共通ファイルに切り出し、
// 各タブからも同じものを使うようにした（2026-11-02）。
//
// 必ず「無いという意味ではなく、確認できなかっただけ」という安心材料の一文を
// 添える（タブによって元々これが付いていたり無かったりしていた）。
export function notFoundText(selected: string, thingLabel: string, extra?: string): string {
  return `${selected}については、${thingLabel}を確認できませんでした。${thingLabel}が無いという意味ではなく、確認できなかったということです。${extra || ''}`;
}
