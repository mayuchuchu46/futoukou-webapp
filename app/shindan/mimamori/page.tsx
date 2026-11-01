import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import MimamoriQuizClient from './MimamoriQuizClient';

// 拡散をメインに置いた診断コンテンツ（2026-11-01追加）。知識を正誤で問う「検定」
// ではなく、保護者の対応スタイルを4タイプに分類する診断にした（lib/mimamoriShindan.ts
// 参照）。AI呼び出しなし・DB読み書きなしの完全な静的ページ（データ取得が一切無いため
// /terms・/privacy・/faq等と同様にinstant exportは付けない＝デフォルトのまま即時プリ
// レンダーされる）。各タイプの結果から/dictionary/[category]（お悩み辞典）へ導線を張り、
// 診断→サービス本体（AIの無料相談）への流入を狙う。

const TITLE = 'あなたの「見守り力」タイプ診断';
const DESC = '全8問の質問に答えると、今のあなたの不登校対応スタイルを「静かな港」「あたため隊長」「伴走コーチ」「作戦参謀」の4タイプで診断します。どのタイプにも、今のあなたに合ったやり方があります。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/shindan/mimamori` },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESC,
    url: `${SITE_URL}/shindan/mimamori`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary',
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESC,
  },
};

export default function MimamoriShindanPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ margin: '14px 0' }}>
            <Link href="/" className="backlink">‹ ホームへ</Link>
          </div>
          {/* 2026-11-01追加：ChatGPTで作成したバナー（public/assets/shindan/mimamori-banner.jpg）。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/shindan/mimamori-banner.jpg"
            alt={TITLE}
            width={1600}
            height={534}
            style={{ width: '100%', height: 'auto', borderRadius: 12, marginBottom: 14 }}
          />
          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{TITLE}</div>
            <div className="qtext">{DESC}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              選んだ内容はこの端末のブラウザ内だけで使い、サーバーには送りません。診断結果は医学的・心理学的な評価ではなく、気軽に楽しんでいただくための簡易的なものです。
            </div>
          </div>
          <MimamoriQuizClient />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
