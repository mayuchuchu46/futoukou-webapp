// 都道府県ごとのフリースクール等データの網羅状況。
//
// 学びの多様化学校（MEXT指定84校）は文部科学省の全国統一リストがあるため全都道府県分を
// 正確に把握できるが、フリースクール（民間施設）には全国統一の公的データベースが存在しない。
// 2026年10月の調査では、都道府県・市区町村教育委員会等が独自に公開している一覧を
// .go.jp/.lg.jpドメインに限定して収集したが、都道府県ごとに下記のようなばらつきがあった。
// このファイルは /gakko ページで「この都道府県は網羅されていません」と正直に案内するために使う。
//
// tier:
//   'good'    = 都道府県（または広域）単位で、住所・連絡先つきの一覧が見つかった
//   'partial' = 一覧はあるが、市区町村単位のみ／住所や連絡先が欠落／件数が極端に少ない等、不完全
//   'none'    = 公開リスト（施設名を列記したもの）が見つからなかった
//   'unprocessed' = 一覧の存在は確認できたが、画像PDF等の事情でデータを抽出できなかった
export type FreeSchoolCoverageTier = 'good' | 'partial' | 'none' | 'unprocessed';

export type FreeSchoolCoverage = {
  prefecture: string;
  tier: FreeSchoolCoverageTier;
  note: string;
};

export const FREE_SCHOOL_COVERAGE: FreeSchoolCoverage[] = [
  { prefecture: '北海道', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '青森県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '岩手県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '宮城県', tier: 'none', note: '公開リストが見つかりませんでした（施設名は匿名化された資料のみ確認）。' },
  { prefecture: '秋田県', tier: 'good', note: '県公開の「居場所」一覧より掲載（フリースクール以外の相談窓口等も含みます）。' },
  { prefecture: '山形県', tier: 'good', note: '県公開の不登校対応ハンドブックより掲載。' },
  { prefecture: '福島県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '茨城県', tier: 'good', note: '県教育委員会公開の一覧より掲載（学習塾・サポート校等も含みます）。' },
  { prefecture: '栃木県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '群馬県', tier: 'partial', note: '県の補助事業で採択された施設のみの一覧です。住所・連絡先の記載はありません。' },
  { prefecture: '埼玉県', tier: 'partial', note: 'さいたま市のみの一覧です（県全体ではありません）。' },
  { prefecture: '千葉県', tier: 'partial', note: '千葉市のみの一覧です（県全体ではありません）。' },
  { prefecture: '東京都', tier: 'partial', note: '都内108施設の名簿ですが、住所・連絡先の記載はありません。' },
  { prefecture: '神奈川県', tier: 'partial', note: '県全体の一覧ですが、住所・連絡先は施設ごとの個別資料のみに記載されており、今回は未確認です。' },
  { prefecture: '新潟県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '富山県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '石川県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '福井県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '山梨県', tier: 'partial', note: '県公開の一覧ですが、住所・連絡先の記載はありません。' },
  { prefecture: '長野県', tier: 'partial', note: '県が認証した「信州型フリースクール」の一部ですが、住所・連絡先の記載はありません。' },
  { prefecture: '岐阜県', tier: 'partial', note: '県の調査結果ですが、住所・連絡先の記載はありません。' },
  { prefecture: '静岡県', tier: 'unprocessed', note: '県公開の一覧の存在は確認できましたが、画像PDFのため内容を読み取れませんでした。' },
  { prefecture: '愛知県', tier: 'good', note: '県の連絡協議会参加団体一覧より掲載。' },
  { prefecture: '三重県', tier: 'good', note: '県の運営支援補助金交付対象施設一覧より掲載。' },
  { prefecture: '滋賀県', tier: 'good', note: '県公開のリーフレットより掲載。' },
  { prefecture: '京都府', tier: 'partial', note: '京都市が個別に公開している施設資料のみ確認できました（市内の一部のみ）。' },
  { prefecture: '大阪府', tier: 'good', note: '府教育委員会公開の一覧より掲載。' },
  { prefecture: '兵庫県', tier: 'partial', note: '神戸市公開の一覧のみ確認できました（市内の一部は住所・連絡先が欠落）。' },
  { prefecture: '奈良県', tier: 'partial', note: '奈良市公開の資料のみ確認できました（市内のみ、情報も限られます）。' },
  { prefecture: '和歌山県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '鳥取県', tier: 'good', note: '県公開の施設マップより掲載。' },
  { prefecture: '島根県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '岡山県', tier: 'partial', note: '確認できたのは1施設の個別紹介のみです。' },
  { prefecture: '広島県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '山口県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '徳島県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '香川県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '愛媛県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '高知県', tier: 'none', note: '公開リストが見つかりませんでした（フリースクール以外の子どもの居場所情報のみ確認）。' },
  { prefecture: '福岡県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '佐賀県', tier: 'good', note: '県教育委員会が運営するサイトで公開されている一覧より掲載（県内全てを網羅したものではないとの注記あり）。' },
  { prefecture: '長崎県', tier: 'partial', note: '県公開の一覧ですが、住所・連絡先の記載は一部のみです。' },
  { prefecture: '熊本県', tier: 'partial', note: '熊本市公開の一覧のみ確認できました（住所・連絡先の記載はありません）。' },
  { prefecture: '大分県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '宮崎県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '鹿児島県', tier: 'good', note: '県公開の不登校支援ガイドより掲載（県内全てを網羅したものではないとの注記あり）。住所は番地までの記載はありません。' },
  { prefecture: '沖縄県', tier: 'none', note: '公開リストが見つかりませんでした。' },
];

export function getFreeSchoolCoverage(prefecture: string): FreeSchoolCoverage | undefined {
  return FREE_SCHOOL_COVERAGE.find((c) => c.prefecture === prefecture);
}
