import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import SenpaiListClient from './SenpaiListClient';

// app/expertlist/page.tsxの先輩保護者版（2026-11-02追加、「先輩保護者の回答って
// バージョンも欲しいね」との要望を受けて）。中身（一覧のクライアント側fetch）は
// SenpaiListClientに分離した。Client Componentからはmetadataをexportできないため、
// metadata用にServer Componentのpage.tsxを用意する形は/expertlistと同じ。
export const metadata: Metadata = {
  title: `先輩保護者が回答した相談｜${SITE_NAME}`,
  description: '先輩保護者（経験者）本人が相談文を読んで直接回答した相談の一覧です。',
  alternates: { canonical: `${SITE_URL}/senpailist` },
};

export default function SenpaiListPage() {
  return <SenpaiListClient />;
}
