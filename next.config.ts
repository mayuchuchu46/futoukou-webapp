import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,

  // Next.js App RouterのOGP画像エンドポイント（/news/[id]/opengraph-image等）を
  // Googleの検索結果に出したくない（2026-11-12、クロール予算対策として一時期
  // app/robots.tsでdisallowしていたが、Xのシェアカード生成クローラーもブロック
  // してしまいシェア画像が表示されなくなる不具合が発生したため2026-11-14に撤回）。
  // robots.txtでのdisallow（＝クロール自体の禁止）ではなく、レスポンスヘッダーで
  // `X-Robots-Tag: noindex`を付ける方式にすることで、クロール（画像取得）は
  // 誰にでも許可しつつ、Googleの検索結果には出さないようにする。これにより、
  // X（Twitter）・LINE・Slack等どのSNS/チャットのプレビュークローラーでも
  // 確実に画像を取得できる。
  async headers() {
    const noindexHeader = [{ key: 'X-Robots-Tag', value: 'noindex' }];
    return [
      { source: '/opengraph-image', headers: noindexHeader },
      { source: '/:path*/opengraph-image', headers: noindexHeader },
      { source: '/twitter-image', headers: noindexHeader },
      { source: '/:path*/twitter-image', headers: noindexHeader },
    ];
  },
};

export default nextConfig;
