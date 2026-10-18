// 都道府県ごとのフリースクール等データの網羅状況。
//
// 学びの多様化学校（MEXT指定84校）は文部科学省の全国統一リストがあるため全都道府県分を
// 正確に把握できるが、フリースクール（民間施設）には全国統一の公的データベースが存在しない。
// 2026年10月の調査では、まず都道府県単位（.go.jp/.lg.jp）で検索し（第1弾）、見つからなかった
// 県は市区町村単位まで掘り下げ、一部は .ed.jp ドメインも対象に含めて再調査した（第2弾）。
// その結果も都道府県ごとに下記のようなばらつきがある。
// このファイルは /gakko ページで「この都道府県は網羅されていません」と正直に案内するために使う。
//
// tier:
//   'good'    = 都道府県（または主要都市）単位で、住所・連絡先つきの一覧が見つかった
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
  { prefecture: '北海道', tier: 'good', note: '札幌市・旭川市・函館市が公開している一覧より掲載（道全体ではなく、この3市の情報です）。' },
  { prefecture: '青森県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '岩手県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '宮城県', tier: 'good', note: '仙台市の学校が運営するサイト（.ed.jpドメイン）で公開されている一覧より掲載。放課後等デイサービス等も一部含みます。' },
  { prefecture: '秋田県', tier: 'good', note: '県公開の「居場所」一覧より掲載（フリースクール以外の相談窓口等も含みます）。' },
  { prefecture: '山形県', tier: 'good', note: '県公開の不登校対応ハンドブックより掲載。' },
  { prefecture: '福島県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '茨城県', tier: 'good', note: '県教育委員会公開の一覧より掲載（学習塾・サポート校等も含みます）。' },
  { prefecture: '栃木県', tier: 'none', note: '公開リストが見つかりませんでした（2026年時点で県が民間団体への調査を実施中とのことです）。' },
  { prefecture: '群馬県', tier: 'partial', note: '県の補助事業で採択された施設のみの一覧です。住所・連絡先の記載はありません。' },
  { prefecture: '埼玉県', tier: 'partial', note: 'さいたま市のみの一覧です（県全体ではありません）。' },
  { prefecture: '千葉県', tier: 'partial', note: '千葉市のみの一覧です（県全体ではありません）。' },
  { prefecture: '東京都', tier: 'partial', note: '都内108施設の名簿ですが、住所・連絡先の記載はありません。' },
  { prefecture: '神奈川県', tier: 'good', note: '県の連携協議会が公開している一覧（38施設）より、住所・連絡先つきで掲載。' },
  { prefecture: '新潟県', tier: 'partial', note: '長岡市公開の資料で施設名のみ確認できました（住所・連絡先の記載はありません）。' },
  { prefecture: '富山県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '石川県', tier: 'partial', note: '金沢市公開のリーフレットより掲載（住所の記載はありません）。' },
  { prefecture: '福井県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '山梨県', tier: 'partial', note: '県公開の一覧ですが、住所・連絡先の記載はありません。' },
  { prefecture: '長野県', tier: 'partial', note: '県が認証した「信州型フリースクール」より掲載。一部施設は住所・連絡先つきですが、全施設分は確認できていません。' },
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
  { prefecture: '島根県', tier: 'partial', note: '県フリースクール等連絡協議会の資料より掲載。PDFの体裁上、施設名と住所の対応が一部不確実です。' },
  { prefecture: '岡山県', tier: 'good', note: '岡山市公開の登録施設一覧より掲載。' },
  { prefecture: '広島県', tier: 'good', note: '県公開の連携団体一覧より掲載。' },
  { prefecture: '山口県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '徳島県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '香川県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '愛媛県', tier: 'partial', note: '今治市が認定した施設の一覧より掲載（今治市在住者向けの認定制度で、県全体ではありません）。' },
  { prefecture: '高知県', tier: 'none', note: '公開リストが見つかりませんでした（フリースクール以外の子どもの居場所情報のみ確認）。' },
  { prefecture: '福岡県', tier: 'partial', note: '確認できたのは福岡市内1施設のみです。' },
  { prefecture: '佐賀県', tier: 'good', note: '県教育委員会が運営するサイトで公開されている一覧より掲載（県内全てを網羅したものではないとの注記あり）。' },
  { prefecture: '長崎県', tier: 'good', note: '県公開の資料より、住所・連絡先つきで掲載（件数は多くありません）。' },
  { prefecture: '熊本県', tier: 'good', note: '県公開の参考資料より掲載（県教育委員会所管ではない参考情報とのことです）。' },
  { prefecture: '大分県', tier: 'partial', note: '県総合教育会議の資料に施設名の記載がありますが、住所・連絡先はほとんど確認できませんでした。' },
  { prefecture: '宮崎県', tier: 'none', note: '公開リストが見つかりませんでした。' },
  { prefecture: '鹿児島県', tier: 'good', note: '県公開の不登校支援ガイドより掲載（県内全てを網羅したものではないとの注記あり）。住所は番地までの記載はありません。' },
  { prefecture: '沖縄県', tier: 'none', note: '公開リストが見つかりませんでした。' },
];

export function getFreeSchoolCoverage(prefecture: string): FreeSchoolCoverage | undefined {
  return FREE_SCHOOL_COVERAGE.find((c) => c.prefecture === prefecture);
}
