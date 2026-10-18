import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getConsultationsList } from '@/lib/consultations';
import { expertDisplayName } from '@/lib/expertDisplay';
import { CATS } from '@/lib/categories';
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
    title: `${SITE_NAME}｜不登校の悩みをAIと専門家に相談`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ja_JP',
    // Next.jsのmetadataはセグメントごとにopenGraph/twitterをまるごと上書きする
    // （layout.tsxで指定したimagesは継承されない）ため、ここでも明示的に指定する
    // 必要がある（2026-10-14、og-image.png追加時に気づいた）。
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME}｜不登校の悩みをAIと専門家に相談`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

// 「もっとサクサクいけないか」との指摘を受けて追加（2026-10-16）。guidelines（専門家
// 監修済みかどうか）はAI監修の進行状況に応じてごくまれにしか変わらないため、毎回SupabaseへSELECTしに
// 行く必要がない。'use cache'でキャッシュし、更新が多少遅れて反映されても実害がないぶん
// （cacheLife('minutes') = 最大1分おきに再検証、最長1時間で失効）、トップページ表示時の
// 往復を1つ減らす。
async function getGuidelines() {
  'use cache';
  cacheLife('minutes');
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  return data;
}

// カテゴリごとの件数（テーマ一覧チップの「身体面（12）」等に使う）とトップページの
// 合計件数を取得する。以前は全行（category列のみとはいえ）を毎回丸ごと取得してJS側で
// 数えていたため、投稿が増えるほど重くなる作りだった。head:trueの件数クエリ（行データを
// 転送しない）をカテゴリ数ぶん並列実行する形に変更し、データ量が増えても軽いままにした
// （2026-10-13、トップページの表示が遅いとの指摘を受けて）。
// 2026-10-16: 「もっとサクサクいけないか」との指摘を受け、このカウント自体を'use cache'化。
// 新しい投稿があっても件数表示が最大1分程度遅れて反映されるだけで実害が小さい一方、
// 投稿が増えるほど重くなっていた「カテゴリ数ぶん並列クエリ」を毎回のアクセスで
// 実行しなくて済むようになる。
async function getCounts() {
  'use cache';
  cacheLife('minutes');
  const supabase = getSupabaseAdmin();
  const categoryKeys = Object.keys(CATS);

  const [totalResult, ...categoryResults] = await Promise.all([
    supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('hidden', false),
    ...categoryKeys.map((key) =>
      supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('hidden', false)
        .eq('category', key)
    ),
  ]);

  const counts: Record<string, number> = {};
  categoryKeys.forEach((key, i) => {
    counts[key] = categoryResults[i].count || 0;
  });

  return { counts, total: totalResult.count || 0 };
}

// PCの広い画面でホーム画面サイドバーに出す、差し替え可能な広告・アフィリエイトバナー枠
// （/adminで編集）。未設定・無効時はnullを返し、HomeClient側で何も表示しない。
// 2026-10-16: 管理画面での編集頻度は低いため'use cache'化（上記getGuidelines等と同じ理由）。
async function getSidebarBanner() {
  'use cache';
  cacheLife('minutes');
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
// 2026-10-16: 専門家の本人確認（verified化）は管理画面での手作業のため頻度が低く'use cache'化。
async function getVerifiedExperts() {
  'use cache';
  cacheLife('minutes');
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential, bio, photo_url')
    .eq('verified', true)
    .order('created_at', { ascending: true })
    .limit(3);
  // 本名（name）は本人確認用のため、公開ページに渡す前に表示名へ置き換える
  // （2026-10-13、本名と表示名を分離）。
  return (data || []).map((e) => ({ ...e, name: expertDisplayName(e) }));
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

  // 上のPromise.allで必要なデータは全てawait済み（HomeClientに渡すpropsは全て解決済み）
  // なので、HomeClientをSuspenseで包んでも中で実際にsuspendするものは無い。
  // それにもかかわらずSuspense（fallback={null}）で囲んでいたため、スマホで他ページから
  // トップに戻る（クライアント側ナビゲーション）際に、このバウンダリがまれに一瞬
  // fallback（＝何も表示しない＝ヘッダーも含め真っ白）を出してから本来の内容に
  // 差し替わる現象が起きていた（2026-10-18、「たまにヘッダーが表示されない」との
  // 報告を受けて不要と判断し削除）。
  return (
    <HomeClient
      initialItems={items}
      initialSupervised={!!guidelines?.supervised}
      initialCounts={counts}
      initialTotal={total}
      initialSidebarBanner={sidebarBanner}
      initialExperts={experts}
    />
  );
}
