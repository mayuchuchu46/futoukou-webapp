// 「みんなのデータ」（/today）の集計グラフ。以前は選択肢ごとに同じ色の細い横棒＋
// パーセント表示だけで地味だったため、選択肢ごとに色分けするデザインに変更した
// （2026-11-02、「グラフが面白くない」「見せ方」との指摘を受けて）。
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
  // 件数が一番多い選択肢を見つけて、ひとことで要約できるようにする
  // （「一番多い回答を大きく見せる」案も検討したが、質問によっては選択肢が多く
  // 画面が間延びするため、まずは全選択肢を色分けしたうえで、一番多い回答だけ
  // 見出しで示す形にした）。
  const top = choices.reduce<{ choice: ChartChoice; count: number } | null>((best, c) => {
    const count = aggregate.counts[c.value] || 0;
    if (!best || count > best.count) return { choice: c, count };
    return best;
  }, null);
  const topPct = top && aggregate.total > 0 ? Math.round((top.count / aggregate.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8, width: '100%' }}>
      <div className="muted" style={{ fontSize: compact ? 11 : 12 }}>これまでの回答：{aggregate.total}件</div>

      {/* 一番多い回答を見出しとして見せる（2026-11-02追加）。総数が少なすぎる段階だと
          「1件中1件で100%」のような大げさな表示になってしまうため、3件未満のときは
          出さない。 */}
      {top && aggregate.total >= 3 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            background: CHOICE_COLORS[choices.indexOf(top.choice) % CHOICE_COLORS.length].bg,
            borderRadius: 8,
            padding: compact ? '6px 10px' : '8px 12px',
          }}
        >
          <span style={{ fontSize: compact ? 20 : 26, fontWeight: 800, color: CHOICE_COLORS[choices.indexOf(top.choice) % CHOICE_COLORS.length].text, lineHeight: 1 }}>
            {topPct}%
          </span>
          <span style={{ fontSize: compact ? 11 : 12, fontWeight: 700 }}>
            が「{top.choice.label}」と回答
          </span>
        </div>
      )}

      {choices.map((c, i) => {
        const count = aggregate.counts[c.value] || 0;
        const pct = aggregate.total > 0 ? Math.round((count / aggregate.total) * 100) : 0;
        const isMine = c.value === myAnswer;
        const color = CHOICE_COLORS[i % CHOICE_COLORS.length];
        return (
          <div key={c.value} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: compact ? 11 : 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: isMine ? 700 : 400 }}>
                <span
                  aria-hidden="true"
                  style={{ width: 9, height: 9, borderRadius: '50%', background: color.bar, flex: '0 0 auto' }}
                />
                {c.label}
                {isMine && (
                  <span
                    style={{
                      fontSize: compact ? 9 : 10,
                      fontWeight: 700,
                      color: color.text,
                      background: color.bg,
                      borderRadius: 999,
                      padding: '1px 7px',
                    }}
                  >
                    あなた
                  </span>
                )}
              </span>
              <span className="muted" style={{ fontWeight: isMine ? 700 : 400 }}>{count}件（{pct}%）</span>
            </div>
            <div style={{ background: color.bg, borderRadius: 999, height: compact ? 8 : 11, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color.bar,
                  borderRadius: 999,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
