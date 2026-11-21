import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { CATS } from '@/lib/categories';
import { getSupabaseAdmin } from '@/lib/supabase';

// 「一言カード」シェア専用の個別URL（2026-11-21追加）。
//
// 【経緯】QuoteShareCard（結果ページ内の「この一言をシェア」ボタン）は、以前
// シェア先のurlを/result/[id]（相談詳細ページそのもの）にしていた。そのため、
// 誰かが一言カード生成前に「この相談をシェア」ボタン等で同じURLを先に
// シェアしていると、Xはそのときの質問文ベースのOGP画像をURL単位でキャッシュ
// 済みのため、後から一言カードを生成してシェアしても、Xのカードには古い
// 質問文のままの画像が表示され、プレビューで見えていた一言カードとは
// 違うものが投稿されてしまう不具合があった（2026-11-21、実際にXでシェア
// したら一言カードの画像が出ず質問文のカードになっていた、との報告で発覚）。
// /result/[id]自体のOGP画像（opengraph-image.tsx）はone_linerの有無で表示を
// 切り替える作りのため、相談詳細ページのURLを複数の用途で共有すると、Xの
// URL単位キャッシュの先勝ちにより表示がずれてしまう。
// 一言カードの共有だけ専用のURL（/result/[id]/hitokoto）に分離することで、
// Xのキャッシュも分離され、常に一言カード（quote-image、1080x1080）が
// 表示されるようにした。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('consultations')
    .select('category, one_liner, crisis_detected, hidden')
    .eq('id', id)
    .single();

  if (!data || data.hidden || data.crisis_detected || !data.one_liner) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }

  const catLabel = CATS[data.category]?.label || CATS.other.label;
  const title = `${data.one_liner} | ${SITE_NAME}`;
  const description = `${catLabel}の相談から。${data.one_liner}`;
  const url = `${SITE_URL}/result/${id}/hitokoto`;
  const imageUrl = `${SITE_URL}/result/${id}/quote-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // クロールバジェット対策・検索結果に出す必要はない（Xのカード生成クローラー
    // 向けの専用ページのため）、next.config.tsのheaders()と同じ考え方で検索結果
    // には出さない（通常のrobotsメタで十分。opengraph-image自体ではないため
    // next.config.tsのnoindexHeaderのパス指定は対象外）。
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
      images: [{ url: imageUrl, width: 1080, height: 1080, alt: data.one_liner }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function HitokotoSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('consultations')
    .select('category, one_liner, crisis_detected, hidden')
    .eq('id', id)
    .single();

  if (!data || data.hidden || data.crisis_detected || !data.one_liner) {
    notFound();
  }

  const catLabel = CATS[data.category]?.label || CATS.other.label;

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div className="card" style={{ alignItems: 'center', gap: 14 }}>
            <div className="answer-label" style={{ fontSize: 13 }}>{catLabel}の相談から</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/result/${id}/quote-image`}
              alt={data.one_liner}
              width={1080}
              height={1080}
              style={{ width: '100%', maxWidth: 360, height: 'auto', borderRadius: 16, border: '1px solid var(--border)' }}
            />
            <Link href={`/result/${id}`} className="btn-primary" style={{ width: '100%' }}>
              相談と回答の全文を見る
            </Link>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
