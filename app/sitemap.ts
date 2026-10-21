import type { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SITE_URL } from '@/lib/site';
import { CATS } from '@/lib/categories';
import { DICTIONARY_INDEX_THRESHOLD } from '@/lib/categorySummary';
import { SEARCH_TAG_CANDIDATES, buildThemeOrFilter } from '@/lib/searchTags';
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';
import { FREE_SCHOOLS } from '@/lib/data/freeSchools';
import { CORRESPONDENCE_HIGH_SCHOOLS } from '@/lib/data/correspondenceHighSchools';
import { ONLINE_FREE_SCHOOLS } from '@/lib/data/onlineFreeSchools';
import { PREFECTURES } from '@/lib/data/prefectures';

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
    // 学びの多様化学校（旧：不登校特例校）の都道府県別一覧ページ（2026-10-18追加）。
    { url: `${SITE_URL}/gakko`, changeFrequency: 'monthly', priority: 0.4 },
    // 学校以外の学びの場・居場所のまとめページ（2026-10-21追加。/gakkoの各タブは
    // canonicalが常に/gakko自体を指すため個別にはインデックスされない設計だが、
    // このページは独立したcanonicalを持つため別途追加している）。
    { url: `${SITE_URL}/gakko/matome`, changeFrequency: 'monthly', priority: 0.4 },
    // 都道府県別まとめページ（?pref=XXX）。クエリパラメータ形式だがGoogleはインデックス
    // するため、実データがある都道府県（学びの多様化学校・フリースクール・通信制高校の
    // どれか1件以上ある）のみsitemapに追加（2026-10-22追加）。
    ...PREFECTURES.filter((pref) =>
      MANABI_TAYOUKA_GAKKO.some((s) => s.prefecture === pref) ||
      FREE_SCHOOLS.some((s) => s.prefecture === pref) ||
      CORRESPONDENCE_HIGH_SCHOOLS.some((s) => s.prefecture === pref)
    ).map((pref) => ({
      url: `${SITE_URL}/gakko/matome?pref=${encodeURIComponent(pref)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const { data } = await supabase
    .from('consultations')
    .select('id, created_at')
    .eq('hidden', false)
    // AIの回答への返信（ラリー）の続きは、単独の詳細ページとしては出さないため
    // サイトマップにも含めない（lib/consultations.ts参照、2026-10-16追加）。
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(5000);

  const consultationEntries: MetadataRoute.Sitemap = (data || []).map((row) => ({
    url: `${SITE_URL}/result/${row.id}`,
    lastModified: row.created_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // カテゴリ別「お悩み辞典」ページ（/dictionary/[category]）は、投稿が少ないうちは
  // ページ自体がnoindexになる（app/dictionary/[category]/page.tsx参照）。noindexの
  // ページをsitemapに載せても意味がない（むしろ矛盾したシグナルになる）ため、同じ
  // 閾値を満たしたカテゴリだけをここに含める（2026-10-15追加）。
  const categoryKeys = Object.keys(CATS);
  const categoryCounts = await Promise.all(
    categoryKeys.map((key) =>
      supabase
        .from('consultations')
        .select('id', { count: 'exact', head: true })
        .eq('hidden', false)
        .is('parent_id', null)
        .eq('category', key)
    )
  );
  const dictionaryEntries: MetadataRoute.Sitemap = categoryKeys
    .filter((key, i) => (categoryCounts[i].count || 0) >= DICTIONARY_INDEX_THRESHOLD)
    .map((key) => ({
      url: `${SITE_URL}/dictionary/${key}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

  // テーマ別「お悩み辞典」ページ（/dictionary/theme/[word]）も同様に、カテゴリ版と
  // 同じ閾値・考え方でnoindexのページを除外する（2026-10-15追加、「カテゴリーだけ
  // じゃなく、テーマも対象にして」との指摘を受けて）。
  const themeCounts = await Promise.all(
    SEARCH_TAG_CANDIDATES.map((word) =>
      supabase
        .from('consultations')
        .select('id', { count: 'exact', head: true })
        .eq('hidden', false)
        .is('parent_id', null)
        .or(buildThemeOrFilter(word))
    )
  );
  const themeEntries: MetadataRoute.Sitemap = SEARCH_TAG_CANDIDATES.filter(
    (_, i) => (themeCounts[i].count || 0) >= DICTIONARY_INDEX_THRESHOLD
  ).map((word) => ({
    url: `${SITE_URL}/dictionary/theme/${encodeURIComponent(word)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // 学校紹介ページ（/gakko/school/[no]）も、カテゴリ・テーマ辞典と同じ考え方で
  // 抜け漏れていた（2026-10-18、「SEO的にどう？」との質問を受けて確認したところ発覚）。
  // officialUrl・addressのどちらも確認できていない学校はページ自体がnoindexになる
  // （app/gakko/school/[no]/page.tsx参照）ため、同じ条件でここも絞り込む。
  const schoolEntries: MetadataRoute.Sitemap = MANABI_TAYOUKA_GAKKO.filter(
    (s) => s.officialUrl || s.address
  ).map((s) => ({
    url: `${SITE_URL}/gakko/school/${s.no}`,
    changeFrequency: 'monthly',
    priority: 0.3,
  }));

  // フリースクール紹介ページ（/gakko/free/[no]）も同じ考え方で追加（2026-10-21、
  // 「学びの多様化学校と同じ仕組みでフリースクールも詳細ページにつなげたい」との
  // 要望を受けて追加）。住所または公式サイトURLが確認できている施設のみindex対象
  // （app/gakko/free/[no]/page.tsxのhasEnoughInfoと同じ条件に合わせる。officialUrlだけ
  // 確認できた施設がここから漏れていたため2026-10-21に修正）。
  const freeSchoolEntries: MetadataRoute.Sitemap = FREE_SCHOOLS.filter((s) => s.address || s.officialUrl).map((s) => ({
    url: `${SITE_URL}/gakko/free/${s.no}`,
    changeFrequency: 'monthly',
    priority: 0.3,
  }));

  // 通信制高校紹介ページ（/gakko/tsushin/[no]）。公式サイトURLを調査・追加した
  // ため、officialUrlが確認できている学校のみindex対象とする（app/gakko/tsushin/
  // [no]/page.tsxのhasEnoughInfoと同じ条件。2026-10-21、全校officialUrl調査完了に
  // 合わせて追加。それまでは確認できている情報が少なく全校noindexだった）。
  const tsushinSchoolEntries: MetadataRoute.Sitemap = CORRESPONDENCE_HIGH_SCHOOLS.filter(
    (s) => s.officialUrl
  ).map((s) => ({
    url: `${SITE_URL}/gakko/tsushin/${s.no}`,
    changeFrequency: 'monthly',
    priority: 0.3,
  }));

  // オンラインフリースクール紹介ページ（/gakko/online/[no]）。情報は元々すべて確認済みの
  // ため、他カテゴリと異なりofficialUrl等の確認状況によるフィルターは不要（2026-10-21、
  // 「オンラインもまず内部ページで循環させたい」との指摘を受けて紹介ページを追加した際に
  // 合わせて追加）。
  const onlineSchoolEntries: MetadataRoute.Sitemap = ONLINE_FREE_SCHOOLS.map((s) => ({
    url: `${SITE_URL}/gakko/online/${s.no}`,
    changeFrequency: 'monthly',
    priority: 0.3,
  }));

  return [
    ...staticEntries,
    ...dictionaryEntries,
    ...themeEntries,
    ...schoolEntries,
    ...freeSchoolEntries,
    ...onlineSchoolEntries,
    ...tsushinSchoolEntries,
    ...consultationEntries,
  ];
}
