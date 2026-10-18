// 全国どこからでも利用できる「オンラインフリースクール」。
//
// 都道府県別のFREE_SCHOOLS（lib/data/freeSchools.ts）は、施設が所在する都道府県で
// 絞り込んで探す形だが、オンライン完結型のフリースクールは居住地を問わず利用できるため、
// 都道府県の選択に関係なく常に案内できるよう、このファイルに分けて持つ。
//
// 前半5件は、京都市教育委員会が公開している「フリースクール等民間団体の情報提供シート」
// （https://www.city.kyoto.lg.jp/kyoiku/page/0000332077.html）で「オンライン」区分に
// 分類されている施設（2026年10月確認、掲載は令和8年4月1日現在）。同ページには
// 「要件を満たす団体すべてを網羅したものではない」「京都市教育委員会が団体を認証・
// あっせんするものではない」との注記がある。
//
// 後半のうちSOZOW SCHOOL、すららは政府・教育委員会の一覧には含まれておらず、
// 運営会社自身の公式サイト・プレスリリースで確認した情報。
//
// NIJINアカデミーは、旭川市公式サイトの「不登校児童生徒の支援団体一覧（フリースクール等）」
// （https://www.city.asahikawa.hokkaido.jp/kurashi/218/241/305/d082142.html 、2026年10月
// 確認、最終更新2026年10月9日）に、オンラインの学校として掲載されている（旭川市内の施設
// ではない）。同ページには「市の依頼に賛同した団体で、市内の全団体を網羅するものではない」
// との注記がある。
//
// aini schoolは政府・教育委員会の一覧には含まれておらず、運営会社（株式会社ロコタビ）の
// 公式サイトで確認した情報。
//
// sourceKindで出典の種類を区別する。
export type OnlineFreeSchool = {
  name: string;
  operator: string;
  ageRange: string;
  contact: string;
  url: string;
  note: string;
  sourceKind: 'government' | 'official-site';
  sourceUrl: string;
};

export const ONLINE_FREE_SCHOOLS: OnlineFreeSchool[] = [
  {
    name: 'クラスジャパン小中学園',
    operator: '一般社団法人クラスジャパンプロジェクト',
    ageRange: '小学1年生～高校3年生',
    contact: '03-5050-0485',
    url: 'https://www.cjgakuen.com/',
    note: 'オンライン上の教室で学習・交流する形式。出席扱い制度の活用支援も行っている。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/8_kurasujapan.pdf',
  },
  {
    name: 'N中等部 ネットコース',
    operator: '学校法人角川ドワンゴ学園',
    ageRange: '中学生',
    contact: '0120-025-215',
    url: 'https://n-jr.jp/',
    note: '通学キャンパス（N中等部）と同じ学校法人が運営するオンライン専用コース。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/8_ncyuutoubu.pdf',
  },
  {
    name: 'オンラインフリースクール シンガク',
    operator: '株式会社成基',
    ageRange: '小学4年生～中学3年生',
    contact: '0120-542-777',
    url: 'https://www.shingaku-fs.jp/',
    note: '学習塾を母体とするオンラインフリースクール。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/8_shingaku.pdf',
  },
  {
    name: 'オンラインフリースクール clulu（クルル）',
    operator: 'NPO法人キリンこども応援団',
    ageRange: '小学4年生～中学3年生',
    contact: '公式サイトの問い合わせフォームより',
    url: 'https://clulu.kirin-npo.com/',
    note: '大阪府泉佐野市の「フリースクールキリンのとびら」と同じ団体が運営するオンライン版。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/7_clulu.pdf',
  },
  {
    name: 'EMI高等学院・親子キャリアアカデミーちゃんぱす',
    operator: '運営者：山中恵美子（運営法人の記載なし）',
    ageRange: '小学1年生～高校3年生',
    contact: '0798-98-2848',
    url: 'https://emi-ko.jp/',
    note: '拠点は兵庫県西宮市だが、授業はオンライン中心。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/7_emi.pdf',
  },
  {
    name: 'NIJINアカデミー',
    operator: '株式会社NIJIN',
    ageRange: '小学1年生～小学5年生、中学1年生～中学3年生',
    contact: '070-4126-7703 / nijin.academy@gmail.com',
    url: 'https://www.nijin.co.jp/academy',
    note: 'メタバース（VR空間）上の「オンライン校舎」に通う形式。学習だけでなく子ども主体のイベント・サークル活動、専門スタッフによるメンタルサポートも行っている。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.asahikawa.hokkaido.jp/kurashi/218/241/305/d082142_d/fil/NIJIN.pdf',
  },
  {
    name: 'aini school（アイニースクール）',
    operator: '株式会社ロコタビ',
    ageRange: '小学1年生～中学3年生',
    contact: '公式サイトのLINE相談（平日10:00～17:00）または入学申込フォームより',
    url: 'https://ainischool.helloaini.com/',
    note: '学習支援だけでなく、心のケアや仲間づくりに重点を置くオンラインスクール。学校への出席扱いの実績があるとしている（公式サイトによれば2026年2月時点で97%）。政府・教育委員会の一覧には掲載されておらず、運営会社の公式サイトに基づく情報。',
    sourceKind: 'official-site',
    sourceUrl: 'https://ainischool.helloaini.com/',
  },
  {
    name: 'SOZOW SCHOOL 小中等部',
    operator: 'SOZOW株式会社',
    ageRange: '小学4年生～中学3年生（高等部は別途あり）',
    contact: '公式サイトの問い合わせフォームより',
    url: 'https://sozow-school.com/',
    note: 'プロジェクト型の学び・メタバースでの交流が特徴とされる。政府・教育委員会の一覧には掲載されておらず、運営会社の発表に基づく情報。',
    sourceKind: 'official-site',
    sourceUrl: 'https://resemom.jp/release/prtimes/20231012/105409.html',
  },
  {
    name: 'すらら',
    operator: '株式会社すららネット',
    ageRange: '小学生～高校生（無学年式）',
    contact: '公式サイトの問い合わせフォームより',
    url: 'https://surala.jp/',
    note: '厳密には「フリースクール」ではなく自宅学習用のAI教材で、学校の出席扱い制度の活用支援として使われることが多い。他の施設のような交流の場ではない点に注意。政府・教育委員会の一覧には掲載されておらず、運営会社の公式サイトに基づく情報。',
    sourceKind: 'official-site',
    sourceUrl: 'https://surala.jp/',
  },
];
