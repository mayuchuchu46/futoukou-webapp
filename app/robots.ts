import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // ログイン・管理者・個人の相談投稿フォームなどはクロール対象外にする
        disallow: ['/admin', '/admin/*', '/mypage', '/login', '/expert/*', '/api/*'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
