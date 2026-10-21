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
        disallow: ['/admin', '/admin/*', '/mypage', '/account', '/login', '/expert/*', '/api/*'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
