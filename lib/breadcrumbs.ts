// パンくず（BreadcrumbList）構造化データの共通ヘルパー。
// 2026-11-08、「SEO強化」の一環として追加。学び場の個別詳細ページ群
// （/gakko/school, /gakko/free, /gakko/online, /gakko/tsushin, /gakko/teiji,
// /gakko/shien, /gakko/alternative の各[no]ページ）には階層（ホーム→学び場→
// 都道府県→個別施設）があるのに、検索結果にパス表示（リッチリザルトの
// breadcrumb）を出すための構造化データが無かったため追加する。

export type BreadcrumbItem = { name: string; url: string };

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
