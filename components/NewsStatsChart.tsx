type Stat = { label: string; value: number; unit: string };

// ニュース記事の数値比較バーグラフ（2026-10-29追加、app/news/page.tsxと
// app/news/[id]/page.tsxで共通化）。最初の実装はvar(--sub)（かなり薄い緑）を
// 弱調色に使っていたが、「このグラフわかりにくい」との指摘を受けて改修：
// - トラック（var(--border)、薄いベージュ）と弱調バーの色が近すぎて、値が
//   小さいバーがほとんど見えなかった → はっきり視認できる中間トーンの緑
//   （SECONDARY_COLOR）に変更。
// - バーを太く（8px→16px）、数値ラベルもバーと同じ色・太字にして、どちらが
//   どの数値かひと目でわかるようにした。
const MAIN_COLOR = '#3D7E65'; // var(--main)と同じ
const SECONDARY_COLOR = '#6FA389'; // var(--sub)より十分濃く、トラックの薄ベージュとはっきり区別できる中間トーン

export default function NewsStatsChart({ stats }: { stats: Stat[] }) {
  if (!stats || stats.length === 0) return null;
  const max = Math.max(...stats.map((s) => s.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', margin: '4px 0' }}>
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
                  width: `${max > 0 ? Math.max((s.value / max) * 100, 4) : 0}%`,
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
