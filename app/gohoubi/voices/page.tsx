import type { Metadata } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import VoicesClient from './VoicesClient';

// 「みんなのご褒美」一覧ページ（2026-11-14追加）。/gohoubiの投稿を公開で流す別枠ページ。
const TITLE = 'みんなのご褒美';
const DESC = '「親のご褒美クラブ」に投稿された、頑張った自分へのご褒美とAIからの一言を一覧で見られます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/gohoubi/voices` },
};

export default function GohoubiVoicesPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h1 className="sr-only">{TITLE}</h1>
          <VoicesClient />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
