import type { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();

  // 会員登録・ログイン・管理者ページなど、検索結果に出す意味のないページは含めない。
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/ask`, changeFrequency: 'monthly', priority: 0.6 },
    // about・support・theme・experts・expertlistは、以前はページ固有のmetadataが
    // 無くsitemapにも含めていなかったが、metadataを追加したのに合わせて
    // 追加した（2026-10-14、SEO対策の一環）。
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/support`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/theme`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/experts`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE_URL}/expertlist`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const { data } = await supabase
    .from('consultations')
    .select('id, created_at')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(5000);

  const consultationEntries: MetadataRoute.Sitemap = (data || []).map((row) => ({
    url: `${SITE_URL}/result/${row.id}`,
    lastModified: row.created_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...consultationEntries];
}
