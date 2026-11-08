// 独自教育の私立学校（学校教育法第一条に基づく認可私立学校で、シュタイナー教育・
// サドベリー型・イエナプラン・きのくに型等の独自の教育方針を掲げる学校）のデータ
// （2026-11-08追加）。
//
// 元々はlib/data/alternativeSchools.tsに「オルタナティブスクール」として一条校・
// 認可外施設の両方をまとめて置いていたが、「自由の森学園はオルタナティブスクール
// という認識ではない」との指摘を受けて分離した。日本語の一般的な用法では
// 「オルタナティブスクール」は「あえて一条校にしない選択をした学校」を指すことが
// 多く（東洋経済オンライン等の報道を参照）、自由の森学園・シュタイナー学園（神奈川の
// 本家）のような認可私立学校はこの用法に当てはまりにくい。また近年、軽井沢風越学園・
// 大日向小学校のような「新しく開校した、独自の教育方針を掲げる認可私立学校」が
// 増えており、この分類自体への関心も高いと見て、独立したカテゴリとした。
//
// データ・各フィールドの意味はlib/data/alternativeSchools.tsのAlternativeSchool型を
// そのまま再利用する（isAccreditedは常にtrueになるが、型は共通のまま残している）。
// no（通し番号）は元のalternativeSchools.tsでの番号をそのまま引き継いでいる
// （/gakko/alternative/1〜11への既存リンクを/gakko/innovative/1〜11へ
// リダイレクトするため、番号を振り直さない）。
//
// データは各校の公式サイト・メディア掲載情報等をもとに手動で収集（2026-10-29現在）。
// 変更・閉校等の可能性があるため最新情報は各校に確認を。

import type { AlternativeSchool } from './alternativeSchools';

export type InnovativeSchool = AlternativeSchool;

export const INNOVATIVE_SCHOOLS: readonly InnovativeSchool[] = [
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
    admission: { text: '義務教育学校（2027年4月入学）は書類選考のあと、通過者に最終選考（子ども選考・保護者面接）を実施する。募集は1年生35人、2〜6年生若干名、7年生8人。出願は2026年9月11日〜13日（締切済）で、年度途中の編入は受け付けていない。', sourceUrl: 'https://kazakoshi.ed.jp/campus/guide2027/' },
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
    admission: { text: '中学（2027年度入試）はA・B・C入試とも国語・算数の筆記試験と面接（A・Cはグループ、Bは個人）。A・B入試は理科・社会・体育・音楽・美術から1つ選ぶ授業もある。', sourceUrl: 'https://www.jiyunomori.ac.jp/nyugaku/shiken_chugaku.php' },
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
    aliases: ['きのくに子どもの村学園'],
    prefecture: '和歌山県',
    city: '橋本市',
    schoolType: '小・中',
    method: 'kinokuni',
    isAccredited: true,
    officialUrl: 'https://kinokuni.ac.jp/',
    note: 'きのくに子どもの村学園の本校。「体験学習・プロジェクト学習中心」「子ども会議で民主的に学校を運営」が基本方針。イギリスのサマーヒル校にヒントを得た教育。学研の教育メディア「HugKum」（2021年、学園長・堀真一郎氏インタビュー）によれば、実際の仕事に近いプロジェクト活動を中心に据え、そこから派生する形で国語・算数等の基礎学習を行う構成。ドキュメンタリー映画「夢みる小学校」（2022年）でも取り上げられており、そば打ち・建物づくり・農作業・動物飼育といった実践的な活動を通じた学びの様子が紹介されている。',
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
    note: 'きのくに子どもの村学園グループの山梨校。和歌山の本校と同じプロジェクト学習・子どもの自治を重視する教育を実践。山梨県公式広報番組「いいトコ山梨」（2022年6月放送）では、「自由な子ども」を教育目標に掲げ、教員を「先生」ではなくニックネームで呼ぶ校風が紹介されている。',
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
    admission: { text: '2027年度新1年生について体験入学(入学選考)を実施する。入学願書提出前に子どもと学校見学を済ませるよう案内。現1・2年生も若干名募集。', sourceUrl: 'https://kitakyushu.kinokuni.ac.jp/wp/' },
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
] as const;
