// オルタナティブスクール（代替教育を実践する学校・施設）のデータ（2026-10-29追加）。
//
// 「オルタナティブスクール」とは、一般的な公教育とは異なる独自の教育哲学・メソッドで
// 運営される学校・施設の総称。シュタイナー教育・サドベリー型民主主義学校・イエナプラン・
// きのくに型（体験学習・プロジェクト学習）・フレネ教育などがある。
//
// 一条校（学校教育法第一条に基づく認可私立学校）と、認可外の私設施設（フリースクール
// 等）が混在する。一条校は高校卒業資格等の公的資格が取得できる点で非一条校と大きく異なる。
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
  // ── 一条校（認可私立学校） ──────────────────────────────────────────────
  {
    no: 1,
    name: '大日向小学校',
    prefecture: '長野県',
    city: '南佐久郡佐久穂町',
    schoolType: '小',
    method: 'jena',
    isAccredited: true,
    officialUrl: 'https://www.ohinata-elementary.jp/',
    note: '日本初のイエナプラン認定校（2019年開校）。異年齢の「サークル対話」と自主的な学びを重視。長野県の私立小学校として認可。',
  },
  {
    no: 2,
    name: '軽井沢風越学園',
    prefecture: '長野県',
    city: '北佐久郡軽井沢町',
    schoolType: '幼・小・中',
    method: 'other',
    isAccredited: true,
    officialUrl: 'https://kazakoshi.ed.jp/',
    note: '2020年開校の幼小中一貫の認可私立学校。子どもの「問い」や「探求」を起点にしたプロジェクト型学習。「軽井沢」という地域環境を活かした自然体験も特色。',
  },
  {
    no: 3,
    specialties: [{ tag: 'music', course: '選択講座 声楽', sourceUrl: 'https://www.jiyunomori.ac.jp/kyouka/sentaku.php' }, { tag: 'art', course: '選択講座 陶芸・木版画等', sourceUrl: 'https://www.jiyunomori.ac.jp/kyouka/sentaku.php' }, { tag: 'nature', course: '選択講座 農業', sourceUrl: 'https://www.jiyunomori.ac.jp/kyouka/sentaku.php' }, { tag: 'food', course: '選択講座 食べもの', sourceUrl: 'https://www.jiyunomori.ac.jp/kyouka/sentaku.php' }, { tag: 'performing', course: '選択演劇', sourceUrl: 'https://www.jiyunomori.ac.jp/kyouka/sentaku.php' }],
    name: '自由の森学園中学校・高等学校',
    prefecture: '埼玉県',
    city: '飯能市',
    schoolType: '中・高',
    method: 'other',
    isAccredited: true,
    officialUrl: 'https://www.jiyunomori.ac.jp/',
    address: '埼玉県飯能市小岩井613',
    note: '定期テスト・数字による評価（成績表）なし。学ぶプロセスを重視した「作品主義」の教育。芸術・音楽・体験活動を豊富に取り入れ、寮も完備。',
  },
  {
    no: 4,
    specialties: [{ tag: 'performing', course: 'プロジェクト「劇団きのくに」', sourceUrl: 'http://www.kinokuni.ac.jp/nc/html/htdocs/index.php?page_id=71' }, { tag: 'food', course: 'プロジェクト「おもしろ料理店」', sourceUrl: 'http://www.kinokuni.ac.jp/nc/html/htdocs/index.php?page_id=71' }, { tag: 'nature', course: 'プロジェクト「ファーム」(農業)', sourceUrl: 'http://www.kinokuni.ac.jp/nc/html/htdocs/index.php?page_id=71' }],
    name: 'きのくに子どもの村小中学校',
    prefecture: '和歌山県',
    city: '橋本市',
    schoolType: '小・中',
    method: 'kinokuni',
    isAccredited: true,
    officialUrl: 'https://kinokuni.ac.jp/',
    note: 'きのくに子どもの村学園の本校。「体験学習・プロジェクト学習中心」「子ども会議で民主的に学校を運営」が基本方針。イギリスのサマーヒル校にヒントを得た教育。',
  },
  {
    no: 5,
    name: '南アルプス子どもの村小中学校',
    prefecture: '山梨県',
    city: '南アルプス市',
    schoolType: '小・中',
    method: 'kinokuni',
    isAccredited: true,
    officialUrl: 'https://minami-alps.ac.jp/',
    note: 'きのくに子どもの村学園グループの山梨校。和歌山の本校と同じプロジェクト学習・子どもの自治を重視する教育を実践。',
  },
  {
    no: 6,
    name: 'かつやま子どもの村小中学校',
    prefecture: '福井県',
    city: '勝山市',
    schoolType: '小・中',
    method: 'kinokuni',
    isAccredited: true,
    officialUrl: 'https://katsuyama.ac.jp/',
    note: 'きのくに子どもの村学園グループの福井校。山、川、雪など福井の自然を活かしたプロジェクト学習が特色。',
  },
  {
    no: 7,
    name: '北九州子どもの村小中学校',
    prefecture: '福岡県',
    city: '北九州市',
    schoolType: '小・中',
    method: 'kinokuni',
    isAccredited: true,
    officialUrl: 'https://kitakyushu.ac.jp/',
    note: 'きのくに子どもの村学園グループの九州校。都市近郊でありながら体験学習・子どもの自治を実践。',
  },
  {
    no: 8,
    name: 'ながさき東そのぎ子どもの村小中学校',
    prefecture: '長崎県',
    city: '東彼杵郡東彼杵町',
    schoolType: '小・中',
    method: 'kinokuni',
    isAccredited: true,
    officialUrl: 'https://nagasaki-higashisonogi.ac.jp/',
    note: 'きのくに子どもの村学園グループの長崎校。農漁村の自然環境を活かしたプロジェクト学習を実践。',
  },
  {
    no: 9,
    name: '学校法人シュタイナー学園',
    prefecture: '神奈川県',
    city: '相模原市緑区',
    schoolType: '小・中・高',
    method: 'steiner',
    isAccredited: true,
    officialUrl: 'https://www.steinerschule.ac.jp/',
    note: '日本で初めて学校法人として設立されたシュタイナー学校（2010年認可）。子どもの発達段階に合わせた芸術・音楽・手仕事を重視する12年間一貫教育。',
  },
  {
    no: 10,
    name: '北海道シュタイナー学園いずみの学校',
    prefecture: '北海道',
    city: '恵庭市',
    schoolType: '小・中',
    method: 'steiner',
    isAccredited: true,
    officialUrl: 'https://www.izuminogakuen.com/',
    note: '北海道初の認可シュタイナー学校（2010年代に北海道の私立小中学校として認可）。',
  },
  {
    no: 11,
    name: '箕面こどもの森学園',
    prefecture: '大阪府',
    city: '箕面市',
    schoolType: '小',
    method: 'freinet',
    isAccredited: true,
    officialUrl: 'https://minohkodomonomoregakuen.ed.jp/',
    note: 'フレネ教育を実践する大阪の認可私立小学校。子ども自身が印刷・出版する「学校新聞」が特色の一つ。',
  },
  // ── 非一条校（認可外の施設・フリースクール等） ─────────────────────────
  {
    no: 12,
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
] as const;
