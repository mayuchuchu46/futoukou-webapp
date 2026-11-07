import type { Metadata } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import KotobaClient from './KotobaClient';

// 「子供の言葉、ほんとはこう」機能（2026-11-06追加）。子供が言った言葉をそのまま
// 入れると、考えられる心理解釈と親としての返し方の例を提示するミニツール。
// ログイン不要で使える、相談（/ask）・専門家への質問への入口として位置づける。
// 2026-11-07、crisis・空振り以外の解釈結果は、通常の相談と同じ形で「みんなの相談」に
// 匿名で自動公開するようにした（lib/kotobaHonyaku.ts・app/api/kotoba-honyaku/route.ts
// 参照）。「保存しない」という以前の前提は無くなっている。
// 2026-11-07、「誘導のテキストの説明がわかりにくい」との指摘を受けて、機能名として
// 「子どもの本音翻訳」を付けた（候補出し→「ホンネ翻訳」→「子どもの」を付けて対象が
// 誰の本音かを明確にした最終形）。「子供の言葉、ほんとはこう」は元々のキャッチコピー
// として、名称のすぐ下にサブタイトル的に残している（TOPバナー・/askバナー・
// KotobaClientの見出し、全て同じ扱い）。
const TITLE = '子どもの本音翻訳';
const SUBTITLE = '子供の言葉、ほんとはこう';
const DESC = '「学校行きたくない」「もう無理」など、お子さんが言った言葉をそのまま入れると、考えられる気持ちと、親としての返し方の例を確認できます。';

export const metadata: Metadata = {
  title: `${TITLE}（${SUBTITLE}） | ${SITE_NAME}`,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/kotoba` },
};

export default function KotobaPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          {/* Headerのhero-catchをpに戻した（2026-11-08）ことで、固有のh1を持たない
              ページがh1無しになるため追加。見た目は変えずsr-only。 */}
          <h1 className="sr-only">{TITLE}（{SUBTITLE}）</h1>
          <KotobaClient />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
