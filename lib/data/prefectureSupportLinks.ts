// 都道府県ごとの、不登校に関する公的な相談窓口・支援情報ページ。
// 2026-11-02のWeb調査（claude/futoukou-event-links-research.md参照）で確認できた
// 27都道府県分のURLのみを記載し、残り20都道府県はurl: nullとして「市区町村の
// 教育委員会に問い合わせ」という汎用案内を出す（2026-11-08、/supportページに
// 都道府県別の窓口案内を追加する際に導入）。
//
// 注意：
// - URLは各都道府県教育委員会等の公式サイトを調査時点（2026-11-02）で確認したもの。
//   自治体サイトはURL変更が比較的多いため、リンク切れが疑われたら公式サイトで
//   再確認のうえ更新すること。特に三重県は「年度ごとにURLが変わる可能性がある」と
//   調査時点で注記されている。
// - pageTypeは実態（相談窓口一覧／総合情報サイト／イベント案内など）を示す。
//   「イベント案内」であっても、開催期間外のイベントが載っている可能性があるため、
//   案内文言は「相談窓口・支援情報」という中立的な表現に統一している。
export type PrefectureSupportLink = {
  prefecture: string;
  url: string | null;
  department: string | null;
  pageType: string | null;
};

export const PREFECTURE_SUPPORT_LINKS: PrefectureSupportLink[] = [
  { prefecture: '北海道', url: null, department: null, pageType: null },
  { prefecture: '青森県', url: 'https://www.pref.aomori.lg.jp/soshiki/kyoiku/e-seisaku/soudan.html', department: '青森県教育委員会 教育政策課', pageType: '相談窓口一覧' },
  { prefecture: '岩手県', url: null, department: null, pageType: null },
  { prefecture: '宮城県', url: 'https://www.pref.miyagi.jp/soshiki/gikyou/tokusetu/jidouseito-sien.html', department: '宮城県教育委員会 義務教育課学びの環境サポート班', pageType: '総合情報サイト' },
  { prefecture: '秋田県', url: null, department: null, pageType: null },
  { prefecture: '山形県', url: null, department: null, pageType: null },
  { prefecture: '福島県', url: 'https://www.pref.fukushima.lg.jp/site/edu/gimukyoiku61.html', department: '福島県教育委員会 義務教育課', pageType: '総合情報' },
  { prefecture: '茨城県', url: null, department: null, pageType: null },
  { prefecture: '栃木県', url: 'https://www.pref.tochigi.lg.jp/m01/futoukou.html', department: '教育政策課 教育DX推進室', pageType: '総合情報' },
  { prefecture: '群馬県', url: 'https://www.pref.gunma.jp/site/kyouiku/628097.html', department: '群馬県教育委員会総務課・義務教育課生徒指導係等', pageType: '総合情報サイト' },
  { prefecture: '埼玉県', url: 'https://www.pref.saitama.lg.jp/f2209/futoukoshien/', department: '埼玉県教育委員会', pageType: '総合情報サイト' },
  { prefecture: '千葉県', url: 'https://www.pref.chiba.lg.jp/kyouiku/shidou/seitoshidou/ijimemondai/futoukou-taisaku.html', department: '教育振興部児童生徒安全課 不登校児童生徒支援室', pageType: '総合情報＋相談窓口一覧' },
  { prefecture: '東京都', url: 'https://fs-support-event.metro.tokyo.lg.jp', department: '東京都（都委託事業）', pageType: 'イベント案内「不登校の子供を支える保護者のひろば」' },
  { prefecture: '神奈川県', url: 'https://www.pref.kanagawa.jp/docs/v3p/hutoukou/soudankai.html', department: '教育局支援部子ども教育支援課', pageType: 'イベント案内（相談会）' },
  { prefecture: '新潟県', url: 'https://www.pref.niigata.lg.jp/sec/kyoiku_kaetsu/1193069742429.html', department: '教育庁下越教育事務所', pageType: '相談窓口案内（下越地区限定）' },
  { prefecture: '富山県', url: null, department: null, pageType: null },
  { prefecture: '石川県', url: null, department: null, pageType: null },
  { prefecture: '福井県', url: null, department: null, pageType: null },
  { prefecture: '山梨県', url: 'https://www.pref.yamanashi.jp/tokushi-jiseishien/jidouseitoshien/ijime_hutoko_soudan/gakkohutekiotaisaku.html', department: '山梨県（県事業）', pageType: 'イベント案内（保護者セミナー）' },
  { prefecture: '長野県', url: 'https://www.pref.nagano.lg.jp/kyoiku/kyoiku/shido/sodan/sodan.html', department: '長野県教育委員会事務局心の支援課', pageType: '相談窓口一覧' },
  { prefecture: '岐阜県', url: 'https://www.pref.gifu.lg.jp/kensei/ken-gaiyo/soshiki-annai/kyoiku-iinkai/gakko-anzen/kyouikusoudannsiryou.html', department: '岐阜県教育委員会 学校安全課教育相談係', pageType: '相談窓口一覧' },
  { prefecture: '静岡県', url: 'https://www.pref.shizuoka.jp/kodomokyoiku/kyoiku/futokoshien/hogosha/index.html', department: '静岡県（不登校支援ポータル内）', pageType: '総合情報サイト' },
  { prefecture: '愛知県', url: 'https://www.pref.aichi.jp/soshiki/gimukyoiku/soudan.html', department: '愛知県教育委員会 義務教育課', pageType: '相談窓口一覧' },
  { prefecture: '三重県', url: 'https://www.pref.mie.lg.jp/TOPICS/m0045700159.htm', department: '生徒指導課 不登校支援班', pageType: 'イベント案内（保護者相談会。年度ごとにURLが変わる可能性あり）' },
  { prefecture: '滋賀県', url: 'https://www.pref.shiga.lg.jp/ippan/kosodatekyouiku/kosodate/341751.html', department: '子ども若者部 子どもの育ち学び支援課', pageType: '総合情報サイト' },
  { prefecture: '京都府', url: null, department: null, pageType: null },
  { prefecture: '大阪府', url: 'https://www.pref.osaka.lg.jp/kyoikusomu/handbook/kyoiku_soudan.html', department: '大阪府教育センター', pageType: '相談窓口一覧' },
  { prefecture: '兵庫県', url: 'https://web.pref.hyogo.lg.jp/kk16/ac12_000000037.html', department: '県民生活部 男女青少年課', pageType: '相談窓口一覧（施設紹介含む）' },
  { prefecture: '奈良県', url: null, department: null, pageType: null },
  { prefecture: '和歌山県', url: 'https://www.pref.wakayama.lg.jp/prefg/501200/counter.html', department: '和歌山県教育委員会 教育支援課', pageType: '相談窓口一覧' },
  { prefecture: '鳥取県', url: 'https://www.pref.tottori.lg.jp/shiensoudan/', department: '生徒支援・教育相談センター', pageType: '総合情報・相談窓口ポータル' },
  { prefecture: '島根県', url: 'https://www.pref.shimane.lg.jp/education/kyoiku/anzen/ijime/nayami.html', department: '学校教育課', pageType: '相談窓口一覧' },
  { prefecture: '岡山県', url: 'https://www.pref.okayama.jp/site/16/706348.html', department: '岡山県教育庁 人権教育・生徒指導課', pageType: '相談窓口一覧' },
  { prefecture: '広島県', url: 'https://www.pref.hiroshima.lg.jp/site/kyouiku17/soudanmadoguchi.html', department: '個別最適な学び担当', pageType: '相談窓口一覧' },
  { prefecture: '山口県', url: null, department: null, pageType: null },
  { prefecture: '徳島県', url: null, department: null, pageType: null },
  { prefecture: '香川県', url: null, department: null, pageType: null },
  { prefecture: '愛媛県', url: null, department: null, pageType: null },
  { prefecture: '高知県', url: null, department: null, pageType: null },
  { prefecture: '福岡県', url: 'https://www.pref.fukuoka.lg.jp/site/kyouiku/chiikisougagkari-futoukou-sienn.html', department: '福岡県教育委員会', pageType: '総合情報（事業紹介）' },
  { prefecture: '佐賀県', url: null, department: null, pageType: null },
  { prefecture: '長崎県', url: null, department: null, pageType: null },
  { prefecture: '熊本県', url: 'https://www.pref.kumamoto.jp/soshiki/132/', department: '学校安全・安心推進課', pageType: '部署概要ページ（不登校支援は一部のみ）' },
  { prefecture: '大分県', url: null, department: null, pageType: null },
  { prefecture: '宮崎県', url: null, department: null, pageType: null },
  { prefecture: '鹿児島県', url: 'https://www.pref.kagoshima.jp/ba05/guide.html', department: '教育庁高校教育課', pageType: '総合情報（不登校支援ガイド）' },
  { prefecture: '沖縄県', url: null, department: null, pageType: null },
];
