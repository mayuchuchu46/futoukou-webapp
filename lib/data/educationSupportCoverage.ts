// 都道府県ごとの教育支援センター（適応指導教室）データの網羅状況。
//
// 教育支援センターは各市区町村教育委員会が設置する公的な（無料の）不登校支援施設で、
// 文部科学省の調査でも全国の合計数（約1,873か所、令和6年度時点）しか公表されておらず、
// 個別の名称・所在地を全国でまとめた公的データベースは存在しない（フリースクールと同じ
// 状況）。ただし、ほぼ全市区町村に1つずつあるため、フリースクールよりも対象自治体数が
// 圧倒的に多い（全国で約1,700自治体分）。
//
// このため2026年10月の調査では、1,700自治体を個別に調べるのではなく、「都道府県（教育
// 委員会）が、県内市区町村分をまとめて名称・所在地を一覧化しているページ/PDFがあるか」
// を確認する方針で調べた。都道府県単位でそのような一覧が見つからなかった場合でも、
// お住まいの市区町村には教育支援センターが存在する可能性が高い（教育委員会に直接確認を
// 推奨する）。
//
// tier:
//   'good'    = 県内市区町村分の名称・所在地・連絡先つきの一覧が見つかった
//   'partial' = 一覧はあるが、住所が欠落／一部市区町村のみ／施設名のみ等、不完全
//   'none'    = 都道府県単位でまとめた一覧が見つからなかった（個々の市区町村には施設が
//               あるはずだが、今回の調査方法では未確認）
export type EducationSupportCoverageTier = 'good' | 'partial' | 'none';

export type EducationSupportCoverage = {
  prefecture: string;
  tier: EducationSupportCoverageTier;
  note: string;
};

export const EDUCATION_SUPPORT_COVERAGE: EducationSupportCoverage[] = [
  { prefecture: '北海道', tier: 'good', note: '道教育委員会が14管内ごとに「教育支援センター設置状況」を公開しており、市町村別の名称・所在地・電話番号を掲載。' },
  { prefecture: '青森県', tier: 'good', note: '県の「子ども・若者支援機関マップ」に、市町村ごとの名称・所在地・電話番号を掲載（21施設）。' },
  { prefecture: '岩手県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '宮城県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '秋田県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '山形県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '福島県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '茨城県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '栃木県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '群馬県', tier: 'partial', note: '県資料に市町村ごとの施設名・電話番号の記載がありますが、住所の記載はありません。' },
  { prefecture: '埼玉県', tier: 'good', note: '県教育委員会が「市町村立教育支援センター一覧」を公開しており、市町村別の名称・所在地・電話番号を掲載（80施設）。' },
  { prefecture: '千葉県', tier: 'good', note: '県の資料に、市町村別の名称・所在地・電話番号を掲載（51施設）。' },
  { prefecture: '東京都', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした（区市町村教育委員会の所在地一覧はありますが、教育支援センター自体の一覧ではありません）。' },
  { prefecture: '神奈川県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '新潟県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '富山県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '石川県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '福井県', tier: 'good', note: '県教育委員会の不登校対策資料に、市町ごとの施設名・電話番号を掲載（19施設、住所の記載はありません）。' },
  { prefecture: '山梨県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '長野県', tier: 'partial', note: '県資料に約70施設の名称が記載されていますが、住所・電話番号の記載はありません。' },
  { prefecture: '岐阜県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '静岡県', tier: 'good', note: '県教育委員会が「市町に設置されている教育支援センター一覧」を公開しており、市町別の名称・所在地を掲載（50施設、電話番号の記載はありません）。' },
  { prefecture: '愛知県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '三重県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '滋賀県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '京都府', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '大阪府', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '兵庫県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '奈良県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '和歌山県', tier: 'good', note: '県が「県内の教育支援センター等」一覧を公開しており、市町村別の名称・所在地・電話番号を掲載（22施設）。' },
  { prefecture: '鳥取県', tier: 'good', note: '県教育委員会が「市町村設置の教育支援センター」一覧を公開しており、市町村別の名称・所在地・電話番号・FAXを掲載（11施設）。' },
  { prefecture: '島根県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '岡山県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '広島県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '山口県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '徳島県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '香川県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '愛媛県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '高知県', tier: 'good', note: '県の資料に、市町村別の名称・所在地・電話番号を掲載（25施設）。' },
  { prefecture: '福岡県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '佐賀県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '長崎県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '熊本県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '大分県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '宮崎県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
  { prefecture: '鹿児島県', tier: 'partial', note: '県全体の一覧はなく、鹿児島市内の5施設のみ確認できました（県全体ではありません）。' },
  { prefecture: '沖縄県', tier: 'none', note: '都道府県単位でまとめた一覧は見つかりませんでした。' },
];

export function getEducationSupportCoverage(prefecture: string): EducationSupportCoverage | undefined {
  return EDUCATION_SUPPORT_COVERAGE.find((c) => c.prefecture === prefecture);
}
