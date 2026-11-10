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
// と同じスタイル）に差し替え、カード自身のchartデータ（trend/bars/ranking問わず）から
// 実データのミニ棒グラフを生成してCTA矢印の手前に追加した。TodayQuestionTeaser.tsxの
// .expertbanner-today-graphは「ぼかした見本グラフ」だったが、こちらは実データをそのまま
// 高さに反映する（.expertbanner-today-graph--realで、ぼかし・不透明度を解除）。
function getSparkValues(chart: ReturnType<typeof getFutoukouDataCardsSortedByNewest>[number]['chart']): number[] {
  if (chart.type === 'trend') return chart.data.slice(-5).map((d) => d.value);
  if (chart.type === 'bars') return chart.stats.slice(0, 5).map((s) => s.value);
  return chart.items.slice(0, 5).map((i) => i.value);
}

export default function FutoukouDataTeaser() {
  const latest = getFutoukouDataCardsSortedByNewest()[0];
  if (!latest) return null;

  // addedAtから3日以内はNEWバッジ（FutoukouSummaryGridのFUTOUKOU_NEW_BADGE_DAYSと
  // 揃える。こちらはuse cache化していないクライアント側コンポーネントのため、
  // Date.now()をそのまま使って問題ない）。
  const diffDays = Math.round((Date.now() - new Date(`${latest.addedAt}T00:00:00+09:00`).getTime()) / 86400000);
  const isNew = diffDays >= 0 && diffDays <= 3;

  // 最大5点に絞り、最小〜最大を20%〜100%の高さに正規化する（0%だと見えなくなるため
  // 下限を20%にしている）。全点が同じ値の場合は全バーを70%の高さで揃える。
  const sparkValues = getSparkValues(latest.chart);
  const min = Math.min(...sparkValues);
  const max = Math.max(...sparkValues);
  const sparkHeights =
    sparkValues.length >= 2
      ? sparkValues.map((v) => (max === min ? 70 : 20 + ((v - min) / (max - min)) * 80))
      : [];

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
      {sparkHeights.length >= 2 && (
        <div className="expertbanner-today-graph expertbanner-today-graph--real" aria-hidden="true">
          {sparkHeights.map((h, i) => (
            <span
              key={i}
              style={{
                height: `${Math.round(h)}%`,
                background: i === sparkHeights.length - 1 ? 'var(--main)' : 'var(--sub)',
              }}
            />
          ))}
        </div>
      )}
      <span className="expertbanner-cta">›</span>
    </Link>
  );
}
