import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { MIMAMORI_RESULTS, type MimamoriType } from '@/lib/mimamoriShindan';

// 診断結果の個別シェア用URL（2026-11-01追加）。タイプごとに固有のURLを持たせることで、
// X・Facebook・LINEでシェアした時にそのタイプ専用のOGP画像・説明文が表示されるようにする
// （以前は診断ページ自体のURL＝全タイプ共通の説明しか出せなかった）。
// タイプは4種類のみ・内容も固定のため、generateStaticParamsで全件ビルド時にプリレンダー
// する（アクセスごとのサーバー処理は発生しない＝運用コストはゼロのまま）。
const TYPES = Object.keys(MIMAMORI_RESULTS) as MimamoriType[];

export function generateStaticParams() {
  return TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const result = MIMAMORI_RESULTS[type as MimamoriType];
  if (!result) return {};

  const title = `診断結果：${result.name} | ${SITE_NAME}`;
  const description = `「見守り力」タイプ診断の結果は「${result.name}」。${result.catch}`;
  const url = `${SITE_URL}/shindan/mimamori/result/${type}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
    },
    twitter: {
      // タイプごとのOGP画像（opengraph-image.tsx）を大きく表示する。
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function MimamoriResultPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const result = MIMAMORI_RESULTS[type as MimamoriType];
  if (!result) notFound();

  const resultUrl = `${SITE_URL}/shindan/mimamori/result/${type}`;
  const shareText = `【見守り力タイプ診断】\n私は「${result.name}」でした。\n${result.catch}`;

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ margin: '14px 0' }}>
            <Link href="/shindan/mimamori" className="backlink">‹ 診断トップへ</Link>
          </div>
          <div className="card" style={{ alignItems: 'flex-start', gap: 12 }}>
            <div className="answer-label" style={{ fontSize: 13 }}>診断結果</div>
            {/* 2026-11-01追加：タイプ名・キャッチコピーを含むビジュアル（シェア画像と共通）。
                画像内にすでにタイプ名・キャッチコピーが入っているため、本文側で同じ文言を
                見出しとして重複表示しない。 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.image}
              alt={`${result.name}：${result.catch}`}
              width={1200}
              height={675}
              style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}
            />
            <div className="qtext">{result.desc}</div>
            <div className="card-answerbox" style={{ width: '100%' }}>
              <div className="qtext" style={{ fontSize: 13 }}>
                <strong>気をつけたいこと一つだけ：</strong>{result.caution}
              </div>
            </div>
            <Link href={`/dictionary/${result.categorySlug}`} className="btn-secondary" style={{ width: '100%' }}>
              {result.categoryLabel}に関する相談を見る
            </Link>
            <div className="share-btn-row" style={{ width: '100%' }}>
              <a
                className="share-btn"
                href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                  text: shareText,
                  url: resultUrl,
                  hashtags: 'どうする先生,不登校',
                })}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="share-btn-icon">𝕏</span>
                診断結果をシェア
              </a>
              <a
                className="share-btn share-btn-facebook"
                href={`https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: resultUrl })}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="share-btn-icon">f</span>
                Facebookでシェア
              </a>
              <a
                className="share-btn share-btn-line"
                href={`https://social-plugins.line.me/lineit/share?${new URLSearchParams({
                  url: resultUrl,
                  text: shareText,
                })}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="share-btn-icon">L</span>
                LINEでシェアする
              </a>
            </div>
            <Link href="/shindan/mimamori" className="btn-secondary" style={{ width: '100%' }}>
              もう一度診断する
            </Link>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
