import Link from 'next/link';
import { getFutoukouDataCardsSortedByNewest } from '@/lib/data/futoukouDataCards';

// TOPページに出す「データで見る不登校」への誘導バナー（2026-11-08追加）。
// 「トップのどこから見れる？」との指摘を受けて追加——/data/futoukouへの導線は
// 当初Header（PC限定の.header-globalnav）とPcSidebar（PC限定）にしか置いておらず、
// モバイルからのTOP画面にはどこにも入り口が無かった（NewsTeaser.tsxと同じ失敗を
// 繰り返さないよう、見た目・配置をNewsTeaserに揃える）。
// NewsTeaser.tsxと同じ.expertbanner/.expertbanner-todayを流用し、新しいCSSは増やさない。
// HomeClient.tsxでNewsTeaserの直下に配置（PC・モバイル共通のhome-main-col内のため、
// PcSidebar側への重複配置は不要）。
//
// 2026-11-10修正：「今日追加したデータ、TOPページに出さない？」との指摘を受けて、
// 常に固定文言（過去最多353,970人）を出していたのを、毎日のスケジュールタスクで
// 追加される最新カード（FUTOUKOU_DATA_CARDSの中でaddedAtが最も新しいもの）の見出しを
// 出すように変更。NewsTeaser.tsxの「最新ニュース1件＋NEWバッジ」パターンを流用し、
// 新しいCSSは増やさない（.new-badgeを再利用）。リンク先は個別シェアページではなく
// 概要ページ（/data/futoukou）のまま——FutoukouSummaryGridが同じ新着順ソートで
// タイル一覧の先頭に最新カードを出すため、ここから飛んでもすぐ見える。
//
// 2026-11-10再修正：「アイコンじゃなく、グラフや数字をこのバナーにも入れたい」との
// 要望を受けて、絵文字アイコン（📊）を見出し数字（headlineValue、.futoukou-tile-value
// と同じスタイル）に差し替え、カード自身のchartデータから実データのミニ棒グラフも
// 添えた。その後「バナーのデザインの配置バランス改善して」との指摘で、数字の真下に
// グラフを添える1つの塊に整理したが、最終的に「数字だけでいいかも」との判断で
// グラフ自体を削除し、見出し数字のみのシンプルな構成に戻した（2026-11-10）。
export default function FutoukouDataTeaser() {
  const latest = getFutoukouDataCardsSortedByNewest()[0];
  if (!latest) return null;

  // addedAtから3日以内はNEWバッジ（FutoukouSummaryGridのFUTOUKOU_NEW_BADGE_DAYSと
  // 揃える。こちらはuse cache化していないクライアント側コンポーネントのため、
  // Date.now()をそのまま使って問題ない）。
  const diffDays = Math.round((Date.now() - new Date(`${latest.addedAt}T00:00:00+09:00`).getTime()) / 86400000);
  const isNew = diffDays >= 0 && diffDays <= 3;

  return (
    <Link href="/data/futoukou" className="expertbanner expertbanner-today">
      <div className="expertbanner-stat" aria-hidden="true">
        <span className="expertbanner-stat-value">{latest.headlineValue}</span>
      </div>
      <div className="expertbanner-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isNew && <span className="new-badge">NEW</span>}
          <div className="expertbanner-title">{latest.title}</div>
        </div>
        <div className="expertbanner-desc">データで見る不登校（文部科学省調査より）</div>
      </div>
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
