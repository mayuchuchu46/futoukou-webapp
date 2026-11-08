// オルタナティブスクール（代替教育を実践する学校・施設）のデータ（2026-10-29追加）。
//
// 「オルタナティブスクール」とは、一般的な公教育とは異なる独自の教育哲学・メソッドで
// 運営される、学校教育法上の「学校」ではない認可外の民間施設の総称。シュタイナー教育・
// サドベリー型民主主義学校・イエナプラン・きのくに型（体験学習・プロジェクト学習）・
// フレネ教育などのアプローチがある。
//
// 2026-11-08、自由の森学園・シュタイナー学園（神奈川の本家）等の一条校（学校教育法
// 第一条に基づく認可私立学校）11校をlib/data/innovativeSchools.ts（独自教育の私立
// 学校）へ分離した。「自由の森学園はオルタナティブスクールという認識ではない」との
// 指摘を受けたもので、日本語の一般的な用法では「オルタナティブスクール」は「あえて
// 一条校にしない選択をした学校」を指すことが多いため、用法のズレを解消する目的。
// isAccreditedフィールドは型をinnovativeSchools.tsと共通にするため残しているが、
// このファイルでは常にfalse（認可外）になる。noは元のまま変えていない
// （12〜26。1〜11はinnovativeSchools.tsへ移動）。
//
// データは各校の公式サイト・メディア掲載情報・都道府県教育委員会の情報等をもとに
// 手動で収集（2026-10-29現在）。変更・閉校等の可能性があるため最新情報は各校に確認を。

import type { SpecialtyTag } from './correspondenceHighSchools';

export type AlternativeSchool = {
  /** 公式サイトで確認できた専門コース・プログラム（無い＝未確認） */
  specialties?: { tag: SpecialtyTag; course: string; sourceUrl: string }[];
  no: number;
  /** 学校・施設名 */
  name: string;
  /** 都道府県 */
  prefecture: string;
  /** 市区町村 */
  city: string;
  /** 対象学年（例：「小・中」「幼・小・中」「中・高」「小学生」） */
  schoolType: string;
  /**
   * 教育メソッドのカテゴリ。
   * 'steiner'：シュタイナー（ルドルフ・シュタイナー）教育
   * 'sudbury'：サドベリー型／デモクラティックスクール
   * 'jena'：イエナプラン教育
   * 'kinokuni'：きのくに型（プロジェクト学習・体験学習中心）
   * 'freinet'：フレネ教育
   * 'other'：独自の教育観・メソッド（上記に当てはまらない）
   */
  method: 'steiner' | 'sudbury' | 'jena' | 'kinokuni' | 'freinet' | 'other';
  /** 一条校（学校教育法第一条に基づく認可私立学校）かどうか */
  isAccredited: boolean;
  /** 公式サイトURL */
  officialUrl?: string;
  /** 住所（確認できた場合） */
  address?: string;
  /** 連絡先（確認できた場合） */
  contact?: string;
  /** 備考・特徴等 */
  note?: string;
  /** 入学・入試の方法（公式サイト等で確認できた事実のみ。無い＝未確認） */
  admission?: { text: string; sourceUrl: string };
};

export const METHOD_LABEL: Record<AlternativeSchool['method'], string> = {
  steiner: 'シュタイナー教育',
  sudbury: 'サドベリー型／デモクラティック',
  jena: 'イエナプラン',
  kinokuni: 'きのくに型（体験学習）',
  freinet: 'フレネ教育',
  other: 'その他（独自の教育観）',
};

export const ALTERNATIVE_SCHOOLS: readonly AlternativeSchool[] = [
  {
    no: 12,
    admission: { text: '入学希望者は問い合わせ後、校長と30分程度の面談を行う。体験は無料見学・1日体験・1週間体験・1か月仮入学がある。2026年度の新入生・年度中途入学の見学と面談を随時受付、中途入学は各学年1名程度募集。', sourceUrl: 'https://www.amazing-college.com/admission-guide' },
    name: 'アメージングカレッジ',
    prefecture: '埼玉県',
    city: '東松山市',
    schoolType: '小学生',
    method: 'other',
    isAccredited: false,
    officialUrl: 'https://amazing-college.com/',
    note: '「子どもが主役」をコンセプトにした認可外の小学生向け施設（2023年開校）。「未来そうぞう科」など独自科目を設定し、子ども自身の発想・起業体験を重視。',
  },
  {
    no: 13,
    admission: { text: '入学手続きは1次面談(子ども・両親・スタッフ)、1日学校体験、1週間学校体験(2度まで可)、最終面談の段階的なステップ。入学対象年齢は4月1日時点で5〜17歳。募集期間・定員数の記載はなく、『定員になり次第受付終了』とある。', sourceUrl: 'https://tokyosudbury.com/admission/' },
    name: '東京サドベリースクール',
    prefecture: '東京都',
    city: '世田谷区',
    schoolType: '小・中・高相当',
    method: 'sudbury',
    isAccredited: false,
    officialUrl: 'https://tokyosudbury.com/',
    note: '子ども自身がすべてのルールを民主的に決め、自由に過ごしながら学ぶサドベリー型民主主義学校。年齢混合・完全自由学習が基本方針。',
  },
  {
    no: 14,
    name: '湘南サドベリースクール',
    prefecture: '神奈川県',
    city: '茅ヶ崎市',
    schoolType: '小・中相当',
    method: 'sudbury',
    isAccredited: false,
    officialUrl: 'https://shonan-sudbury.com/',
    note: '子どもが自分の時間・活動を完全に管理するサドベリー型民主主義学校。学習指導要領に縛られず、子どもが「学びたい時に学びたいことを学ぶ」が原則。',
  },
  {
    no: 15,
    name: 'おひさまの丘 宮城シュタイナー学園',
    prefecture: '宮城県',
    city: '黒川郡大和町',
    schoolType: '小・中相当',
    method: 'steiner',
    isAccredited: false,
    officialUrl: 'https://miyagi-steiner.com/',
    note: '宮城県のシュタイナー系フリースクール。シュタイナー教育の哲学（芸術・音楽・手仕事・自然との関わりを重視）に基づいた活動を実施。',
  },
  {
    no: 16,
    name: '東京賢治シュタイナー学校',
    prefecture: '東京都',
    city: '世田谷区',
    schoolType: '小・中相当',
    method: 'steiner',
    isAccredited: false,
    officialUrl: 'https://kenji-steiner.jp/',
    note: '東京都内のシュタイナー系民間学校。農業・手仕事・芸術を重視し、子どもの内的発達に寄り添う教育を実践。',
  },
  {
    no: 17,
    name: '横浜シュタイナー学園',
    prefecture: '神奈川県',
    city: '横浜市',
    schoolType: '幼・小・中相当',
    method: 'steiner',
    isAccredited: false,
    officialUrl: 'https://yokohama-steiner.com/',
    note: '横浜のシュタイナー系学校（幼稚園・小学校・中学校相当の課程を持つ）。',
  },
  {
    no: 18,
    name: '京田辺シュタイナー学校',
    prefecture: '京都府',
    city: '京田辺市',
    schoolType: '小・中・高相当',
    method: 'steiner',
    isAccredited: false,
    officialUrl: 'https://kyotanabe-steiner.net/',
    note: '関西のシュタイナー系民間学校。12年間一貫のシュタイナー教育を実践。',
  },
  {
    no: 19,
    name: '三河サドベリースクール・シードーム',
    prefecture: '愛知県',
    city: '岡崎市',
    schoolType: '小・中・高相当',
    method: 'sudbury',
    isAccredited: false,
    officialUrl: 'https://seedome.org/',
    note: '東海地方のサドベリー型民主主義学校。子ども自身が自分の時間をすべて管理し、「学びたいことを学びたい時に」が基本方針。',
  },
  {
    no: 20,
    admission: { text: '入学までのステップに、スクール見学、体験入学、入学願書提出と考査料納付、入学考査、両親・スクール面談が含まれる。定員・入学基準は募集要項で確認する形で、本文に数値はない。', sourceUrl: 'https://tokyocs.org/admissions/school/step' },
    specialties: [{ tag: 'it', course: '情報(プログラミング)', sourceUrl: 'https://tokyocs.org/schoollife/primary/academics' }],
    name: '東京コミュニティスクール',
    prefecture: '東京都',
    city: '中野区',
    schoolType: '小学生相当',
    method: 'other',
    isAccredited: false,
    officialUrl: 'https://tokyocs.org/',
    note: '小学生を対象にした認可外の学校。「探求学習」「学際的テーマ学習」を中心に、子どもが「なぜ？」と問い続ける力を育てる教育を実践。',
  },
  {
    no: 21,
    admission: { text: '全部門共通で入学申込書を郵送または持参で提出し、見学(水曜9〜12時)と最大1週間の体験入学(随時受付)がある。高等部(中卒以上)は4月入学で、取得単位によって編入学が可能な場合がある。', sourceUrl: 'https://sangosya.com/admission-2/' },
    specialties: [{ tag: 'music', course: 'シンカソング', sourceUrl: 'https://sangosya.com/koutoubu/' }, { tag: 'art', course: '紅型講座・焼物講座', sourceUrl: 'https://sangosya.com/koutoubu/' }, { tag: 'performing', course: '沖縄講座（芸能）', sourceUrl: 'https://sangosya.com/koutoubu/' }],
    name: '珊瑚舎スコーレ',
    prefecture: '沖縄県',
    city: '那覇市',
    schoolType: '中・高相当',
    method: 'other',
    isAccredited: false,
    officialUrl: 'https://sangosya.com/',
    note: '沖縄・那覇の民間学校。学校に行けない・行かない子どもたちの学びと居場所を支援。沖縄の自然・文化を活かした体験的な学びを重視。',
  },
  {
    no: 22,
    name: 'まっくろくろすけ',
    prefecture: '兵庫県',
    city: '神戸市',
    schoolType: '小・中相当',
    method: 'sudbury',
    isAccredited: false,
    officialUrl: 'https://makkurokuro.net/',
    note: '兵庫・神戸のサドベリー型民主主義学校。子どもが自ら選択・決定する環境を提供し、強制的な学習指導は行わない。',
  },
  // 2026-11-07追加。神戸市・京都市等が公開している「フリースクール等情報交換会」
  // 事業説明資料（認定施設の一覧）および神戸市の説明資料PDFで確認できた施設。
  {
    no: 23,
    name: 'オルタナティブスクール さとのわ',
    prefecture: '兵庫県',
    city: '神戸市',
    schoolType: '小・中',
    method: 'other',
    isAccredited: false,
    officialUrl: 'https://satonowa.info/academy.html',
    address: '神戸市西区押部谷町木幡353',
    note: '神戸市西区の里山フィールドを拠点に、自然とテクノロジーを融合した学びを展開。田んぼプロジェクトや地域貢献活動など多様な体験を重視。2020年4月設立。',
  },
  {
    no: 24,
    name: '学びの森オルタナティブスクール',
    prefecture: '京都府',
    city: '亀岡市',
    schoolType: '小3〜中3',
    method: 'other',
    isAccredited: false,
    officialUrl: 'https://manabinomori.co.jp/',
    address: '京都府亀岡市南つつじヶ丘大葉台2-44-9',
    note: '「基礎・探究・共創」の3領域を軸に、子どもが自分の学び方を選び、つくり続ける力を育てる。学校・教育委員会と連携し、出席報告や学習成果報告を行っている。',
  },
  {
    no: 25,
    name: 'ラーンネット・グローバルスクール',
    prefecture: '兵庫県',
    city: '神戸市',
    schoolType: '小学生',
    method: 'other',
    isAccredited: false,
    officialUrl: 'https://l-net.com/',
    address: '神戸市東灘区岡本2-8-14',
    note: '1996年設立、25年以上の歴史を持つ探究型のオルタナティブスクール（フルスクール）。「テーマ学習」「とことんプロジェクト」など独自科目を展開。',
  },
  {
    no: 26,
    name: '森の学校みっけ',
    prefecture: '徳島県',
    city: '名西郡神山町',
    schoolType: '小学生',
    method: 'other',
    isAccredited: false,
    officialUrl: 'https://mapisfullofknots.wixsite.com/-site-1',
    address: '徳島県名西郡神山町神領字南上角257番地',
    note: '特定非営利活動法人みっけが運営。大人から提案するプランもあるが、子どもの意欲・主体性を尊重し、1日の過ごし方を子どもたちと一緒にデザインする。長期休みや土曜日の自然体験プログラムもあり。',
  },
] as const;
