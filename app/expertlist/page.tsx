import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import ExpertListClient from './ExpertListClient';

// 中身（専門家回答の一覧のクライアント側fetch）はExpertListClientに分離した。
// Client Componentからはmetadataをexportできないため、metadata用に
// Server Componentのpage.tsxを用意する形にした（2026-10-14、SEO対策の一環）。
export const metadata: Metadata = {
  title: `専門家が回答した相談｜${SITE_NAME}`,
  description: '専門家（公認心理師など）本人が相談文を読んで直接回答した相談の一覧です。',
  alternates: { canonical: `${SITE_URL}/expertlist` },
};

export default function ExpertListPage() {
  return <ExpertListClient />;
}
