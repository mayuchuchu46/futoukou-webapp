// もしもアフィリエイト「どこでもリンク」機能で、futoko-dosuru.comメディア
// （shop_site_id=697317）× 楽天市場の商品購入プロモーション（promotion_id=54）
// から発行されるリンク形式をそのまま再現したもの（2026-11-12追加）。
// 「どこでもリンク」で生成したHTMLソースを見ると、a_id・p_id・pc_id・pl_idは
// リンク先URLを変えても固定（このメディア×この楽天プロモーション固有の値）で、
// 変わるのは末尾のurlパラメータ（リンク先をURLエンコードしたもの）だけだった。
// そのため、楽天の検索結果URLを自分で組み立ててこの関数に通すだけで、
// 任意のキーワードのアフィリエイトリンクを量産できる。
//
// 親のご褒美クラブ（/gohoubi）で、AIの提案が購入可能な商品（is_product）の場合に、
// その商品カテゴリの楽天市場検索結果へのリンクとして使う。
// Amazonは提携審査中のため未実装（承認後、同じ考え方でlib/amazonAffiliate.ts等を追加予定）。

const MOSHIMO_A_ID = '5891385';
const RAKUTEN_PROMOTION_ID = '54';
const RAKUTEN_PL_ID = '616';

export function buildRakutenSearchUrl(keyword: string): string {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
}

export function buildRakutenAffiliateLink(targetUrl: string): string {
  const params = new URLSearchParams({
    a_id: MOSHIMO_A_ID,
    p_id: RAKUTEN_PROMOTION_ID,
    pc_id: RAKUTEN_PROMOTION_ID,
    pl_id: RAKUTEN_PL_ID,
    url: targetUrl,
  });
  return `https://af.moshimo.com/af/c/click?${params.toString()}`;
}

// キーワードから楽天市場の検索結果ページへのアフィリエイトリンクを直接組み立てる、
// gohoubi向けのショートカット。
export function buildRakutenSearchAffiliateLink(keyword: string): string {
  return buildRakutenAffiliateLink(buildRakutenSearchUrl(keyword));
}
