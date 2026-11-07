import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// /today/page.tsxは'use client'のため、ページ本体からmetadataをexportできない。
// app/ask/layout.tsxと同じ理由で追加（2026-11-08、「SEO最優先で」との指摘）。
export const metadata: Metadata = {
  title: `みんなのデータ - 不登校の家庭の今の状況をアンケートで比べる | ${SITE_NAME}`,
  description:
    '同じように不登校のお子さんと向き合う保護者が、今の状況について答えた日替わりアンケートの集計が見られます。回答すると、同じ質問を選んだ全員分のグラフを確認できます。',
  alternates: { canonical: `${SITE_URL}/today` },
};

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
