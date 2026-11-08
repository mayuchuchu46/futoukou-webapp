// 「データで見る不登校」ページ（/data/futoukou、2026-11-08追加）用の統計データ。
//
// 出典：文部科学省「令和6年度 児童生徒の問題行動・不登校等生徒指導上の諸課題に関する
// 調査結果」（公表：令和7年10月29日、一部修正：令和8年1月16日）
// https://www.mext.go.jp/a_menu/shotou/seitoshidou/1422178_00006.htm
//
// 【確認の方針】ユーザーの「適当な推測はなし、正確な情報だけを述べる」という方針に
// 合わせ、このファイルの数値は文部科学省の公表PDFから直接確認したものだけを載せる。
// 確認の経緯・信頼度を項目ごとにコメントで残す（claude/futoukou-data-page-concept.md
// にも同じ内容の記録あり）。
//
// 信頼度の区分：
// - 「確認済み」：PDF本文のテキストをそのまま読み取れたもの
// - 「相互確認済み」：異なる抽出方法で2回以上取得し、数値同士の整合性（例：
//   小学校+中学校=合計）も一致することを確認したもの
// - 「要目視確認」：項目名と数値の対応がPDF抽出時に崩れていたため、順序からの
//   再構成であることが残っている（本ファイルでは使っていない）

// ---- 不登校児童生徒数の経年推移（小・中学校、H26〜R6） ----
// 相互確認済み：小学校列・中学校列をそれぞれ別のタイミングで抽出し、
// 「小学校+中学校=合計」が全年度で一致することを確認した
// （例：R6 137,704+216,266=353,970、R5 130,370+216,112=346,482）。
export type YearlyFutoukouCount = {
  year: string; // 元号表記（例: 'R6'）
  label: string; // 表示用ラベル（例: '令和6年度'）
  elementary: number;
  juniorHigh: number;
  total: number;
};

export const FUTOUKOU_YEARLY_TREND: YearlyFutoukouCount[] = [
  { year: 'H26', label: '平成26年度', elementary: 25864, juniorHigh: 97033, total: 122897 },
  { year: 'H27', label: '平成27年度', elementary: 27583, juniorHigh: 98408, total: 125991 },
  { year: 'H28', label: '平成28年度', elementary: 30448, juniorHigh: 103235, total: 133683 },
  { year: 'H29', label: '平成29年度', elementary: 35032, juniorHigh: 108999, total: 144031 },
  { year: 'H30', label: '平成30年度', elementary: 44841, juniorHigh: 119687, total: 164528 },
  { year: 'R1', label: '令和元年度', elementary: 53350, juniorHigh: 127922, total: 181272 },
  { year: 'R2', label: '令和2年度', elementary: 63350, juniorHigh: 132777, total: 196127 },
  { year: 'R3', label: '令和3年度', elementary: 81498, juniorHigh: 163442, total: 244940 },
  { year: 'R4', label: '令和4年度', elementary: 105112, juniorHigh: 193936, total: 299048 },
  { year: 'R5', label: '令和5年度', elementary: 130370, juniorHigh: 216112, total: 346482 },
  { year: 'R6', label: '令和6年度', elementary: 137704, juniorHigh: 216266, total: 353970 },
];

// ---- 最新年度（R6）の主要サマリー数値 ----
// 確認済み。
export const FUTOUKOU_LATEST = {
  year: 'R6',
  label: '令和6年度',
  total: 353970,
  elementary: 137704,
  juniorHigh: 216266,
  prevYearTotal: 346482,
  // 増加率（前年度の増加率もあわせて。「増え続けているが増加率は低下」という
  // 見せ方のための数値）
  increaseRateTotal: 2.2,
  increaseRateElementary: 5.6,
  increaseRateJuniorHigh: 0.1,
  prevIncreaseRateTotal: 15.9,
  prevIncreaseRateElementary: 24.0,
  prevIncreaseRateJuniorHigh: 11.4,
  // 新規不登校児童生徒数（前回調査で計上されていなかった者）。9年ぶりの減少。
  newElementary: 70419,
  newJuniorHigh: 83409,
  newTotal: 153828,
  prevNewTotal: 165300,
  // 高等学校の不登校生徒数（概数。公表資料の「約6万8千人」という表記のまま）
  highSchoolApprox: 68000,
  // 出席扱い制度の利用者数
  attendanceCountedOutsideSchool: 42978,
  prevAttendanceCountedOutsideSchool: 38632,
  attendanceCountedIctHome: 13261,
  prevAttendanceCountedIctHome: 10467,
} as const;

// ---- 学年別の不登校児童生徒数（R4〜R6） ----
// 確認済み：表構造（学年ごとの列）がそのままテキストとして読み取れた。
export type GradeFutoukouCount = { grade: string; r4: number; r5: number; r6: number };

export const FUTOUKOU_BY_GRADE: GradeFutoukouCount[] = [
  { grade: '小1', r4: 6668, r5: 9154, r6: 8738 },
  { grade: '小2', r4: 10047, r5: 13694, r6: 14125 },
  { grade: '小3', r4: 13823, r5: 17997, r6: 19460 },
  { grade: '小4', r4: 18373, r5: 23090, r6: 25322 },
  { grade: '小5', r4: 25430, r5: 29847, r6: 31979 },
  { grade: '小6', r4: 30771, r5: 36588, r6: 38080 },
  { grade: '中1', r4: 53770, r5: 58035, r6: 58736 },
  { grade: '中2', r4: 70622, r5: 77768, r6: 77066 },
  { grade: '中3', r4: 69544, r5: 80309, r6: 80464 },
];

// ---- 都道府県別 1,000人当たり不登校児童生徒数（R6、小・中学校） ----
// 相互確認済み：2回、別々の抽出方法で都道府県名の並び順を確認し、どちらも
// 標準的な都道府県コード順（北海道→沖縄）で一致した。数値自体は変更していない。
// 全国平均は38.6人／1,000人。
export const FUTOUKOU_NATIONAL_AVG_PER_1000 = 38.6;

export type PrefFutoukouRate = { prefecture: string; per1000: number };

export const FUTOUKOU_BY_PREFECTURE: PrefFutoukouRate[] = [
  { prefecture: '北海道', per1000: 42.2 },
  { prefecture: '青森県', per1000: 36.3 },
  { prefecture: '岩手県', per1000: 33.3 },
  { prefecture: '宮城県', per1000: 47.0 },
  { prefecture: '秋田県', per1000: 36.4 },
  { prefecture: '山形県', per1000: 32.5 },
  { prefecture: '福島県', per1000: 34.5 },
  { prefecture: '茨城県', per1000: 38.0 },
  { prefecture: '栃木県', per1000: 43.2 },
  { prefecture: '群馬県', per1000: 34.9 },
  { prefecture: '埼玉県', per1000: 32.4 },
  { prefecture: '千葉県', per1000: 32.9 },
  { prefecture: '東京都', per1000: 35.7 },
  { prefecture: '神奈川県', per1000: 38.2 },
  { prefecture: '新潟県', per1000: 38.8 },
  { prefecture: '富山県', per1000: 37.4 },
  { prefecture: '石川県', per1000: 38.7 },
  { prefecture: '福井県', per1000: 28.9 },
  { prefecture: '山梨県', per1000: 41.2 },
  { prefecture: '長野県', per1000: 48.6 },
  { prefecture: '岐阜県', per1000: 39.8 },
  { prefecture: '静岡県', per1000: 45.6 },
  { prefecture: '愛知県', per1000: 41.8 },
  { prefecture: '三重県', per1000: 37.5 },
  { prefecture: '滋賀県', per1000: 36.7 },
  { prefecture: '京都府', per1000: 35.8 },
  { prefecture: '大阪府', per1000: 37.9 },
  { prefecture: '兵庫県', per1000: 38.8 },
  { prefecture: '奈良県', per1000: 39.7 },
  { prefecture: '和歌山県', per1000: 38.9 },
  { prefecture: '鳥取県', per1000: 42.3 },
  { prefecture: '島根県', per1000: 48.8 },
  { prefecture: '岡山県', per1000: 29.6 },
  { prefecture: '広島県', per1000: 40.5 },
  { prefecture: '山口県', per1000: 38.3 },
  { prefecture: '徳島県', per1000: 36.5 },
  { prefecture: '香川県', per1000: 31.6 },
  { prefecture: '愛媛県', per1000: 41.1 },
  { prefecture: '高知県', per1000: 34.9 },
  { prefecture: '福岡県', per1000: 47.2 },
  { prefecture: '佐賀県', per1000: 33.2 },
  { prefecture: '長崎県', per1000: 38.1 },
  { prefecture: '熊本県', per1000: 40.7 },
  { prefecture: '大分県', per1000: 36.9 },
  { prefecture: '宮崎県', per1000: 32.6 },
  { prefecture: '鹿児島県', per1000: 38.2 },
  { prefecture: '沖縄県', per1000: 49.5 },
];

// ---- 不登校児童生徒について学校が把握した事実（要因・状況、R6、小・中学校合計） ----
// 相互確認済み：項目名だけを取り直す抽出と、数値だけを取り直す抽出を別々に行い、
// 項目の並び順が完全に一致することを確認した。
// 注：1人の児童生徒について複数の項目が該当する場合があるため、合計しても
// 353,970人にはならない（重複カウント）。
export type FutoukouFactor = { label: string; elementary: number; juniorHigh: number; total: number };

export const FUTOUKOU_FACTORS: FutoukouFactor[] = [
  { label: '学校生活に対してやる気が出ない等', elementary: 41411, juniorHigh: 65025, total: 106436 },
  { label: '生活リズムの不調', elementary: 36053, juniorHigh: 52510, total: 88563 },
  { label: '不安・抑うつの相談', elementary: 33193, juniorHigh: 52661, total: 85854 },
  { label: '学業の不振・頻繁な宿題未提出', elementary: 21245, juniorHigh: 33907, total: 55152 },
  { label: '親子の関わり方に関する問題', elementary: 23210, juniorHigh: 21347, total: 44557 },
  { label: 'いじめ被害を除く友人関係の問題', elementary: 16229, juniorHigh: 30395, total: 46624 },
  { label: '家庭生活の変化', elementary: 14137, juniorHigh: 14261, total: 28398 },
  { label: '障害（疑い含む）に起因する特別な支援の求め', elementary: 13279, juniorHigh: 13386, total: 26665 },
  { label: '個別の配慮（障害以外）の求め・相談', elementary: 11195, juniorHigh: 11322, total: 22517 },
  { label: '入学・転編入学・進級時の不適応', elementary: 5262, juniorHigh: 11319, total: 16581 },
  { label: 'あそび・非行', elementary: 2422, juniorHigh: 8139, total: 10561 },
  { label: '教職員との関係をめぐる問題', elementary: 6090, juniorHigh: 5025, total: 11115 },
  { label: '学校のきまり等に関する相談', elementary: 2753, juniorHigh: 4473, total: 7226 },
  { label: 'いじめ被害の情報や相談', elementary: 2533, juniorHigh: 2380, total: 4913 },
];

export const FUTOUKOU_SOURCE = {
  name: '文部科学省「令和6年度 児童生徒の問題行動・不登校等生徒指導上の諸課題に関する調査結果」',
  publishedAt: '令和7年10月29日（令和8年1月16日一部修正）',
  url: 'https://www.mext.go.jp/a_menu/shotou/seitoshidou/1422178_00006.htm',
};
