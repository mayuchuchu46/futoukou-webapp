// 「みんなのデータ」（/today）の集計グラフ。
// 2026-11-02、「グラフが面白くない」「見せ方」との指摘を受けて選択肢ごとの色分け版に
// 更新したが、それでも「いけてない」とのことで、3案（ドーナツ／大きな数字を主役に
// した版／人型ピクトグラム）のモックアップを見てもらい、「B（大きな数字を主役にして、
// 内訳バーは補足として小さく）」を選んでもらった。このコンポーネントはその案で
// 実装している：一番多い回答の％を大きく見せ、各選択肢の内訳は細い棒＋件数だけの
// 控えめな表示にする。
// 「今日の質問」カードと「過去の質問」一覧の両方で同じ集計表示を使っていた（コピペで
// 重複していた）ため、ここに共通化した。sizeで文字・バーの太さだけ変える。
const CHOICE_COLORS = [
  { bar: 'var(--main)', text: 'var(--main)', bg: 'var(--sub)' },
  { bar: '#E8734F', text: '#B04F2E', bg: 'var(--orange-bg)' },
  { bar: '#4F8FE8', text: '#2E5FB0', bg: 'var(--slate-bg)' },
  { bar: '#D4A62A', text: '#8A6A1A', bg: 'var(--yellow-bg)' },
  { bar: '#8A6FBF', text: '#5C4A73', bg: 'var(--lilac-bg)' },
  { bar: '#5FA394', text: '#1B5951', bg: 'var(--teal-bg)' },
  { bar: '#C76B8A', text: '#8C3A26', bg: 'var(--seal-bg)' },
  { bar: '#8A9B4E', text: '#56601F', bg: 'var(--moss-bg)' },
];

export type ChartChoice = { value: string; label: string };
export type ChartAggregate = { total: number; counts: Record<string, number> };

export default function DailyQuestionChart({
  choices,
  aggregate,
  myAnswer,
  size = 'normal',
}: {
  choices: ChartChoice[];
  aggregate: ChartAggregate;
  myAnswer: string | null;
  size?: 'normal' | 'compact';
}) {
  const compact = size === 'compact';
  const top = choices.reduce<{ choice: ChartChoice; count: number } | null>((best, c) => {
    const count = aggregate.counts[c.value] || 0;
    if (!best || count > best.count) return { choice: c, count };
    return best;
  }, null);
  const topPct = top && aggregate.total > 0 ? Math.round((top.count / aggregate.total) * 100) : 0;
  const topColor = top ? CHOICE_COLORS[choices.indexOf(top.choice) % CHOICE_COLORS.length] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8, width: '100%' }}>
      <div className="muted" style={{ fontSize: compact ? 11 : 12 }}>これまでの回答：{aggregate.total}件</div>

      {/* 一番多い回答を主役として大きく見せる（2026-11-02、モックアップ案Bを採用）。
          総数が少なすぎる段階だと「1件中1件で100%」のような大げさな表示になって
          しまうため、3件未満のときは出さない。 */}
      {top && topColor && aggregate.total >= 3 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            background: topColor.bg,
            borderRadius: 12,
            padding: compact ? '10px 14px' : '14px 16px',
          }}
        >
          <span style={{ fontSize: compact ? 26 : 36, fontWeight: 800, color: topColor.text, lineHeight: 1 }}>
            {topPct}%
          </span>
          <span style={{ fontSize: compact ? 11 : 13, fontWeight: 700 }}>
            が「{top.choice.label}」と回答
          </span>
        </div>
      )}

      {/* 内訳は、上の大きな数字を補足する細いバーだけに留める（色分けは残すが、
          ラベル・バーともに控えめなサイズにする）。 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6 }}>
        {choices.map((c, i) => {
          const count = aggregate.counts[c.value] || 0;
          const pct = aggregate.total > 0 ? Math.round((count / aggregate.total) * 100) : 0;
          const isMine = c.value === myAnswer;
          const color = CHOICE_COLORS[i % CHOICE_COLORS.length];
          return (
            <div key={c.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: compact ? 11 : 12 }}>
              <span
                style={{
                  width: compact ? 76 : 92,
                  flex: '0 0 auto',
                  fontWeight: isMine ? 700 : 400,
                  color: isMine ? 'var(--text)' : 'var(--muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={c.label}
              >
                {c.label}
                {isMine && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>（あなた）</span>}
              </span>
              <span style={{ flex: 1, height: compact ? 6 : 7, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'block',
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: color.bar,
                    transition: 'width 0.3s ease',
                  }}
                />
              </span>
              <span className="muted" style={{ width: compact ? 44 : 50, flex: '0 0 auto', textAlign: 'right' }}>{count}件</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
