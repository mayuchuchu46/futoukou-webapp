import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// /notebook/page.tsxは'use client'のため、ページ本体からmetadataをexportできない。
// app/ask/layout.tsxと同じ理由で追加（2026-11-08、「SEO最優先で」との指摘）。
export const metadata: Metadata = {
  title: `伴走ノート - 今まで送った相談をまとめて振り返る | ${SITE_NAME}`,
  description:
    'どうする先生に送った相談を、伴走ノートとしてまとめて振り返れます。お子さんの状況や気づきを記録しておきたいときに使える機能です。',
  alternates: { canonical: `${SITE_URL}/notebook` },
};

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
