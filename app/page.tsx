import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getConsultationsList } from '@/lib/consultations';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import HomeClient from './HomeClient';

// データベースの最新状態を毎回サーバー側で取得して表示するページなので、
// ビルド時の静的化（prerender）はせず、リクエストごとに生成する。
export const instant = false;

export const metadata: Metadata = {
  title: `${SITE_NAME}｜不登校の悩みをAIと専門家に相談`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

async function getGuidelines() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  return data;
}

async function getCounts() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('consultations').select('category').eq('hidden', false);
  const counts: Record<string, number> = {};
  (data || []).forEach((row: { category: string }) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
  });
  return { counts, total: (data || []).length };
}

// PCの広い画面でホーム画面サイドバーに出す、差し替え可能な広告・アフィリエイトバナー枠
// （/adminで編集）。未設定・無効時はnullを返し、HomeClient側で何も表示しない。
async function getSidebarBanner() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('sidebar_banners')
    .select('enabled, image_url, link_url, alt_text')
    .eq('id', 'default')
    .single();
  return data || null;
}

// ホーム画面にも「専門家一覧」の導線を置くため、本人確認済みの専門家を取得する
// （/expertsページと同じ条件。トップでは件数を絞って表示し、全件は/expertsへ誘導する）。
async function getVerifiedExperts() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, credential, bio, photo_url')
    .eq('verified', true)
    .order('created_at', { ascending: true })
    .limit(3);
  return data || [];
}

export default async function HomePage() {
  // クローラー・初回表示用に「全カテゴリ・匿名」の一覧をサーバー側で取得する。
  // カテゴリ切り替えなど、その後の絞り込みはクライアント側（HomeClient）で行う。
  const [items, guidelines, { counts, total }, sidebarBanner, experts] = await Promise.all([
    getConsultationsList({ category: 'all', viewerId: null }),
    getGuidelines(),
    getCounts(),
    getSidebarBanner(),
    getVerifiedExperts(),
  ]);

  return (
    <Suspense fallback={null}>
      <HomeClient
        initialItems={items}
        initialSupervised={!!guidelines?.supervised}
        initialCounts={counts}
        initialTotal={total}
        initialSidebarBanner={sidebarBanner}
        initialExperts={experts}
      />
    </Suspense>
  );
}
