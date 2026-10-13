import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import ThemeClient from './ThemeClient';

// 中身（カテゴリ一覧・件数のクライアント側fetch）はThemeClientに分離した。
// Client Componentからはmetadataをexportできないため、metadata用に
// Server Componentのpage.tsxを用意する形にした（2026-10-14、SEO対策の一環）。
export const metadata: Metadata = {
  title: `テーマから探す｜${SITE_NAME}`,
  description: '身体的要因・友人関係・学校との関係など、テーマ別に不登校の相談を探せます。',
  alternates: { canonical: `${SITE_URL}/theme` },
};

export default function ThemePage() {
  return <ThemeClient />;
}
