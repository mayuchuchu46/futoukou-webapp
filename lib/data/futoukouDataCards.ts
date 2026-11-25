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
  FUTOUKOU_HIGH_SCHOOL_TREND,
  FUTOUKOU_CONTINUATION_RATE,
  FUTOUKOU_BUDGET_ESTIMATE,
  FUTOUKOU_NO_SUPPORT_TREND,
  FUTOUKOU_ABSENCE_OVER_90DAYS,
  FUTOUKOU_HIGH_SCHOOL_OUTCOME,
  FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE,
  FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE,
  FUTOUKOU_TAYOUKA_GAKKOU,
  FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT,
  FUTOUKOU_ABSENCE_START_TIMING,
  FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT,
  FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET,
  FUTOUKOU_SC_SSW_DEPLOYMENT,
  FUTOUKOU_LEARNING_OUTCOME_REFLECTED,
  FUTOUKOU_ABSENCE_START_GRADE,
  FUTOUKOU_SUPPORT_NEEDS,
  FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE,
} from './futoukouStats';

export type FutoukouChartStat = { label: string; value: number; unit: string };

// カードを🆕扱いする期間（日数）。この日数以内に追加されたカードは、
// タイル一覧（FutoukouSummaryGrid）で🆕バッジ付きで先頭に表示される。
// 2026-11-10追加：「新しく追加されたものは🆕で、トップに出したい」との要望を受けて。
export const FUTOUKOU_NEW_BADGE_DAYS = 3;

export type FutoukouDataCard = {
  slug: string;
  // このカードを追加した日（YYYY-MM-DD）。新着順ソート・🆕バッジの判定に使う。
  addedAt: string;
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
    addedAt: '2026-11-08',
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
    addedAt: '2026-11-08',
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
    addedAt: '2026-11-08',
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
    addedAt: '2026-11-08',
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
    addedAt: '2026-11-08',
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
    addedAt: '2026-11-08',
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
  {
    // 2026-11-08追加（「今の調査でまだ使ってないデータを追加」との要望を受けて）。
    // 小・中学校は一貫して増加している一方、高校は増減を繰り返している点が
    // 小・中学校の推移（'total'カード）との対比になる。
    slug: 'koukou',
    addedAt: '2026-11-08',
    title: '高校生の不登校は増減を繰り返している',
    headlineValue: `${FUTOUKOU_HIGH_SCHOOL_TREND[FUTOUKOU_HIGH_SCHOOL_TREND.length - 1].value.toLocaleString()}人`,
    headlineLabel: `高等学校の不登校生徒数（${FUTOUKOU_LATEST.label}）`,
    description:
      '小・中学校の不登校児童生徒数が12年連続で増加しているのに対し、高校生の不登校生徒数は増減を繰り返しています。令和2年度に43,051人まで減った後、令和5年度には68,770人まで急増し、令和6年度はわずかに減少しました。',
    tweetText: `小・中学校の不登校は12年連続で増加。一方、高校生の不登校生徒数（${FUTOUKOU_HIGH_SCHOOL_TREND[FUTOUKOU_HIGH_SCHOOL_TREND.length - 1].value.toLocaleString()}人）は増減を繰り返しています。`,
    chart: {
      type: 'trend',
      unit: '人',
      data: FUTOUKOU_HIGH_SCHOOL_TREND.map((d) => ({ label: d.year, value: d.value })),
    },
  },
  {
    // 2026-11-08追加（同上）。「新規は9年ぶり減少」カードと合わせ、「前年度も不登校
    // だった子の割合（継続率）」もR5から低下したことを見せる。学校に戻る・別の
    // 学びの場につながるなど、不登校から抜けるケースが増えている可能性を示す数字。
    slug: 'keizoku',
    addedAt: '2026-11-08',
    title: '不登校が「続く」割合も下がった',
    headlineValue: `${FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 1].juniorHigh}%`,
    headlineLabel: `中学校の不登校継続率（${FUTOUKOU_LATEST.label}、前年度も不登校だった生徒の割合）`,
    description: `小学校の継続率は${FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 1].elementary}%（前年度${FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 2].elementary}%）、中学校は${FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 1].juniorHigh}%（前年度${FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 2].juniorHigh}%）で、どちらも前年度より低下しました。不登校の「新規」が減っただけでなく、「続く」割合自体も下がっています。`,
    tweetText: `不登校の「継続率」（前年度も不登校だった割合）は中学校77.1%・小学校71.7%で、どちらも前年度より低下。新規の減少だけでなく、継続率も下がっています。`,
    chart: {
      type: 'bars',
      stats: [
        { label: '小学校（前年度）', value: FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 2].elementary, unit: '%' },
        { label: '小学校（今年度）', value: FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 1].elementary, unit: '%' },
        { label: '中学校（前年度）', value: FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 2].juniorHigh, unit: '%' },
        { label: '中学校（今年度）', value: FUTOUKOU_CONTINUATION_RATE[FUTOUKOU_CONTINUATION_RATE.length - 1].juniorHigh, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-10追加。SNSで見かけた「不登校対策予算は人数比の6分の1しかない」との
    // 投稿がきっかけだが、元記事の按分根拠が確認できなかったため、一次資料（学校基本
    // 調査の児童生徒数、義務教育費国庫負担金、COCOLOプラン予算）だけを使って
    // どうする先生独自に試算し直した数字（詳細はfutoukouStats.tsのコメント参照）。
    slug: 'yosan',
    addedAt: '2026-11-10',
    title: '不登校対策予算は「人数比」に見合っている？',
    headlineValue: `約${Math.round(FUTOUKOU_BUDGET_ESTIMATE.actualCocoloBudgetOku / FUTOUKOU_BUDGET_ESTIMATE.proportionalBudgetOku * 100)}%`,
    headlineLabel: `不登校対策予算は、人数比で按分した額（試算）の約${Math.round(FUTOUKOU_BUDGET_ESTIMATE.actualCocoloBudgetOku / FUTOUKOU_BUDGET_ESTIMATE.proportionalBudgetOku * 100)}%（どうする先生による独自試算）`,
    description: `全国の小中学生${FUTOUKOU_BUDGET_ESTIMATE.totalStudents.toLocaleString()}人のうち、不登校児童生徒は${FUTOUKOU_BUDGET_ESTIMATE.futoukouCount.toLocaleString()}人（約${FUTOUKOU_BUDGET_ESTIMATE.futoukouSharePercent}%）。この割合で義務教育費国庫負担金（${FUTOUKOU_BUDGET_ESTIMATE.fiscalYear}予算案、1兆6,210億円）を按分すると約${FUTOUKOU_BUDGET_ESTIMATE.proportionalBudgetOku}億円になりますが、実際の不登校対策（COCOLOプラン）予算は${FUTOUKOU_BUDGET_ESTIMATE.actualCocoloBudgetOku}億円でした。`,
    tweetText: `不登校の小中学生は全体の約${FUTOUKOU_BUDGET_ESTIMATE.futoukouSharePercent}%。この割合で教育予算を按分すると約${FUTOUKOU_BUDGET_ESTIMATE.proportionalBudgetOku}億円のはずですが、実際の不登校対策予算は${FUTOUKOU_BUDGET_ESTIMATE.actualCocoloBudgetOku}億円（どうする先生による試算）。`,
    chart: {
      type: 'bars',
      caption: '人数比で按分した額（試算）と、実際のCOCOLOプラン予算の比較。',
      stats: [
        { label: '人数比で按分した額（試算）', value: FUTOUKOU_BUDGET_ESTIMATE.proportionalBudgetOku, unit: '億円' },
        { label: '実際のCOCOLOプラン予算', value: FUTOUKOU_BUDGET_ESTIMATE.actualCocoloBudgetOku, unit: '億円' },
      ],
    },
  },
  {
    // 2026-11-09追加。「学校以外の学びも出席扱いに」('shusseki'カード)の裏側として、
    // 学校内外のどこからも専門的な相談・指導等を受けていない不登校児童生徒の数・割合が
    // R1からR6まで一貫して増え続けていることを見せるカード（出典・検証経緯は
    // futoukouStats.tsのコメント参照）。
    slug: 'mushien',
    addedAt: '2026-11-09',
    title: '相談も指導も受けていない子が増えている',
    headlineValue: `${FUTOUKOU_NO_SUPPORT_TREND[FUTOUKOU_NO_SUPPORT_TREND.length - 1].receivedNonePercent}%`,
    headlineLabel: `学校内外のどこからも専門的な相談・指導等を受けていない不登校児童生徒の割合（${FUTOUKOU_LATEST.label}、${FUTOUKOU_NO_SUPPORT_TREND[FUTOUKOU_NO_SUPPORT_TREND.length - 1].receivedNone.toLocaleString()}人）`,
    description: `不登校児童生徒のうち、学校内外のどこからも専門的な相談・指導等を受けていない人の割合は、令和元年度の29.6%から${FUTOUKOU_LATEST.label}には${FUTOUKOU_NO_SUPPORT_TREND[FUTOUKOU_NO_SUPPORT_TREND.length - 1].receivedNonePercent}%まで上昇しました。不登校児童生徒数の増加だけでなく、支援につながれていない子どもの割合自体も増えています。`,
    tweetText: `不登校の子どものうち、学校内外のどこからも相談・指導を受けていない割合は${FUTOUKOU_NO_SUPPORT_TREND[FUTOUKOU_NO_SUPPORT_TREND.length - 1].receivedNonePercent}%（${FUTOUKOU_NO_SUPPORT_TREND[FUTOUKOU_NO_SUPPORT_TREND.length - 1].receivedNone.toLocaleString()}人）。令和元年度の29.6%から上昇し続けています。`,
    chart: {
      type: 'trend',
      unit: '%',
      data: FUTOUKOU_NO_SUPPORT_TREND.map((d) => ({ label: d.year, value: d.receivedNonePercent })),
    },
  },
  {
    // 2026-11-09追加（2回目）。不登校児童生徒のうち欠席日数90日以上（ほぼ全く学校に
    // 通えていない状態）の割合が、R1〜R6にかけて55%前後で高止まりしていることを見せる
    // カード（出典・検証経緯はfutoukouStats.tsのコメント参照）。「新規は9年ぶり減少」
    // 「継続率も下がった」という好転ぎみの数字が並ぶ①グループの中で、「それでも長期化の
    // 深刻さ自体はほとんど変わっていない」という対比を示す。
    slug: 'chouki',
    addedAt: '2026-11-09',
    title: '欠席90日以上の割合は55%前後で高止まり',
    headlineValue: `${FUTOUKOU_ABSENCE_OVER_90DAYS[FUTOUKOU_ABSENCE_OVER_90DAYS.length - 1].percent}%`,
    headlineLabel: `不登校児童生徒のうち欠席日数90日以上の者の割合（${FUTOUKOU_LATEST.label}、前年度${FUTOUKOU_ABSENCE_OVER_90DAYS[FUTOUKOU_ABSENCE_OVER_90DAYS.length - 2].percent}%）`,
    description: `不登校児童生徒数全体は増え続けていますが、そのうち欠席日数90日以上（ほぼ通えていない状態）の割合は、令和元年度の55.6%から${FUTOUKOU_LATEST.label}の${FUTOUKOU_ABSENCE_OVER_90DAYS[FUTOUKOU_ABSENCE_OVER_90DAYS.length - 1].percent}%まで、6年間ずっと55%前後で変わっていません。人数は増えても、「長期化の深刻さの比率」自体は改善していないことがわかります。`,
    tweetText: `不登校児童生徒のうち欠席日数90日以上の割合は${FUTOUKOU_ABSENCE_OVER_90DAYS[FUTOUKOU_ABSENCE_OVER_90DAYS.length - 1].percent}%。令和元年度から6年間、ずっと55%前後で高止まりしています。`,
    chart: {
      type: 'trend',
      unit: '%',
      data: FUTOUKOU_ABSENCE_OVER_90DAYS.map((d) => ({ label: d.year, value: d.percent })),
    },
  },
  {
    // 2026-11-11追加。「高校生の不登校は増減を繰り返している」('koukou'カード)の
    // 「その後」を見せるカード。不登校の高校生のうち中途退学・原級留置になった人の
    // 割合を合計すると約2割に達することを示す（出典・検証経緯はfutoukouStats.tsの
    // コメント参照）。
    slug: 'chutai',
    addedAt: '2026-11-11',
    title: '不登校の高校生、5人に1人が中退・留年',
    headlineValue: `約${Math.round((FUTOUKOU_HIGH_SCHOOL_OUTCOME.dropout + FUTOUKOU_HIGH_SCHOOL_OUTCOME.heldBack) / FUTOUKOU_HIGH_SCHOOL_OUTCOME.totalFutoukou * 100)}%`,
    headlineLabel: `不登校の高校生のうち中途退学・原級留置（留年）になった生徒の合計割合（${FUTOUKOU_HIGH_SCHOOL_OUTCOME.label}）`,
    description: `${FUTOUKOU_HIGH_SCHOOL_OUTCOME.label}の不登校生徒${FUTOUKOU_HIGH_SCHOOL_OUTCOME.totalFutoukou.toLocaleString()}人のうち、中途退学に至った生徒は${FUTOUKOU_HIGH_SCHOOL_OUTCOME.dropout.toLocaleString()}人（${FUTOUKOU_HIGH_SCHOOL_OUTCOME.dropoutPercent}%）、原級留置（留年）になった生徒は${FUTOUKOU_HIGH_SCHOOL_OUTCOME.heldBack.toLocaleString()}人（${FUTOUKOU_HIGH_SCHOOL_OUTCOME.heldBackPercent}%）。合わせると約${Math.round((FUTOUKOU_HIGH_SCHOOL_OUTCOME.dropout + FUTOUKOU_HIGH_SCHOOL_OUTCOME.heldBack) / FUTOUKOU_HIGH_SCHOOL_OUTCOME.totalFutoukou * 100)}%が、同級生と同じ形で高校生活を続けられていません（小・中学校の不登校には在籍・卒業の制度上、中途退学や原級留置という概念がないため、高校特有の数字です）。`,
    tweetText: `不登校の高校生のうち、中途退学が${FUTOUKOU_HIGH_SCHOOL_OUTCOME.dropoutPercent}%、原級留置（留年）が${FUTOUKOU_HIGH_SCHOOL_OUTCOME.heldBackPercent}%。合わせて約${Math.round((FUTOUKOU_HIGH_SCHOOL_OUTCOME.dropout + FUTOUKOU_HIGH_SCHOOL_OUTCOME.heldBack) / FUTOUKOU_HIGH_SCHOOL_OUTCOME.totalFutoukou * 100)}%、5人に1人が同級生と同じ形で高校生活を続けられていません。`,
    chart: {
      type: 'bars',
      caption: '不登校の高校生のうち、中途退学・原級留置（留年）になった生徒の割合。',
      stats: [
        { label: '中途退学', value: FUTOUKOU_HIGH_SCHOOL_OUTCOME.dropoutPercent, unit: '%' },
        { label: '原級留置（留年）', value: FUTOUKOU_HIGH_SCHOOL_OUTCOME.heldBackPercent, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-11追加（2回目）。「学校以外の学びも『出席扱い』に」('shusseki'カード)は
    // 学校外の機関（教育委員会所管の機関・児童相談所等・保健所・病院等も含む）を合算
    // した数字だったが、そのうち主な2機関（教育支援センターとフリースクール等の
    // 民間団体・民間施設）を個別に取り出すと、相談・指導を受けた人のうち実際に
    // 「出席扱い」とされる割合に大きな差があることを見せるカード（出典・検証経緯は
    // futoukouStats.tsのコメント参照）。
    slug: 'shussekiritsu',
    addedAt: '2026-11-11',
    title: '「出席扱い」になる割合、機関によって差',
    headlineValue: `${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.kyouikuShienCenter.attendanceCountedPercent}%`,
    headlineLabel: `教育支援センター利用者が「指導要録上出席扱い」とされる割合（${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.label}、民間団体・フリースクール等は${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.minkanDantai.attendanceCountedPercent}%）`,
    description: `${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.label}、教育支援センター（適応指導教室）で相談・指導を受けた不登校児童生徒は${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.kyouikuShienCenter.receivedCount.toLocaleString()}人（不登校児童生徒数の${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.kyouikuShienCenter.receivedPercent}%）で、このうち${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.kyouikuShienCenter.attendanceCountedPercent}%が「指導要録上出席扱い」とされました。一方、民間団体・民間施設（フリースクール等）で相談・指導を受けた${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.minkanDantai.receivedCount.toLocaleString()}人（同${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.minkanDantai.receivedPercent}%）のうち出席扱いとされたのは${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.minkanDantai.attendanceCountedPercent}%でした。同じ「学校外で相談・指導を受けた」でも、機関によって出席扱いになる割合には差があります。`,
    tweetText: `不登校の子が学校外で相談・指導を受けたとき「出席扱い」になる割合は、教育支援センターで${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.kyouikuShienCenter.attendanceCountedPercent}%、フリースクール等の民間団体で${FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.minkanDantai.attendanceCountedPercent}%。利用する機関によって差があります。`,
    chart: {
      type: 'bars',
      caption: '学校外で相談・指導を受けた人のうち「指導要録上出席扱い」とされた人の割合。',
      stats: [
        { label: '教育支援センター', value: FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.kyouikuShienCenter.attendanceCountedPercent, unit: '%' },
        { label: '民間団体・フリースクール等', value: FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE.minkanDantai.attendanceCountedPercent, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-12追加。学校外に設置される「教育支援センター（適応指導教室）」
    // （'shussekiritsu'カード）とは別に、各学校の中に設ける「校内教育支援センター」
    // （不登校（傾向）の児童生徒が落ち着いて過ごせる校内の居場所）の設置率が、
    // 1年で12.6ポイント上昇したことを見せるカード（出典・検証経緯はfutoukouStats.ts
    // のコメント参照）。
    slug: 'kounaishien',
    addedAt: '2026-11-12',
    title: '「校内の居場所」設置率、1年で12.6ポイント増',
    headlineValue: `${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.nationalPercent}%`,
    headlineLabel: `公立小中学校の「校内教育支援センター」設置率（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.label}、前年度比+${(FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.nationalPercent - FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.nationalPercent).toFixed(1)}ポイント）`,
    description: `不登校（傾向）の児童生徒が校内で落ち着いて過ごせる場所「校内教育支援センター」を設置している公立小中学校は、${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.label}の${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.nationalPercent}%（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.schools.toLocaleString()}校）から、${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.label}には${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.nationalPercent}%（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.schools.toLocaleString()}校）まで上昇しました。中学校（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.juniorHighPercent}%）の方が小学校（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.elementaryPercent}%）より設置が進んでいます。学校外の「教育支援センター（適応指導教室）」とは別の、校内に設ける居場所の数字です。`,
    tweetText: `不登校の子が校内で落ち着いて過ごせる「校内教育支援センター」の設置率は58.7%。1年前の46.1%から12.6ポイント上昇しました（中学校77.5%・小学校49.1%）。`,
    chart: {
      type: 'bars',
      caption: '公立小中学校における「校内教育支援センター」設置率の変化。',
      stats: [
        { label: `全国（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.year}）`, value: FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.nationalPercent, unit: '%' },
        { label: `全国（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.year}）`, value: FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.nationalPercent, unit: '%' },
        { label: `小学校（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.year}）`, value: FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.elementaryPercent, unit: '%' },
        { label: `小学校（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.year}）`, value: FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.elementaryPercent, unit: '%' },
        { label: `中学校（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.year}）`, value: FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r6.juniorHighPercent, unit: '%' },
        { label: `中学校（${FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.year}）`, value: FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE.r7.juniorHighPercent, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-13追加。「校内教育支援センター」（'kounaishien'カード）や
    // 「教育支援センター（適応指導教室）」（'shussekiritsu'カード）とは別に、
    // 不登校の子ども向けに教育課程を柔軟にできる専用の「学校」そのものの設置数
    // （出典・検証経緯はfutoukouStats.tsのコメント参照）。
    slug: 'tayouka',
    addedAt: '2026-11-13',
    title: '不登校の子のための学校、全国84校',
    headlineValue: `${FUTOUKOU_TAYOUKA_GAKKOU.total}校`,
    headlineLabel: `「学びの多様化学校（いわゆる不登校特例校）」の全国設置数（${FUTOUKOU_TAYOUKA_GAKKOU.asOf}時点）`,
    description: `不登校の状況にある児童生徒に合わせ、授業時数の削減や教科の新設など教育課程を柔軟にできる学校「学びの多様化学校」は、${FUTOUKOU_TAYOUKA_GAKKOU.asOf}時点で全国${FUTOUKOU_TAYOUKA_GAKKOU.total}校（公立${FUTOUKOU_TAYOUKA_GAKKOU.public}校・私立${FUTOUKOU_TAYOUKA_GAKKOU.private}校）。政府は将来的に全国${FUTOUKOU_TAYOUKA_GAKKOU.goalFuture}校を目指していますが、現状はその約${Math.round((FUTOUKOU_TAYOUKA_GAKKOU.total / FUTOUKOU_TAYOUKA_GAKKOU.goalFuture) * 100)}%にとどまり、設置の予定がない県も${FUTOUKOU_TAYOUKA_GAKKOU.prefecturesWithNone}県あります。`,
    tweetText: `不登校の子のための学校「学びの多様化学校」は全国84校（${FUTOUKOU_TAYOUKA_GAKKOU.asOf}時点）。政府目標の300校にはまだ遠く、設置予定のない県も13県あります。`,
    chart: {
      type: 'bars',
      caption: '「学びの多様化学校」の現在の設置数と、政府が将来目標とする校数。',
      stats: [
        { label: '現在の設置数', value: FUTOUKOU_TAYOUKA_GAKKOU.total, unit: '校' },
        { label: 'うち公立', value: FUTOUKOU_TAYOUKA_GAKKOU.public, unit: '校' },
        { label: 'うち私立', value: FUTOUKOU_TAYOUKA_GAKKOU.private, unit: '校' },
        { label: '政府目標（将来的に）', value: FUTOUKOU_TAYOUKA_GAKKOU.goalFuture, unit: '校' },
      ],
    },
  },
  {
    // 2026-11-14追加。「相談も指導も受けていない子どもの割合は増えている」('mushien'
    // カード、現在在籍中の不登校児童生徒に関する行政統計）とは別に、不登校を経験した
    // 成人（18〜59歳）への回顧調査で、当時「相談した人・機関はない」と自己回答した割合を
    // 見せるカード（出典・検証経緯はfutoukouStats.tsのコメント参照）。調査方法・対象が
    // 異なるため直接比較する数字ではないが、「相談先につながれていない経験」という
    // テーマで'mushien'カードと響き合う、本サイトでまだ扱っていない調査。
    slug: 'sodannashi',
    addedAt: '2026-11-14',
    title: '不登校経験者の半数超「相談先はなかった」',
    headlineValue: `${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.noConsultPercent}%`,
    headlineLabel: `小・中学校時に不登校を経験した人（18〜59歳）が、当時「相談した人・機関はない」と回答した割合（文部科学省、令和7年調査、インターネット調査n=${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.n.toLocaleString()}）`,
    description: `文部科学省が18〜59歳の不登校経験者を対象に行った調査で、当時「相談した人・機関はない」と答えた人はインターネット調査（n=${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.n.toLocaleString()}）で${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.noConsultPercent}%、支援団体等の協力によるオンライン調査（n=${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.online.n}）で${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.online.noConsultPercent}%でした。現在の在籍児童生徒に関する行政統計（「相談も指導も受けていない子どもの割合は増えている」カード参照）とは調査方法が異なりますが、どちらも「相談先につながれていない」経験の広さを示しています。`,
    tweetText: `不登校を経験した人（18〜59歳）への調査で、当時「相談した人・機関はない」と答えた人は${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.noConsultPercent}%（文部科学省調査）。半数超が相談先につながれていませんでした。`,
    chart: {
      type: 'bars',
      caption: '不登校経験者（18〜59歳）が当時「相談した人・機関はない」と回答した割合。',
      stats: [
        { label: `${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.label}（n=${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.n.toLocaleString()}）`, value: FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.internet.noConsultPercent, unit: '%' },
        { label: `${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.online.label}（n=${FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.online.n}）`, value: FUTOUKOU_EXPERIENCE_SURVEY_NO_CONSULT.online.noConsultPercent, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-15追加。'sodannashi'カードと同じ調査（不登校経験者等を対象とする調査）
    // から、まだカード化していない「学校を休みはじめた時期」を取り出したカード。
    // 新学期（4月）直後が多いというイメージに反し、実際は8〜12月が最多という結果
    // （出典・検証経緯はfutoukouStats.tsのコメント参照）。
    slug: 'jiki',
    addedAt: '2026-11-15',
    title: '不登校が始まるのは「4月」より「8〜12月」',
    headlineValue: `${FUTOUKOU_ABSENCE_START_TIMING.internet.augToDec}%`,
    headlineLabel: `不登校経験者が学校を休みはじめた時期のうち「8〜12月」の割合（文部科学省調査、インターネット調査n=${FUTOUKOU_ABSENCE_START_TIMING.internet.n.toLocaleString()}）`,
    description: `小・中学校時に不登校を経験した人（18〜59歳）に、休みはじめた時期を聞いた文部科学省の調査では、「8〜12月」が${FUTOUKOU_ABSENCE_START_TIMING.internet.augToDec}%で最多、「4〜7月」が${FUTOUKOU_ABSENCE_START_TIMING.internet.aprToJul}%、「1〜3月」が${FUTOUKOU_ABSENCE_START_TIMING.internet.janToMar}%でした（オンライン調査n=${FUTOUKOU_ABSENCE_START_TIMING.online.n}でも8〜12月${FUTOUKOU_ABSENCE_START_TIMING.online.augToDec}%が最多で同じ傾向）。新学期が始まる4月前後に集中するイメージとは異なり、2学期・3学期が始まった後の時期の方が多い結果でした。`,
    tweetText: `不登校が始まる時期は「4〜7月」ではなく「8〜12月」が最多（${FUTOUKOU_ABSENCE_START_TIMING.internet.augToDec}%）。新学期直後のイメージとは違う結果でした（文部科学省の不登校経験者調査より）。`,
    chart: {
      type: 'bars',
      caption: '不登校経験者が学校を休みはじめた時期（複数回答ではなく単一回答）。',
      stats: [
        { label: `4〜7月（${FUTOUKOU_ABSENCE_START_TIMING.internet.label}）`, value: FUTOUKOU_ABSENCE_START_TIMING.internet.aprToJul, unit: '%' },
        { label: `8〜12月（${FUTOUKOU_ABSENCE_START_TIMING.internet.label}）`, value: FUTOUKOU_ABSENCE_START_TIMING.internet.augToDec, unit: '%' },
        { label: `1〜3月（${FUTOUKOU_ABSENCE_START_TIMING.internet.label}）`, value: FUTOUKOU_ABSENCE_START_TIMING.internet.janToMar, unit: '%' },
        { label: `4〜7月（${FUTOUKOU_ABSENCE_START_TIMING.online.label}）`, value: FUTOUKOU_ABSENCE_START_TIMING.online.aprToJul, unit: '%' },
        { label: `8〜12月（${FUTOUKOU_ABSENCE_START_TIMING.online.label}）`, value: FUTOUKOU_ABSENCE_START_TIMING.online.augToDec, unit: '%' },
        { label: `1〜3月（${FUTOUKOU_ABSENCE_START_TIMING.online.label}）`, value: FUTOUKOU_ABSENCE_START_TIMING.online.janToMar, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-16追加。「相談も指導も受けていない子どもの割合は増えている」('mushien'
    // カード)の"その後"を掘り下げるカード。専門的な相談・指導（スクールカウンセラーや
    // 教育支援センター等）は受けていなくても、担任等からは週1回程度以上の継続的な
    // 関わりを受けている人が多いことを見せる（出典・検証経緯はfutoukouStats.tsの
    // コメント参照）。
    slug: 'tanninkanyo',
    addedAt: '2026-11-16',
    title: '相談なしでも、担任からの関わりは89%に',
    headlineValue: `${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].teacherContactPercent.toFixed(1)}%`,
    headlineLabel: `学校内外で専門的な相談・指導等を受けていない不登校児童生徒のうち、担任等から週1回程度以上の継続的な関わりを受けていた割合（${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].label}）`,
    description: `${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].label}、学校内外のどこからも専門的な相談・指導等を受けていない不登校児童生徒${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].noProfessionalSupport.toLocaleString()}人のうち、${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].teacherContact.toLocaleString()}人（${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].teacherContactPercent.toFixed(1)}%）は担任等の教職員から週1回程度以上の継続的な関わりを受けていました（前年度も${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[0].teacherContactPercent.toFixed(1)}%で同程度）。「専門的な相談・指導なし」＝「誰からも一切関わりがない」ではない点に注意が必要です。`,
    tweetText: `専門的な相談・指導を受けていない不登校児童生徒（${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].noProfessionalSupport.toLocaleString()}人）のうち、${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].teacherContactPercent.toFixed(1)}%は担任等から週1回程度以上の関わりを受けています。「相談なし」は「関わりゼロ」ではありません。`,
    chart: {
      type: 'bars',
      caption: '学校内外で専門的な相談・指導等を受けていない児童生徒のうち、担任等から週1回程度以上の継続的な関わりを受けていた割合。',
      stats: [
        { label: `${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[0].label}`, value: FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[0].teacherContactPercent, unit: '%' },
        { label: `${FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].label}`, value: FUTOUKOU_NO_PROFESSIONAL_SUPPORT_TEACHER_CONTACT[1].teacherContactPercent, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-18追加。「校内の居場所」設置率（'kounaishien'カード）を支える「支援員」
    // 配置事業の予算額そのものが、R7予算4億円→R8予算9億円と1年で2倍以上に増え、
    // R9概算要求ではさらに19億円まで要求されていることを見せるカード（出典・検証経緯は
    // futoukouStats.tsのコメント参照）。R9は概算要求（未確定）であることを明記する。
    slug: 'shienin',
    addedAt: '2026-11-18',
    title: '校内の居場所、支援員の予算が2年で2倍超に',
    headlineValue: `${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.budgetOku}億円`,
    headlineLabel: `「校内教育支援センター支援員の配置事業」予算（${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.label}、前年度の${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r7.budgetOku}億円から倍以上に増加）`,
    description: `不登校（傾向）の児童生徒が校内で落ち着いて過ごせる「校内教育支援センター」（設置率58.7%、kounaishienカード参照）に支援員を配置するための国の補助事業の予算は、${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r7.label}の${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r7.budgetOku}億円から、${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.label}には${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.budgetOku}億円まで増えました。さらに${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r9.label}では${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r9.budgetOku}億円が要求されています（対象校数も${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.targetSchools.toLocaleString()}校から${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r9.targetSchools.toLocaleString()}校へ拡大予定）。令和9年度分は概算要求であり、今後の予算編成で変動する可能性があります。`,
    tweetText: `不登校の子が校内で過ごせる居場所に支援員を配置する事業の予算は、${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r7.label}${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r7.budgetOku}億円→${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.label}${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.budgetOku}億円と2倍超に。来年度の概算要求ではさらに${FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r9.budgetOku}億円を要求中です。`,
    chart: {
      type: 'bars',
      caption: '「校内教育支援センター支援員の配置事業」予算額の推移。令和9年度は概算要求（未確定）。',
      stats: [
        { label: FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r7.label, value: FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r7.budgetOku, unit: '億円' },
        { label: FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.label, value: FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r8.budgetOku, unit: '億円' },
        { label: FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r9.label, value: FUTOUKOU_SCHOOL_SUPPORT_STAFF_BUDGET.r9.budgetOku, unit: '億円' },
      ],
    },
  },
  {
    // 2026-11-21追加。「校内教育支援センター」('kounaishien'カード)や「教育支援
    // センター等での出席扱い率」('shussekiritsu'カード)とは別に、相談を担う「人」の
    // 配置状況（SC・SSWの配置実績）を見せるカード（出典・検証経緯はfutoukouStats.ts
    // のコメント参照）。
    slug: 'scssw',
    addedAt: '2026-11-21',
    title: 'SC・SSWの配置実績、中学校では99%超',
    headlineValue: `${FUTOUKOU_SC_SSW_DEPLOYMENT.sc.juniorHigh}%`,
    headlineLabel: `スクールカウンセラー（SC）の配置実績があった中学校の割合（${FUTOUKOU_SC_SSW_DEPLOYMENT.label}）`,
    description: `${FUTOUKOU_SC_SSW_DEPLOYMENT.label}、SCの配置実績は小学校${FUTOUKOU_SC_SSW_DEPLOYMENT.sc.elementary}%・中学校${FUTOUKOU_SC_SSW_DEPLOYMENT.sc.juniorHigh}%・高等学校${FUTOUKOU_SC_SSW_DEPLOYMENT.sc.highSchool}%。スクールソーシャルワーカー（SSW）は中学校区単位で${FUTOUKOU_SC_SSW_DEPLOYMENT.sswJuniorHighDistrictPercent}%でした（文部科学省の表現は「配置実績」であり、常勤・専任を意味するものではありません）。`,
    tweetText: `SC（スクールカウンセラー）の配置実績は小学校${FUTOUKOU_SC_SSW_DEPLOYMENT.sc.elementary}%・中学校${FUTOUKOU_SC_SSW_DEPLOYMENT.sc.juniorHigh}%・高等学校${FUTOUKOU_SC_SSW_DEPLOYMENT.sc.highSchool}%。SSWは中学校区の${FUTOUKOU_SC_SSW_DEPLOYMENT.sswJuniorHighDistrictPercent}%で配置実績がありました（文部科学省）。`,
    chart: {
      type: 'bars',
      caption: 'SC・SSWの配置実績があった学校（SSWは中学校区）の割合。',
      stats: [
        { label: 'SC・小学校', value: FUTOUKOU_SC_SSW_DEPLOYMENT.sc.elementary, unit: '%' },
        { label: 'SC・中学校', value: FUTOUKOU_SC_SSW_DEPLOYMENT.sc.juniorHigh, unit: '%' },
        { label: 'SC・高等学校', value: FUTOUKOU_SC_SSW_DEPLOYMENT.sc.highSchool, unit: '%' },
        { label: 'SSW・中学校区', value: FUTOUKOU_SC_SSW_DEPLOYMENT.sswJuniorHighDistrictPercent, unit: '%' },
      ],
    },
  },
  {
    // 2026-11-22追加。「出席扱い」（欠席日数の扱い、'shusseki'・'shussekiritsu'カード）とは
    // 別の指標として、欠席中に行った学習の成果を指導要録（成績評価）に反映した人数・割合を
    // 見せるカード（出典・検証経緯はfutoukouStats.tsのコメント参照）。
    slug: 'hyoukahanei',
    addedAt: '2026-11-22',
    title: '欠席中の学習成果、約2割が成績評価に反映',
    headlineValue: `${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.reflectedPercentOfAllFutoukou}%`,
    headlineLabel: `不登校児童生徒のうち、欠席期間中の学習成果を指導要録（成績評価）に反映された人の割合（${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.label}、${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.total.toLocaleString()}人）`,
    description: `${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.label}、自宅や学校外の機関等で欠席期間中に行った学習の成果を指導要録に反映された不登校児童生徒は${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.total.toLocaleString()}人（不登校児童生徒全体の${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.reflectedPercentOfAllFutoukou}%）。このうち${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.kyoukaHyoutei.percentOfReflected}%は各教科の評価・評定等に、${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.sougoShoken.percentOfReflected}%は総合所見等に反映されました。なお、これは欠席日数を「出席扱い」とする仕組み（学校以外の学びも「出席」扱いにカード参照）とは別の指標で、学習の成果を成績評価そのものに反映するものです。小学校（${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.elementaryReflectedPercent}%）より中学校（${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.juniorHighReflectedPercent}%）の方が反映された割合が高くなっています。`,
    tweetText: `欠席中に自宅や学校外で行った学習の成果が成績評価（指導要録）に反映された不登校児童生徒は${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.total.toLocaleString()}人（不登校児童生徒全体の${FUTOUKOU_LEARNING_OUTCOME_REFLECTED.reflectedPercentOfAllFutoukou}%）。「出席扱い」とは別の、成績評価に関する指標です。`,
    chart: {
      type: 'bars',
      caption: '欠席期間中の学習成果が指導要録に反映された人数のうち、反映先の内訳（小・中学校別）。',
      stats: [
        { label: '反映あり（小学校）', value: FUTOUKOU_LEARNING_OUTCOME_REFLECTED.elementary, unit: '人' },
        { label: '反映あり（中学校）', value: FUTOUKOU_LEARNING_OUTCOME_REFLECTED.juniorHigh, unit: '人' },
        { label: 'うち評価・評定等に反映', value: FUTOUKOU_LEARNING_OUTCOME_REFLECTED.kyoukaHyoutei.total, unit: '人' },
        { label: 'うち総合所見等に反映', value: FUTOUKOU_LEARNING_OUTCOME_REFLECTED.sougoShoken.total, unit: '人' },
      ],
    },
  },
  {
    slug: 'kaishi',
    addedAt: '2026-11-23',
    title: '不登校が始まる学年、中学1・2年にピーク',
    headlineValue: `${[...FUTOUKOU_ABSENCE_START_GRADE.internet.grades].sort((a, b) => b.percent - a.percent)[0].percent}%`,
    headlineLabel: `不登校経験者が学校を休みはじめた学年で最も多いのは中学2年生（${FUTOUKOU_ABSENCE_START_GRADE.internet.label}、n=${FUTOUKOU_ABSENCE_START_GRADE.internet.n.toLocaleString()}）`,
    description: `不登校を経験した18〜59歳への回顧調査で「学校を休みはじめた学年」を聞いたところ、${FUTOUKOU_ABSENCE_START_GRADE.internet.label}（n=${FUTOUKOU_ABSENCE_START_GRADE.internet.n.toLocaleString()}）では中学2年生が${[...FUTOUKOU_ABSENCE_START_GRADE.internet.grades].sort((a, b) => b.percent - a.percent)[0].percent}%で最多、${FUTOUKOU_ABSENCE_START_GRADE.online.label}（n=${FUTOUKOU_ABSENCE_START_GRADE.online.n}）では中学1年生が${[...FUTOUKOU_ABSENCE_START_GRADE.online.grades].sort((a, b) => b.percent - a.percent)[0].percent}%で最多と、調査によって最頻学年は異なります。ただしどちらの調査でも、小学5年生あたりから中学1〜2年生にかけて割合が高まる傾向は共通しています。`,
    tweetText: `不登校が始まった学年を聞いた調査では、中学2年生が${[...FUTOUKOU_ABSENCE_START_GRADE.internet.grades].sort((a, b) => b.percent - a.percent)[0].percent}%で最多（別の調査では中学1年生が最多）。小5〜中2にかけて割合が高まる傾向は共通しています。`,
    chart: {
      type: 'ranking',
      items: [...FUTOUKOU_ABSENCE_START_GRADE.internet.grades]
        .sort((a, b) => b.percent - a.percent)
        .map((g) => ({ label: g.grade, value: g.percent, unit: '%' })),
    },
  },
  {
    // 2026-11-24追加。'jiki'・'kaishi'・'sodannashi'カードと同じ回顧調査（参考資料3）の、
    // まだカード化していなかった「不登校当時に欲しかった支援（ニーズ）」設問。複数回答可で
    // 上位5つのみ資料に掲載。インターネット調査では「とくにない」が2番目に多い（31.3%）点も
    // あわせて見せる（出典・検証経緯はfutoukouStats.tsのコメント参照）。
    slug: 'shienneeds',
    addedAt: '2026-11-24',
    title: '不登校当時に欲しかった支援、最多は「気持ちの表現・人づきあいの相談」',
    headlineValue: `${FUTOUKOU_SUPPORT_NEEDS.internet.items[0].percent}%`,
    headlineLabel: `不登校当時に欲しかった支援で最も多かった回答（${FUTOUKOU_SUPPORT_NEEDS.internet.label}、n=${FUTOUKOU_SUPPORT_NEEDS.internet.n.toLocaleString()}、複数回答可）`,
    description: `不登校を経験した18〜59歳への回顧調査で「不登校だった当時に欲しかった相談や手助け」（複数回答可、上位5つ）を聞いたところ、${FUTOUKOU_SUPPORT_NEEDS.internet.label}（n=${FUTOUKOU_SUPPORT_NEEDS.internet.n.toLocaleString()}）では「自分の気持ちをはっきり表現したり、人とうまくつきあったりするための方法についての相談や手助け」が${FUTOUKOU_SUPPORT_NEEDS.internet.items[0].percent}%で最多でした。一方で「とくにない」と回答した人も${FUTOUKOU_SUPPORT_NEEDS.internet.items[1].percent}%で僅差の2位に入っています。${FUTOUKOU_SUPPORT_NEEDS.online.label}（n=${FUTOUKOU_SUPPORT_NEEDS.online.n}、支援団体等経由の回答者が多く若年層の割合が高いとされる）では同じ項目が${FUTOUKOU_SUPPORT_NEEDS.online.items[0].percent}%とさらに高く、「とくにない」は上位5項目に入りませんでした。`,
    tweetText: `不登校当時に欲しかった支援を聞いた調査で最多だったのは「気持ちの表現・人づきあいについての相談や手助け」（${FUTOUKOU_SUPPORT_NEEDS.internet.items[0].percent}%）。一方「とくにない」という回答も${FUTOUKOU_SUPPORT_NEEDS.internet.items[1].percent}%で僅差の2位でした。`,
    chart: {
      type: 'ranking',
      items: FUTOUKOU_SUPPORT_NEEDS.internet.items.map((i) => ({
        label: i.isNone ? i.item : i.item.length > 20 ? `${i.item.slice(0, 20)}…` : i.item,
        value: i.percent,
        unit: '%',
      })),
    },
  },
  {
    // 2026-11-26追加。'jiki'・'kaishi'・'sodannashi'・'shienneeds'カードと同じ回顧調査
    // （参考資料3）の、まだカード化していなかった「不登校経験と中学校卒業後の経験との関連」
    // 設問。7項目のうち、最も割合が高い「人との関わりに不安を感じたり、人と関わりをもつ
    // ことに苦労した」をヘッドラインに採用（出典・検証経緯はfutoukouStats.tsのコメント参照）。
    slug: 'sotsugo',
    addedAt: '2026-11-26',
    title: '不登校経験者の7割、卒業後も「人との関わりに不安」',
    headlineValue: `${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.items[4].yesPercent}%`,
    headlineLabel: `中学卒業後に「人との関わりに不安を感じたり、人と関わりをもつことに苦労した」人の割合（${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.label}、n=${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.n.toLocaleString()}）`,
    description: `不登校を経験した18〜59歳への回顧調査で「中学校卒業後今までに、次のようなことがあったか」を聞いたところ、${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.label}（n=${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.n.toLocaleString()}）では「人との関わりに不安を感じたり、人と関わりをもつことに苦労した」が${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.items[4].yesPercent}%と最も高くなりました（${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.online.label}では${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.online.items[4].yesPercent}%）。一方で「成長した、視野が広がった」（${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.items[5].yesPercent}%）、「人に優しくなった、人の痛みが分かるようになった」（${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.items[6].yesPercent}%）という前向きな変化を挙げた人も過半数を占めています。`,
    tweetText: `不登校を経験した人への調査で、中学卒業後「人との関わりに不安を感じたり、人と関わりをもつことに苦労した」と答えた人は${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.items[4].yesPercent}%。一方「人に優しくなった、人の痛みが分かるようになった」人も${FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.items[6].yesPercent}%いました。`,
    chart: {
      type: 'ranking',
      items: [...FUTOUKOU_POST_JUNIOR_HIGH_EXPERIENCE.internet.items]
        .sort((a, b) => b.yesPercent - a.yesPercent)
        .map((i) => ({
          label: i.item.length > 20 ? `${i.item.slice(0, 20)}…` : i.item,
          value: i.yesPercent,
          unit: '%',
        })),
    },
  },
];

export function getFutoukouDataCard(slug: string): FutoukouDataCard | null {
  return FUTOUKOU_DATA_CARDS.find((c) => c.slug === slug) || null;
}

// 新着順（addedAtが新しい順）に並べ替えたカード一覧。FutoukouSummaryGridが使う。
// 2026-11-10追加：「新しく追加されたものは🆕で、トップに出したい」との要望を受けて。
export function getFutoukouDataCardsSortedByNewest(): FutoukouDataCard[] {
  return [...FUTOUKOU_DATA_CARDS].sort((a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0));
}

// addedAtがFUTOUKOU_NEW_BADGE_DAYS日以内なら🆕扱い。
export function isFutoukouCardNew(addedAt: string): boolean {
  const added = new Date(`${addedAt}T00:00:00+09:00`).getTime();
  const now = Date.now();
  const diffDays = (now - added) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < FUTOUKOU_NEW_BADGE_DAYS;
}
