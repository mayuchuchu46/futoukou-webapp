type Stat = { label: string; value: number; unit: string };

// ニュース記事の数値比較バーグラフ（2026-10-29追加、app/news/page.tsxと
// app/news/[id]/page.tsxで共通化）。
//
// 改修の経緯：
// 1. 最初の実装はvar(--sub)（かなり薄い緑）を弱調色に使っていたが、
//    トラック（薄いベージュ）とほぼ同化して値が小さいバーが見えなかった
//    → はっきり視認できる中間トーンの緑（SECONDARY_COLOR）に変更。
// 2. それでも「まだわかりにくい」との指摘。原因は、バーの幅を「この記事の
//    数値の中での最大値」を基準に計算していたこと（例：19.9%の数値が、
//    その記事内で一番大きいというだけでバー幅100%＝丸々いっぱいになり、
//    「全体のうち19.9%」という“全体に対する割合”が伝わらなかった）。
//    →単位が%のときは、バー幅を実際のパーセント値そのもの（＝0〜100%の
//    目盛りの中でのその割合）にした。これで「全体のうちどれくらいか」が
//    ひと目でわかる（データ可視化の「全体に対する一つの比率＝メーター」の
//    考え方）。%以外の単位（人数など）は、従来通りこの記事内の最大値を
//    基準にした相対表示にフォールバックする。
const MAIN_COLOR = '#3D7E65'; // var(--main)と同じ
const SECONDARY_COLOR = '#6FA389'; // var(--sub)より十分濃く、トラックの薄ベージュとはっきり区別できる中間トーン

function barWidthPercent(stat: Stat, max: number): number {
  if (stat.unit === '%') {
    // 単位が%なら、0〜100%の目盛りに対する実際の割合をそのまま使う
    // （＝全体のうちどれくらいかが伝わる）。4%未満でも見た目で潰れない
    // 最低幅だけは確保する。
    return Math.min(Math.max(stat.value, stat.value > 0 ? 2 : 0), 100);
  }
  // %以外（人数など）は、記事内の最大値を基準にした相対表示にフォールバック。
  return max > 0 ? Math.max((stat.value / max) * 100, 4) : 0;
}

export default function NewsStatsChart({ stats }: { stats: Stat[] }) {
  if (!stats || stats.length === 0) return null;
  const max = Math.max(...stats.map((s) => s.value));
  const allPercent = stats.every((s) => s.unit === '%');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', margin: '4px 0' }}>
      {/* 単位が%の記事だけ、「0〜100%の目盛りに対する割合」であることを
          一言添える（2026-10-29追加。バーの意味の誤読を防ぐため）。 */}
      {allPercent && (
        <div className="muted" style={{ fontSize: 11 }}>全体を100%としたときの割合</div>
      )}
      {stats.map((s) => {
        const isMax = s.value === max;
        const color = isMax ? MAIN_COLOR : SECONDARY_COLOR;
        return (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13 }}>
              <span style={{ fontWeight: isMax ? 700 : 500 }}>{s.label}</span>
              <span style={{ fontWeight: 800, fontSize: 15, color }}>{s.value}{s.unit}</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 8, height: 16, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${barWidthPercent(s, max)}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
