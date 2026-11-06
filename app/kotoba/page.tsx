import type { Metadata } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import KotobaClient from './KotobaClient';

// 「子供の言葉、ほんとはこう」機能（2026-11-06追加）。子供が言った言葉をそのまま
// 入れると、考えられる心理解釈と親としての返し方の例を提示するミニツール。
// ログイン不要で使える、相談（/ask）・専門家への質問への入口として位置づける。
// 入力内容はAI判定のためサーバーに送るが、保存はしない（相談のような履歴化はしない）。
const TITLE = '子供の言葉、ほんとはこう';
const DESC = '「学校行きたくない」「もう無理」など、お子さんが言った言葉をそのまま入れると、考えられる気持ちと、親としての返し方の例を確認できます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/kotoba` },
};

export default function KotobaPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <KotobaClient />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
