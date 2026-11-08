// 「データで見る不登校」の個別シェア用ページ（/data/futoukou/[slug]）が使うカード定義。
// 2026-11-08追加：「それぞれのページを作ってシェアするときは一つのグラフや数字の
// インパクトで拡散を狙いたい」との要望を受けて追加。
//
// 考え方：/data/futoukou（全体まとめページ）は全部のグラフをまとめて見せる
// 「読み物」としての役割、こちらの個別ページ（/data/futoukou/[slug]）は
// 「1つの数字・1つのグラフだけ」を主役にした、Xシェア専用のページという役割分担。
// 見た目・構成はapp/news/[id]/page.tsx（個別記事＝インパクト数字1つを主役にする
// ページ）と同じ考え方を踏襲する。
//
// データ自体はlib/data/futoukouStats.tsの値をそのまま使う（数値の二重管理を避ける）。
import {
  FUTOUKOU_YEARLY_TREND,
  FUTOUKOU_LATEST,
  FUTOUKOU_BY_GRADE,
  FUTOUKOU_BY_PREFECTURE,
  FUTOUKOU_NATIONAL_AVG_PER_1000,
  FUTOUKOU_FACTORS,
} from './futoukouStats';

export type FutoukouChartStat = { label: string; value: number; unit: string };

export type FutoukouDataCard = {
  slug: string;
  // 一覧(/data/futoukou)・OGP画像で使う短いタイトル
  title: string;
  // ページ本文・OGP画像で主役にする大きな数字
  headlineValue: string;
  // その数字の説明
  headlineLabel: string;
  // 本文に出す1〜2文の補足説明
  description: string;
  // Xシェア時のツイート文
  tweetText: string;
  chart:
    | { type: 'trend'; data: { label: string; value: number }[]; unit: string }
    | { type: 'bars'; stats: FutoukouChartStat[]; caption?: string }
    | { type: 'ranking'; items: { label: string; value: number; unit: string }[] };
};

export const FUTOUKOU_DATA_CARDS: FutoukouDataCard[] = [
  {
    slug: 'total',
    title: '不登校児童生徒数は過去最多',
    headlineValue: `${FUTOUKOU_LATEST.total.toLocaleString()}人`,
    headlineLabel: `小・中学校の不登校児童生徒数（${FUTOUKOU_LATEST.label}）— 過去最多、12年連続で増加`,
    description: `平成26年度の122,897人から、${FUTOUKOU_LATEST.label}には${FUTOUKOU_LATEST.total.toLocaleString()}人へ。12年連続で増加していますが、増加率そのものは${FUTOUKOU_LATEST.prevIncreaseRateTotal}%（前年度）から${FUTOUKOU_LATEST.increaseRateTotal}%（${FUTOUKOU_LATEST.label}）に低下しています。`,
    tweetText: `不登校児童生徒数は過去最多の${FUTOUKOU_LATEST.total.toLocaleString()}人。12年連続で増加しています。`,
    chart: {
      type: 'trend',
      unit: '人',
      data: FUTOUKOU_YEARLY_TREND.map((d) => ({ label: d.year, value: d.total })),
    },
  },
  {
    slug: 'shinki',
    title: '新規の不登校は9年ぶりに減少',
    headlineValue: `${FUTOUKOU_LATEST.newTotal.toLocaleString()}人`,
    headlineLabel: `新規不登校児童生徒数（${FUTOUKOU_LATEST.label}）— 9年ぶりの減少`,
    description:
      '不登校児童生徒数全体は過去最多を更新していますが、新たに不登校になった児童生徒数（新規不登校児童生徒数）は9年ぶりに減少しました。「増え続けている」わけではない変化が起きています。',
    tweetText: `不登校児童生徒数は過去最多。でも新しく不登校になった子どもの数（新規不登校児童生徒数）は9年ぶりに減少しています。`,
    chart: {
      type: 'bars',
      stats: [
        { label: '新規（前年度）', value: FUTOUKOU_LATEST.prevNewTotal, unit: '人' },
        { label: `新規（${FUTOUKOU_LATEST.label}）`, value: FUTOUKOU_LATEST.newTotal, unit: '人' },
      ],
    },
  },
  {
    slug: 'gakunen',
    title: '学年別で見ると中学2年生が最多',
    headlineValue: `${FUTOUKOU_BY_GRADE.reduce((m, g) => (g.r6 > m.r6 ? g : m)).r6.toLocaleString()}人`,
    headlineLabel: `学年別で最も多いのは${FUTOUKOU_BY_GRADE.reduce((m, g) => (g.r6 > m.r6 ? g : m)).grade}（${FUTOUKOU_LATEST.label}）`,
    description: '学年が上がるほど不登校児童生徒数は多くなる傾向があり、小学6年生から中学1年生にかけて大きく増えます。',
    tweetText: '不登校児童生徒数を学年別に見ると、小6→中1で大きく増え、中学2年生が最多でした。',
    chart: {
      type: 'bars',
      caption: '学年が上がるほど多くなる傾向。小6→中1で大きく増えています。',
      stats: FUTOUKOU_BY_GRADE.map((g) => ({ label: g.grade, value: g.r6, unit: '人' })),
    },
  },
  {
    slug: 'todouhuken',
    title: '都道府県別ランキング',
    headlineValue: `${[...FUTOUKOU_BY_PREFECTURE].sort((a, b) => b.per1000 - a.per1000)[0].per1000}人`,
    headlineLabel: `1,000人当たりの不登校児童生徒数が最も多いのは${[...FUTOUKOU_BY_PREFECTURE].sort((a, b) => b.per1000 - a.per1000)[0].prefecture}（全国平均${FUTOUKOU_NATIONAL_AVG_PER_1000}人）`,
    description: `全国平均は${FUTOUKOU_NATIONAL_AVG_PER_1000}人／1,000人です。都道府県ごとの差が見えます。`,
    tweetText: `不登校児童生徒数、1,000人当たりで最も多いのは${[...FUTOUKOU_BY_PREFECTURE].sort((a, b) => b.per1000 - a.per1000)[0].prefecture}（全国平均${FUTOUKOU_NATIONAL_AVG_PER_1000}人）。都道府県ランキングをまとめました。`,
    chart: {
      type: 'ranking',
      items: [...FUTOUKOU_BY_PREFECTURE]
        .sort((a, b) => b.per1000 - a.per1000)
        .map((p) => ({ label: p.prefecture, value: p.per1000, unit: '人' })),
    },
  },
  {
    slug: 'youin',
    title: '不登校の要因、最多は「やる気が出ない等」',
    headlineValue: `${FUTOUKOU_FACTORS[0].total.toLocaleString()}件`,
    headlineLabel: `不登校について学校が把握した事実で最も多いのは「${FUTOUKOU_FACTORS[0].label}」`,
    description: `「いじめ被害の情報や相談」は${FUTOUKOU_FACTORS[FUTOUKOU_FACTORS.length - 1].total.toLocaleString()}件で最も少なく、不登校の要因は一般的なイメージより幅広いことがわかります（1人に複数の項目が該当する場合があるため、合計は不登校児童生徒数とは一致しません）。`,
    tweetText: `不登校の要因で最も多いのは「${FUTOUKOU_FACTORS[0].label}」（${FUTOUKOU_FACTORS[0].total.toLocaleString()}件）。「いじめ」は最も少ない結果でした。`,
    chart: {
      type: 'bars',
      stats: FUTOUKOU_FACTORS.map((f) => ({ label: f.label, value: f.total, unit: '件' })),
    },
  },
  {
    slug: 'shusseki',
    title: '学校以外の学びも「出席」扱いに',
    headlineValue: `${FUTOUKOU_LATEST.attendanceCountedOutsideSchool.toLocaleString()}人`,
    headlineLabel: '学校外の機関等での相談・指導を「出席扱い」とされた児童生徒数',
    description: `自宅でのICT等を活用した学習を出席扱いとされた児童生徒は${FUTOUKOU_LATEST.attendanceCountedIctHome.toLocaleString()}人（前年度${FUTOUKOU_LATEST.prevAttendanceCountedIctHome.toLocaleString()}人）で、どちらも前年度より増えています。`,
    tweetText: `学校外の機関で学び「出席扱い」になった児童生徒は${FUTOUKOU_LATEST.attendanceCountedOutsideSchool.toLocaleString()}人。学校以外の選択肢も広がっています。`,
    chart: {
      type: 'bars',
      stats: [
        { label: '学校外の機関（前年度）', value: FUTOUKOU_LATEST.prevAttendanceCountedOutsideSchool, unit: '人' },
        { label: '学校外の機関（今年度）', value: FUTOUKOU_LATEST.attendanceCountedOutsideSchool, unit: '人' },
        { label: '自宅ICT学習（前年度）', value: FUTOUKOU_LATEST.prevAttendanceCountedIctHome, unit: '人' },
        { label: '自宅ICT学習（今年度）', value: FUTOUKOU_LATEST.attendanceCountedIctHome, unit: '人' },
      ],
    },
  },
];

export function getFutoukouDataCard(slug: string): FutoukouDataCard | null {
  return FUTOUKOU_DATA_CARDS.find((c) => c.slug === slug) || null;
}
