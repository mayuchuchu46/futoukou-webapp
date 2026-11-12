import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // ログイン・管理者・個人の相談投稿フォームなどはクロール対象外にする
        // 2026-10-21、マイページを/accountに統合したため対象を変更（/mypageは/accountへの
        // リダイレクトのみになった）。
        // 2026-11-08、「SEO最優先で」との指摘を受けて確認したところ、「/expert/*」が
        // 専門家の非公開ページ（profile・earnings・register・login・dashboard）だけで
        // なく、公開の募集ページ「/expert/recruit」（PCトップのヒーローバナー等から
        // リンクされている）まで丸ごとブロックしてしまっていたため、非公開ページを
        // 個別に指定する形に変更した。
        disallow: [
          '/admin',
          '/admin/*',
          '/mypage',
          '/account',
          '/login',
          '/expert/profile',
          '/expert/earnings',
          '/expert/register',
          '/expert/login',
          '/expert/dashboard',
          // 経験者版の登録フォーム（2026-11-08追加）。専門家版（/expert/register）は
          // 既にブロック対象、経験者版だけ漏れていた。
          '/senpai/register',
          '/api/*',
          // Next.js App RouterのOGP画像エンドポイント（2026-11-12追加）。
          // /gakko/free/387/opengraph-image?... のようなURLをGoogleがクロールして
          // 「クロール済み - インデックス未登録」として積み上がっており、クロールバジェットを
          // 消費していた。これらはHTMLページではなく画像ファイルなので、クロール対象外にする。
          // twitter-imageも同様。
          '/*opengraph-image*',
          '/*twitter-image*',
          // 外部リンクリダイレクトハンドラ（2026-11-12追加）。
          // /out?to=https://... のURLをGoogleがクロールして同様にクロールバジェットを消費していた。
          '/out',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
