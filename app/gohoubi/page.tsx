import type { Metadata } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import GohoubiClient from './GohoubiClient';

// 「親のご褒美クラブ」機能（2026-11-10追加）。今日あったこと・頑張ったことを一言入れると、
// 今の自分に合ったご褒美（頑張りをねぎらう小さな行動）を提案するミニツール。/kotoba
// （子どもの本音翻訳）と同じ、ログイン不要・入口バナーから使う位置づけ。
const TITLE = '親のご褒美クラブ';
const SUBTITLE = '今日もがんばった自分に、ご褒美を';
const DESC = '今日あったこと・頑張ったことを一言書くと、今のあなたに合ったご褒美を提案します。';

export const metadata: Metadata = {
  title: `${TITLE}（${SUBTITLE}） | ${SITE_NAME}`,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/gohoubi` },
};

export default function GohoubiPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h1 className="sr-only">{TITLE}（{SUBTITLE}）</h1>
          <GohoubiClient />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
