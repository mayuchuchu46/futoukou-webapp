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

// ---- 高等学校の不登校生徒数の経年推移（H26〜R6） ----
// 確認済み：表構造（年度ごとの行）がそのままテキストとして読み取れた。
// 小・中学校と違い、増減を繰り返している（H26 53,156人→R2 43,051人まで減少した後、
// R4以降に急増しR5 68,770人、R6はわずかに減って67,782人）。
export type YearlyCount = { year: string; value: number };

export const FUTOUKOU_HIGH_SCHOOL_TREND: YearlyCount[] = [
  { year: 'H26', value: 53156 },
  { year: 'H27', value: 49563 },
  { year: 'H28', value: 48565 },
  { year: 'H29', value: 49643 },
  { year: 'H30', value: 52723 },
  { year: 'R1', value: 50100 },
  { year: 'R2', value: 43051 },
  { year: 'R3', value: 50985 },
  { year: 'R4', value: 60575 },
  { year: 'R5', value: 68770 },
  { year: 'R6', value: 67782 },
];

// ---- 不登校継続率（前回調査で不登校だった児童生徒のうち、今回調査でも
//      不登校に計上された人の割合） ----
// 確認済み。資料にはR1〜R6のみ掲載（H26〜H30は資料になし）。高等学校は、
// 学年別に調査していない単位制の生徒を含むため算出されていない（資料の記載どおり）。
export type ContinuationRateByYear = { year: string; elementary: number; juniorHigh: number };

export const FUTOUKOU_CONTINUATION_RATE: ContinuationRateByYear[] = [
  { year: 'R1', elementary: 71.0, juniorHigh: 78.9 },
  { year: 'R2', elementary: 67.4, juniorHigh: 75.1 },
  { year: 'R3', elementary: 74.0, juniorHigh: 79.9 },
  { year: 'R4', elementary: 73.7, juniorHigh: 79.4 },
  { year: 'R5', elementary: 75.2, juniorHigh: 80.7 },
  { year: 'R6', elementary: 71.7, juniorHigh: 77.1 },
];

// ---- 不登校対策予算は「人数比」に見合っているか（どうする先生による試算、2026-11-10追加） ----
// SNSで見かけた「不登校対策予算は、人数比で計算した額の6分の1しかない」という趣旨の
// 投稿（小幡和輝氏、Yahoo!ニュース エキスパート）がきっかけ。ただし元記事の按分計算の
// 根拠（何を母数にしたか）が確認できなかったため、他人の数字をそのまま転載するのではなく、
// 一次資料だけを使って自分たちで試算し直した（ユーザーの「適当な推測はなし、正確な情報だけ」
// という方針のため）。
//
// 【按分の考え方】
// 「不登校対策に使われている予算」が、仮に「全国の小中学生に占める不登校児童生徒の割合」に
// 比例して配分されるとしたら、いくらになるはずか？　を計算し、実際の予算額と比較する。
//
// 【使った数字と出典】
// ・全国の小学校児童数：5,941,733人／中学校生徒数：3,141,132人
//   → 文部科学省「令和6年度学校基本調査」（令和6年5月1日現在）。全国値は複数の都道府県
//     統計資料（例：静岡県統計課資料）が文科省公表値として引用しているものを確認。
// ・不登校児童生徒数（小・中学校合計）：353,970人
//   → 本ファイル内 FUTOUKOU_LATEST.total と同じ、文部科学省「令和6年度 児童生徒の問題
//     行動・不登校等生徒指導上の諸課題に関する調査結果」。
// ・義務教育費国庫負担金（令和7年度予算案）：1兆6,210億円
//   → 文部科学省「令和7年度文部科学省予算（案）のポイント」(20241225-ope_dev02-000037774_1.pdf)。
//     公立小中学校教職員の給与等に充てられる、国の教育予算の中で最大規模の費目。
//     「不登校対策にどれだけ予算を割くべきか」の母数として、学校教育予算全体ではなく、
//     小中学校に直接対応するこの費目を採用した（高校・大学分を含む予算より公平な比較になる
//     ため）。
// ・不登校対策（COCOLOプラン）関連予算（令和7年度予算）：95億円
//   → 厚生労働省「児童生徒の自殺対策の推進について」資料に記載の文部科学省予算額
//     （mhlw.go.jp/content/12201000/001526532.pdf）。
//
// 【計算】
// 不登校児童生徒の割合 = 353,970人 ÷ (5,941,733人+3,141,132人) = 353,970人 ÷ 9,082,865人 ≈ 3.90%
// 按分額（試算） = 16,210億円 × 3.90% ≈ 632億円
// 実際のCOCOLOプラン予算 = 95億円
// 実際予算は按分額の 95億円 ÷ 632億円 ≈ 15%（約6.7分の1）
//
// 【注意】これはどうする先生が独自に行った試算であり、文部科学省の公式見解や予算編成の
// 考え方を示すものではない。義務教育費国庫負担金は不登校対策以外の全教育活動（通常の
// 授業・部活動など）にも使われる費目であり、「本来この割合が不登校対策に使われるべき」と
// いう規範的な主張をするものではなく、あくまで「人数の割合」という一つの物差しで見た
// 試算値として提示している。
export const FUTOUKOU_BUDGET_ESTIMATE = {
  fiscalYear: '令和7年度',
  elementaryStudents: 5941733,
  juniorHighStudents: 3141132,
  totalStudents: 5941733 + 3141132,
  futoukouCount: 353970,
  // 注：2026-11-10、本番公開後にXシェア文言が「約0.039%」と表示される不具合に気づいた
  // （割合を100倍し忘れており、正しくは約3.9%）。按分額・実予算の計算自体には影響しない
  // （下のproportionalBudgetOkuは割合の生値から直接計算しており、この表示用の値とは
  // 独立している）が、表示上誤った数字を公開していたため修正した。
  futoukouSharePercent: Math.round((353970 / (5941733 + 3141132)) * 100 * 10) / 10,
  compulsoryEducationBudgetOku: 16210, // 義務教育費国庫負担金（億円）
  proportionalBudgetOku: Math.round((16210 * (353970 / (5941733 + 3141132))) * 10) / 10,
  actualCocoloBudgetOku: 95, // COCOLOプラン関連予算（億円）
};

// ---- 学校内外で専門的な相談・指導等を受けていない不登校児童生徒数の推移（R1〜R6） ----
// 2026-11-09追加。出典：文部科学省「令和6年度 児童生徒の問題行動・不登校等生徒指導上の
// 諸課題に関する調査結果の概要（不登校抜粋版）」
// https://www.mext.go.jp/content/20251106-mxt_jidou01-000045738_3.pdf
//
// 相互確認済み：このPDFを2回、別のプロンプトで独立して読み取り、両方で同じ数値
// （R1〜R6の「受けていない」人数・「受けた」人数）が得られた。さらに、各年度で
// 「受けていない」＋「受けた」の合計が、本ファイル既存のFUTOUKOU_YEARLY_TREND.total
// （別の資料から確認済みの不登校児童生徒数、R1 181,272人〜R6 353,970人）と全年度で
// 完全に一致することを確認した（例：R6 135,724+218,246=353,970）。
// 割合（receivedNonePercent）は人数から算出した値。R1〜R4分は、文部科学省の別資料
// 「令和4年度」版調査結果（2024-08-29公表、mext.go.jp/content/20240829-mxt_jidou02-
// 000037766_08.pdf）に明記されている「受けていない」割合（R1 29.6%／R2 34.3%／
// R3 36.3%／R4 38.2%）とも一致し、二重に確認できている。R6は38.3%とPDFに明記。
export type NoSupportByYear = { year: string; receivedNone: number; received: number; receivedNonePercent: number };

export const FUTOUKOU_NO_SUPPORT_TREND: NoSupportByYear[] = [
  { year: 'R1', receivedNone: 53593, received: 127679, receivedNonePercent: 29.6 },
  { year: 'R2', receivedNone: 67294, received: 128833, receivedNonePercent: 34.3 },
  { year: 'R3', receivedNone: 88931, received: 156009, receivedNonePercent: 36.3 },
  { year: 'R4', receivedNone: 114217, received: 184831, receivedNonePercent: 38.2 },
  { year: 'R5', receivedNone: 134368, received: 212114, receivedNonePercent: 38.8 },
  { year: 'R6', receivedNone: 135724, received: 218246, receivedNonePercent: 38.3 },
];

// ---- 不登校児童生徒のうち欠席日数90日以上の者の割合（R1〜R6） ----
// 2026-11-09追加（2回目）。出典：
// ・R5・R6：文部科学省「令和6年度 児童生徒の問題行動・不登校等生徒指導上の諸課題に
//   関する調査結果の概要（不登校抜粋版）」https://www.mext.go.jp/content/20251106-mxt_jidou01-000045738_3.pdf
//   本文に「不登校児童生徒全体に占める割合は54.2％（前年度55.0％）であった。」と明記
//   されている（確認済み）。
// ・R1〜R4：上記PDFのグラフ（スライド6、年度ラベルとの対応がテキスト抽出では不確か
//   だったため「要目視確認」扱い）を、文部科学省の別資料「令和4年度」版調査結果
//   （2024-08-29公表、mext.go.jp/content/20240829-mxt_jidou02-000037766_08.pdf）の
//   同じグラフ（H28〜R4）と2回・別のプロンプトで独立抽出して比較したところ、R1〜R4の
//   4年分がどちらも完全に一致した（R1 55.6%／R2 54.9%／R3 55.0%／R4 55.4%）。
//   2つの独立した資料・抽出で一致したため、相互確認済みとして採用する。
export type AbsenceOver90DaysByYear = { year: string; percent: number };

export const FUTOUKOU_ABSENCE_OVER_90DAYS: AbsenceOver90DaysByYear[] = [
  { year: 'R1', percent: 55.6 },
  { year: 'R2', percent: 54.9 },
  { year: 'R3', percent: 55.0 },
  { year: 'R4', percent: 55.4 },
  { year: 'R5', percent: 55.0 },
  { year: 'R6', percent: 54.2 },
];

// ---- 高等学校の不登校生徒の「その後」（中途退学・原級留置、R6） ----
// 2026-11-11追加。出典：文部科学省「令和6年度 児童生徒の問題行動・不登校等生徒指導上の
// 諸課題に関する調査結果の概要（不登校抜粋版）」
// https://www.mext.go.jp/content/20251106-mxt_jidou01-000045738_3.pdf
// （「高等学校における不登校の状況について」の表、国公私立計）
//
// 相互確認済み：このPDFを2回、別のプロンプトで独立して読み取り、どちらも
// 「不登校生徒のうち中途退学に至った者 10,566　15.6%」「不登校生徒のうち
// 原級留置になった者 2,963　4.4%」という同じ本文の文言・数値を確認した。
// さらに、この表の不登校生徒数（67,782人）が、本ファイルのFUTOUKOU_HIGH_SCHOOL_TREND
// のR6値（別資料・既に確認済み）と完全に一致することも確認した（整合性チェック）。
// 割合は本文に明記された数字をそのまま使用し、以下で検算もした
// （10,566÷67,782≈15.59%→15.6%、2,963÷67,782≈4.37%→4.4%。四捨五入の範囲で一致）。
//
// 【注意】中途退学・原級留置の生徒が必ずしも「不登校のまま」とは限らず、進路変更
// （通信制高校等への転学は中退に含まれる場合がある）によるケースも含まれる可能性が
// あるため、本文の記載以上の解釈は加えない。
export const FUTOUKOU_HIGH_SCHOOL_OUTCOME = {
  year: 'R6',
  label: '令和6年度',
  totalFutoukou: 67782,
  dropout: 10566,
  dropoutPercent: 15.6,
  heldBack: 2963,
  heldBackPercent: 4.4,
} as const;

// ---- 学校外の相談・指導機関別「出席扱い」率の違い（教育支援センター vs 民間団体・フリースクール等、R6） ----
// 2026-11-11追加。出典：文部科学省「令和6年度 児童生徒の問題行動・不登校等生徒指導上の
// 諸課題に関する調査結果について」（公表：令和7年10月29日、一部修正：令和8年1月16日）
// https://www.mext.go.jp/content/20260116-mxt_jidou02-100002753_1_3.pdf
// （4(9)「学校内外の機関等で専門的な相談・指導等を受けた児童生徒数等」の表、P.90、
// 「③小・中合計」列）
//
// 既存の'shusseki'カード（FUTOUKOU_LATEST.attendanceCountedOutsideSchool=42,978人）は
// 学校外の全機関（教育委員会所管の機関・児童相談所等・保健所・病院等も含む）を
// 合算した数字だが、このデータはそのうち「①教育支援センター（適応指導教室）」と
// 「⑥民間団体，民間施設（フリースクール等）」の2つを個別に取り出し、相談・指導を
// 受けた人数のうち実際に「指導要録上出席扱い」とされた人数の割合（＝出席扱い率）を
// 比較するもの。
//
// 相互確認済み：同じPDFを異なるオフセットで2回独立して抽出し、どちらも同じ数値
// （教育支援センター：32,240人・9.1%、うち出席扱い23,368人・72.5%、通学定期乗車券
// 適用417人／民間団体，民間施設：18,566人・5.2%、うち出席扱い9,329人・50.2%、
// 通学定期乗車券適用402人）を確認した。さらに検算
// （23,368÷32,240≈72.49%→72.5%、9,329÷18,566≈50.22%→50.2%、
// 32,240÷353,970≈9.11%→9.1%、18,566÷353,970≈5.24%→5.2%）により、printed percentが
// 全て一致することを確認済み。分母の353,970人はFUTOUKOU_LATEST.totalと同一（既に
// 確認済みの数値）。
export const FUTOUKOU_SUPPORT_INSTITUTION_ATTENDANCE = {
  year: 'R6',
  label: '令和6年度',
  kyouikuShienCenter: {
    name: '教育支援センター（適応指導教室）',
    receivedCount: 32240,
    receivedPercent: 9.1,
    attendanceCountedCount: 23368,
    attendanceCountedPercent: 72.5,
    commuterPassCount: 417,
  },
  minkanDantai: {
    name: '民間団体，民間施設（フリースクール等）',
    receivedCount: 18566,
    receivedPercent: 5.2,
    attendanceCountedCount: 9329,
    attendanceCountedPercent: 50.2,
    commuterPassCount: 402,
  },
} as const;

// ---- 公立小中学校の「校内教育支援センター」設置率（R6→R7、全国・小学校・中学校別） ----
// 2026-11-12追加。「校内教育支援センター」は、各学校の中に設けられた、不登校（傾向）の
// 児童生徒が落ち着いて過ごせる校内の居場所（別室等）のこと。既存の'shussekiritsu'
// カードが扱う「教育支援センター（適応指導教室）」（市町村教育委員会等が学校外に
// 設置するもの）とは別の施策・別の設置主体の数字であり、本ファイルでまだ扱っていない
// 新しいテーマ。
//
// 出典：文部科学省「誰一人取り残されない学びの保障に向けた不登校対策推進本部（第5回）」
// （令和7年11月6日開催）配付資料のうち、COCOLOプラン進捗状況に関する資料
// https://www.mext.go.jp/content/20251106-mxt_jidou01-000045738_6.pdf
// （会議の開催情報：https://www.mext.go.jp/b_menu/activity/detail/2025/20251106.html）
//
// 相互確認済み：このPDFを2回、別のプロンプトで独立して読み取り、どちらも同じ数値
// （令和7年：設置校数15,874校・全国設置率58.7%〈令和7年6月現在〉、うち小学校8,841校・
// 49.1%、中学校7,033校・77.5%／令和6年：設置校数12,712校・全国設置率46.1%、うち
// 小学校6,643校・35.9%、中学校6,069校・66.9%）を確認した。さらに整合性チェックとして
// 小学校+中学校の設置校数が両年度とも全国の設置校数と一致することを検算した
// （R7: 8,841+7,033=15,874／R6: 6,643+6,069=12,712、いずれも一致）。
// 全国設置率の前年度比（+12.6ポイント＝58.7%−46.1%）は、この数値を報じた教育家庭
// 新聞社・リセマム（Yahoo!ニュース配信の共同通信記事も含む）等の複数の報道でも
// 「12ポイント増」「50％超す」等、同趣旨で報じられており、文科省資料の数値と整合して
// いることを確認済み（例：https://www.kknews.co.jp/post_health/251117_6a 、
// https://reseed.resemom.jp/article/2025/11/10/12057.html ）。
export const FUTOUKOU_SCHOOL_SUPPORT_CENTER_RATE = {
  r6: { year: 'R6', label: '令和6年度', nationalPercent: 46.1, elementaryPercent: 35.9, juniorHighPercent: 66.9, schools: 12712 },
  r7: { year: 'R7', label: '令和7年度（令和7年6月現在）', nationalPercent: 58.7, elementaryPercent: 49.1, juniorHighPercent: 77.5, schools: 15874 },
} as const;

export const FUTOUKOU_SOURCE = {
  name: '文部科学省「令和6年度 児童生徒の問題行動・不登校等生徒指導上の諸課題に関する調査結果」',
  publishedAt: '令和7年10月29日（令和8年1月16日一部修正）',
  url: 'https://www.mext.go.jp/a_menu/shotou/seitoshidou/1422178_00006.htm',
};
