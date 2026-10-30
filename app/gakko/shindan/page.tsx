import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { buildShindanItems } from '@/lib/shindanItems';
import ShindanClient from './ShindanClient';

// 学校さがしの選択式診断（2026-10-30追加。当初は通信制のみ、同日に全種類へ拡張）。
// 学年・地域・学校の種類・通う頻度・心のケア専門職の有無を選ぶと、条件に当てはまる学校を一覧する。
// 並び順はデータ上の確認状況だけで決め、広告・アフィリエイトの有無や報酬額は一切使わない。
// 入力内容はサーバーに送らず、ブラウザ内だけで絞り込む（個人情報を扱わない）。
export const instant = false;

const TITLE = '条件から学校をさがす';
const DESC = '学年・お住まいの地域・学校の種類・通う頻度・心のケア専門職の有無を選ぶと、サイトに掲載している通信制高校・定時制高校・学びの多様化学校・フリースクール・オルタナティブスクールから条件に合う学校を確認できます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/gakko/shindan` },
};

export default function ShindanPage() {
  const items = buildShindanItems();

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div style={{ margin: '14px 0' }}>
            <Link href="/gakko" className="backlink">‹ 学校さがしトップへ</Link>
          </div>
          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>{TITLE}</div>
            <div className="qtext">{DESC}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              選んだ内容はこの端末のブラウザ内だけで使い、サーバーには送りません。掲載データは各校の公式情報・教育委員会等の公開資料をもとにしており、種類ごとに調査時点が異なります。
            </div>
          </div>
          <ShindanClient items={items} />
          <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>この診断について</div>
            <div className="qtext" style={{ fontSize: 13 }}>
              学校の並び順は、選んだ条件が確認できているかどうかだけで決めています。学校からの掲載料や広告の有無は並び順に影響しません。一部の学校の公式サイトへのリンクは、将来、資料請求等で当サイトに紹介料が入る可能性があるリンク（広告を含む）です。
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              「確認できていない」は「その条件に当てはまらない」という意味ではありません。対象学年は各校のデータに書かれている内容から読み取っており、書かれていない・読み取れない学校は「学年が未確認」として分けています。通う頻度や専門職の配置は、公式情報で確認できた学校だけに表示しています（通う頻度は現時点で通信制高校の一部のみ）。学費・入学条件・最新のコース内容は、必ず各校の公式サイトでご確認ください。
            </div>
          </div>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
