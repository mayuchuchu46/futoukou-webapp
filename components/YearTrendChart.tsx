// 年度別の推移を見せる縦棒グラフ（2026-11-08、/data/futoukouページ用に新規作成）。
// 既存のグラフ用コンポーネント（NewsStatsChart＝横棒、DailyQuestionChart＝内訳棒）は
// どちらも「1時点の複数カテゴリ比較」向けで、「時系列の推移」を見せる用途には
// 使えなかったため、このコンポーネントを新設した。
// 色・デザインの考え方はNewsStatsChart.tsxに合わせている（主系列はvar(--main)、
// 強調する値はそれより濃い/薄いトーンで区別、トラックはvar(--border)）。
type TrendPoint = { label: string; value: number };

export default function YearTrendChart({
  data,
  unit = '',
}: {
  data: TrendPoint[];
  unit?: string;
}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
          height: 140,
          padding: '0 2px',
        }}
      >
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const heightPercent = max > 0 ? Math.max((d.value / max) * 100, 2) : 0;
          return (
            <div
              key={d.label}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  background: isLast ? 'var(--main)' : '#A9C9BD',
                  borderRadius: '3px 3px 0 0',
                  minHeight: 2,
                }}
                title={`${d.label}: ${d.value.toLocaleString()}${unit}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {data.map((d) => (
          <div
            key={d.label}
            style={{
              flex: 1,
              fontSize: 10,
              color: 'var(--muted)',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
