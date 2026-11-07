import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// /ask/page.tsxは'use client'のため、ページ本体からmetadataをexportできない。
// 2026-11-08、「SEO最優先で」との指摘を受けて、全ページ共通のレイアウトの
// デフォルトtitle（layout.tsxのdefault）のまま固有のtitle/descriptionが
// 出ていなかったこのページにも、ルートごとのlayout.tsxを追加してmetadataを
// 持たせる（Next.jsのApp Routerの標準的な方法。クライアントコンポーネント自体は
// 変更しない）。
export const metadata: Metadata = {
  title: `不登校の相談をする - AI＋専門家に無料相談 | ${SITE_NAME}`,
  description:
    '不登校のお子さんのことを、AIと専門家・経験者に無料で相談できます。悩みのカテゴリを選んで、今の状況を聞かせてください。',
  alternates: { canonical: `${SITE_URL}/ask` },
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
