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
          // 外部リンクリダイレクトハンドラ（2026-11-12追加）。
          // /out?to=https://... のURLをGoogleがクロールして同様にクロールバジェットを消費していた。
          '/out',
          // 【2026-11-12に追加→2026-11-14に削除】OGP画像エンドポイント
          // （/news/[id]/opengraph-image等）を、Googleのクロール予算対策として
          // 一時期ここでdisallowしていたが、これはUser-agent: *向けのルールのため、
          // X（Twitter）等のシェアカード生成クローラーもdisallowの対象になってしまい、
          // ニュース記事・データカードをXでシェアした際に画像が表示されなくなる不具合が
          // 発生した。Twitterbot個別にallowするルールも試したが、Xのカード検証ツール
          // （Card Validator）が「robots.txtに制限されている可能性がある」という警告を
          // 出し続け、実際のXクローラーで確実に効くか断言できなかったため、この方式自体を
          // やめた。代わりに、next.config.tsのheaders()で/opengraph-image・/twitter-image
          // パスに`X-Robots-Tag: noindex`を付与する方式に変更済み（クロール自体は誰にでも
          // 許可するので、どのSNS・チャットのプレビュークローラーでも画像を確実に取得できる。
          // Googleには見せつつ検索結果には出さない、という形でクロール予算対策の目的は維持）。
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
