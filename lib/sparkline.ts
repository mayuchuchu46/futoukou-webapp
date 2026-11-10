// NewsTeaser.tsx・FutoukouDataTeaser.tsxが共通で使う、バナー内ミニ棒グラフ用の
// 高さ計算（2026-11-10追加）。「ニュース記事の方は？」との指摘を受けて、データ
// 誘導バナーで先に実装した「実データのミニ棒グラフ」と全く同じロジックをニュース
// バナーにも適用する際、2箇所に同じ正規化計算を重複させないよう切り出した。
//
// 最小〜最大の値を20%〜100%の高さに正規化する（0%だと見えなくなるため下限を
// 20%にしている）。全点が同じ値の場合は全バーを70%の高さで揃える。2点未満
// （グラフにならない）場合は空配列を返す。
export function getSparkHeights(values: number[]): number[] {
  if (values.length < 2) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((v) => (max === min ? 70 : 20 + ((v - min) / (max - min)) * 80));
}
