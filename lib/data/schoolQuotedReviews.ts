// 学校詳細ページに掲載する「実在の口コミ・評判」の静的データ。
//
// 【掲載方針】
// - 行政公式資料・教育メディアの独立取材記事・学校公式の学校関係者評価PDFの
//   自由記述コメント・映画等の観客レビューからの最小限の引用（日本著作権法32条）。
// - minkou.jp・school.js88.com等の第三者レビューサイトは許諾取得前は掲載しない。
// - facilityType + facilityNo の組み合わせで紐付ける（各学校詳細ページのURLパラメータと一致）。
// - 1引用 = 15〜50字程度のエッセンス部分のみ（原著作物に対する従属的な引用）。
// - sourceUrl は引用元の一次URL。表示名に使うsourceName は一般読者が理解できる短い名称。
//
// 更新日: 2026-11-08
//
// 【調査済み・今後追加可能な状況】（2026-11-14追記）
// - きのくに子どもの村グループ (innovative, no: 4,5,6,7,8): 山梨県行政・HugKum記事・映画レビュー
// - 星槎国際高等学校 (tsushin, no: 2): 富山県公式サイト
// - クラーク記念国際高等学校 (tsushin, no: 1): 文科省資料（学校自己PR）
// - N高等学校・S高等学校 (tsushin, no: 113, 16): Business Insider取材記事
// - 八洲学園高等学校 (tsushin, no: 76): 学校公式の学校関係者評価PDF（保護者自由記述）
// - フリースクール東京シューレ王子・大田・新宿 (free, no: 160,161,162): 国立女性教育会館発行誌の生徒紹介記事・文春オンラインの理事長インタビュー
//
// 【分かっていること】教育理念型・老舗・大手ブランド校以外では、行政・独立メディア軸の
// 「掲載可能な声」はほぼ見つからない（claude/futoukou-school-reviews-pilot-kinokuni.md、
// 15校調査で9校がゼロ件だった）。全校への横展開には、minkou.jp等への掲載許諾取得、または
// どうする先生の自前アンケート整備が必要（同ドキュメント参照）。

export type FacilityType =
  | 'school'
  | 'alternative'
  | 'free'
  | 'teiji'
  | 'tsushin'
  | 'online'
  | 'innovative';

export type SourceType = 'government' | 'media' | 'school_self' | 'audience_review';

export type QuotedReview = {
  /** 引用テキスト（15〜50字程度。原文そのまま、改変なし） */
  quote: string;
  /** 引用元の一次URL */
  sourceUrl: string;
  /** 表示用の出典名（例:「山梨県公式広報番組」「HugKum」） */
  sourceName: string;
  /** 出典の補足情報（取材年・掲載日・発言者属性など） */
  sourceDetail?: string;
  /** ソース種別（表示のラベル分けに使用） */
  sourceType: SourceType;
};

export type FacilityQuotedReviews = {
  facilityType: FacilityType;
  facilityNo: number;
  reviews: QuotedReview[];
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  government: '行政資料',
  media: 'メディア取材',
  school_self: '学校公開資料',
  audience_review: '観客レビュー',
};

// キー: `${facilityType}:${facilityNo}`
// 参照: findQuotedReviews()
const SCHOOL_QUOTED_REVIEWS: FacilityQuotedReviews[] = [
  // -------------------------
  // きのくに子どもの村小中学校（本校・和歌山）no=4
  // -------------------------
  {
    facilityType: 'innovative',
    facilityNo: 4,
    reviews: [
      {
        quote:
          'ここには、いわゆる「先生」はおらず、子どもたちは、大人をニックネームで呼びます。',
        sourceUrl: 'https://www.pref.yamanashi.jp/kouho/iitoko/mv202206.html',
        sourceName: '山梨県公式広報番組「いいトコ山梨」',
        sourceDetail: '2022年6月放送・南アルプス子どもの村小学校の紹介回より',
        sourceType: 'government',
      },
      {
        quote:
          'きのくに子どもの村学園では、本物の仕事さながらのプロジェクトが中心であり、そのプロジェクトを題材とした基礎学習をおこなっています。',
        sourceUrl: 'https://hugkum.sho.jp/252882',
        sourceName: 'HugKum（学研）',
        sourceDetail: '2021年・学園長 堀真一郎氏インタビュー',
        sourceType: 'media',
      },
      {
        quote:
          '蕎麦打ちや建物作り、農作業に動物の飼育等実践活動を通じて学びの連帯感を育む小学校。本当に夢見るような居場所が此処にあるんだなあ',
        sourceUrl: 'https://movie.jorudan.co.jp/cinema/51098/review/',
        sourceName: '映画「夢みる小学校」観客レビュー',
        sourceDetail: '2022年10月・★5',
        sourceType: 'audience_review',
      },
    ],
  },
  // -------------------------
  // 南アルプス子どもの村小中学校（山梨）no=5
  // -------------------------
  {
    facilityType: 'innovative',
    facilityNo: 5,
    reviews: [
      {
        quote:
          'ここには、いわゆる「先生」はおらず、子どもたちは、大人をニックネームで呼びます。',
        sourceUrl: 'https://www.pref.yamanashi.jp/kouho/iitoko/mv202206.html',
        sourceName: '山梨県公式広報番組「いいトコ山梨」',
        sourceDetail: '2022年6月放送・同校紹介回より',
        sourceType: 'government',
      },
      {
        quote:
          'きのくに子どもの村学園では、本物の仕事さながらのプロジェクトが中心であり、そのプロジェクトを題材とした基礎学習をおこなっています。',
        sourceUrl: 'https://hugkum.sho.jp/252882',
        sourceName: 'HugKum（学研）',
        sourceDetail: '2021年・学園長 堀真一郎氏インタビュー',
        sourceType: 'media',
      },
    ],
  },
  // -------------------------
  // かつやま子どもの村小中学校（福井）no=6
  // -------------------------
  {
    facilityType: 'innovative',
    facilityNo: 6,
    reviews: [
      {
        quote:
          'きのくに子どもの村学園では、本物の仕事さながらのプロジェクトが中心であり、そのプロジェクトを題材とした基礎学習をおこなっています。',
        sourceUrl: 'https://hugkum.sho.jp/252882',
        sourceName: 'HugKum（学研）',
        sourceDetail: '2021年・学園長 堀真一郎氏インタビュー',
        sourceType: 'media',
      },
    ],
  },
  // -------------------------
  // 星槎国際高等学校 (tsushin, no=2)
  // -------------------------
  {
    facilityType: 'tsushin',
    facilityNo: 2,
    reviews: [
      {
        quote:
          '前籍校の取得単位が無駄にならず学習できました。子どもがイキイキとした姿に変わっていき嬉しく思いました。',
        sourceUrl: 'https://www.pref.toyama.jp/1510/kensei/koho/kenminchanel/kiji/1032010.html',
        sourceName: '富山県公式サイト',
        sourceDetail: '星槎国際高等学校富山学習センター 保護者の声より',
        sourceType: 'government',
      },
    ],
  },
  // -------------------------
  // クラーク記念国際高等学校 (tsushin, no=1)
  // -------------------------
  {
    facilityType: 'tsushin',
    facilityNo: 1,
    reviews: [
      {
        quote: '行動指針「夢・挑戦・達成」○クラーク国際生を信じる ○伸ばしてこそ学校 ○教育に限界を作らない',
        sourceUrl: 'https://www.mext.go.jp/content/20220622-mxt_seitoshido01-000023798_14.pdf',
        sourceName: '文部科学省公開資料',
        sourceDetail: '「クラーク記念国際高等学校の取組」（同校・保志悦宏氏発表資料）',
        sourceType: 'school_self',
      },
    ],
  },
  // -------------------------
  // N高等学校 (tsushin, no=113)
  // -------------------------
  {
    facilityType: 'tsushin',
    facilityNo: 113,
    reviews: [
      {
        quote:
          '不登校の学生にとって、N高等学校が何らかのきっかけになれば幸いです。けれども、不登校の学生だけを集める学校にするつもりは一切ありません。',
        sourceUrl: 'https://www.businessinsider.jp/post-170254',
        sourceName: 'Business Insider Japan',
        sourceDetail: '2019年・校長 奥平博一氏インタビュー',
        sourceType: 'media',
      },
      {
        quote:
          '報道などではいわゆるキラキラした生徒さんがクローズアップされることが多いですが、小中学校時代に不登校を経験した生徒さんや、将来やりたいことがまだ見つかっていないという生徒さんも多く入学されています。',
        sourceUrl: 'https://www.businessinsider.jp/post-170254',
        sourceName: 'Business Insider Japan',
        sourceDetail: '2019年・校長 奥平博一氏インタビュー',
        sourceType: 'media',
      },
    ],
  },
  // -------------------------
  // S高等学校 (tsushin, no=16)
  // -------------------------
  {
    facilityType: 'tsushin',
    facilityNo: 16,
    reviews: [
      {
        quote:
          '不登校の学生にとって、N高等学校が何らかのきっかけになれば幸いです。けれども、不登校の学生だけを集める学校にするつもりは一切ありません。',
        sourceUrl: 'https://www.businessinsider.jp/post-170254',
        sourceName: 'Business Insider Japan',
        sourceDetail: '2019年・N高グループ・校長 奥平博一氏インタビュー',
        sourceType: 'media',
      },
    ],
  },
  // -------------------------
  // 八洲学園高等学校 (tsushin, no=76)
  // -------------------------
  {
    facilityType: 'tsushin',
    facilityNo: 76,
    reviews: [
      {
        quote:
          '生徒との向き合い方に助かる。本人も話しやすく、家庭では話さないような内容を話している。保護者とも連携してくれていて助かる。',
        sourceUrl: 'https://hs.yashima.ac.jp/pdf/school_evaluation2023.pdf',
        sourceName: '八洲学園高等学校 学校関係者評価（保護者）',
        sourceDetail: '2023年度・保護者自由記述',
        sourceType: 'school_self',
      },
      {
        quote:
          '入学の際に、ベーシッククラスは人数が多くて娘には負担でしたので、少人数クラスにしていただくことができ、現在は少人数の環境で授業を受けています。',
        sourceUrl: 'https://hs.yashima.ac.jp/pdf/school_evaluation2023.pdf',
        sourceName: '八洲学園高等学校 学校関係者評価（保護者）',
        sourceDetail: '2023年度・保護者自由記述',
        sourceType: 'school_self',
      },
    ],
  },
  // -------------------------
  // フリースクール東京シューレ王子 (free, no=160)
  // -------------------------
  {
    facilityType: 'free',
    facilityNo: 160,
    reviews: [
      {
        quote:
          '小学校6年生から東京シューレ王子に通い始め、現在高三部に在籍。仲間と2年半の準備を重ね、アラスカで現地フリースクールの子どもたちと交流しオーロラを見る夢をかなえた。',
        sourceUrl: 'https://nwec.repo.nii.ac.jp/record/17676/files/NWEC-NJM00450251.pdf',
        sourceName: '国立女性教育会館（NWEC）発行誌',
        sourceDetail: '東京シューレ王子に通う生徒（当時16歳）の紹介記事より',
        sourceType: 'government',
      },
      {
        quote:
          '不登校をとりまく環境は、大きな転換点を迎えつつあります。ところが、それをご存知ない方が多いのも事実です。',
        sourceUrl: 'https://bunshun.jp/articles/-/15690',
        sourceName: '文春オンライン',
        sourceDetail: '東京シューレ理事長・奥地圭子氏インタビュー',
        sourceType: 'media',
      },
    ],
  },
  // -------------------------
  // フリースクール東京シューレ大田 (free, no=161) ※運営団体・活動内容は王子と共通
  // -------------------------
  {
    facilityType: 'free',
    facilityNo: 161,
    reviews: [
      {
        quote:
          '不登校をとりまく環境は、大きな転換点を迎えつつあります。ところが、それをご存知ない方が多いのも事実です。',
        sourceUrl: 'https://bunshun.jp/articles/-/15690',
        sourceName: '文春オンライン',
        sourceDetail: '運営団体（NPO法人東京シューレ）理事長・奥地圭子氏インタビュー',
        sourceType: 'media',
      },
    ],
  },
  // -------------------------
  // フリースクール東京シューレ新宿 (free, no=162) ※運営団体・活動内容は王子と共通
  // -------------------------
  {
    facilityType: 'free',
    facilityNo: 162,
    reviews: [
      {
        quote:
          '不登校をとりまく環境は、大きな転換点を迎えつつあります。ところが、それをご存知ない方が多いのも事実です。',
        sourceUrl: 'https://bunshun.jp/articles/-/15690',
        sourceName: '文春オンライン',
        sourceDetail: '運営団体（NPO法人東京シューレ）理事長・奥地圭子氏インタビュー',
        sourceType: 'media',
      },
    ],
  },
];

/** facilityType + facilityNo で引用リストを取得。見つからなければ空配列を返す */
export function findQuotedReviews(
  facilityType: FacilityType,
  facilityNo: number | string,
): QuotedReview[] {
  const no = Number(facilityNo);
  const entry = SCHOOL_QUOTED_REVIEWS.find(
    (r) => r.facilityType === facilityType && r.facilityNo === no,
  );
  return entry?.reviews ?? [];
}
