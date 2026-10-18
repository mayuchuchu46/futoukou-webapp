// フリースクール等の民間施設を利用する家庭向けの「利用料助成・補助金」制度。
//
// 文部科学省の全国統一制度ではなく、都道府県または市区町村が独自に実施しているため、
// フリースクール本体のデータ（freeSchools.ts）と同じく実施状況が地域ごとにバラバラで、
// 全国の自治体（約1,700）を網羅的に調査したものではない（2026年10月、都道府県単位＋
// 政令指定都市・主要市を中心にWeb検索で確認できたものを収集）。掲載が無い都道府県・
// 市区町村でも、個別の制度が存在する可能性があるため、お住まいの市区町村教育委員会に
// 直接確認することを勧める文言をページ側で表示する。
//
// 「施設の運営者（フリースクール事業者）向け」の運営費補助金（例：福岡県・群馬県・
// 静岡県などで確認）は、このデータの対象外（家庭が直接受け取る利用料助成のみ）。
// 栃木県・熊本県の制度は、利用料そのものではなく交通費・実費が対象のため、
// その旨をnoteに明記している。
export type FreeschoolSubsidy = {
  prefecture: string; // 都道府県（絞り込み用）
  entity: string; // 実施主体（都道府県名、または市区町村名）
  entityLevel: 'prefecture' | 'city'; // 都道府県単位の制度か、特定の市区町村のみの制度か
  name: string;
  summary: string; // 対象者・助成内容の要約
  sourceUrl: string;
  note: string; // 利用料以外が対象、最新年度未確認等の注記（無ければ空文字）
};

export const FREESCHOOL_SUBSIDIES: FreeschoolSubsidy[] = [
  {
    prefecture: '東京都',
    entity: '東京都',
    entityLevel: 'prefecture',
    name: 'フリースクール等利用者支援事業',
    summary: '不登校の小・中学生がフリースクール等に通所する保護者向け。利用料に対し月額上限2万円を助成（入会金・施設維持費・教材費等は対象外、利用実績を都に報告のうえ支給）。',
    sourceUrl: 'https://www.metro.tokyo.lg.jp/information/press/2026/04/2026042720',
    note: '',
  },
  {
    prefecture: '茨城県',
    entity: '茨城県',
    entityLevel: 'prefecture',
    name: '茨城県フリースクール連携推進事業（授業料等補助）',
    summary: '住民税非課税・要保護・準要保護等の経済的事情がある世帯向け。県の補助対象フリースクールの利用で、保護者負担額の2分の1以内、月額上限15,000円・年額上限180,000円。',
    sourceUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/06/youryou2023.pdf',
    note: '確認できたのは令和5年度版の要綱。最新年度（令和8年度）の内容・金額は未確認のため、申請前に県教育庁義務教育課へご確認ください。',
  },
  {
    prefecture: '栃木県',
    entity: '栃木県',
    entityLevel: 'prefecture',
    name: '教育支援センター・フリースクール等利用児童生徒への支援',
    summary: '出席扱い認定を受け、就学援助認定または住民税非課税の世帯向け。交通費・体験活動等の実費が対象、月額上限10,000円。',
    sourceUrl: 'https://www.pref.tochigi.lg.jp/m03/documents/20261007144013.pdf',
    note: '利用料そのものではなく、交通費・実費が対象の制度です。',
  },
  {
    prefecture: '千葉県',
    entity: '千葉市',
    entityLevel: 'city',
    name: '千葉市フリースクール等民間施設利用料助成事業',
    summary: '千葉市立学校に在籍し、登録民間施設の利用で出席扱い認定を受けた児童生徒の保護者向け。年額上限60,000円（月のクーポン利用上限10,000円）。',
    sourceUrl: 'https://www.city.chiba.jp/kyoiku/gakkokyoiku/kyoikushien/freeschoolkupon/freeschoolkupon_top.html',
    note: '千葉市独自の制度で、千葉県全体の制度ではありません。',
  },
  {
    prefecture: '神奈川県',
    entity: '鎌倉市',
    entityLevel: 'city',
    name: '鎌倉市フリースクール等利用児童生徒支援補助金',
    summary: '市認定施設に在籍する不登校児童生徒の保護者向け。利用料等（税抜）の3分の1、月額上限10,000円。',
    sourceUrl: 'https://www.city.kamakura.kanagawa.jp/seisyo/documents/060401youkou.pdf',
    note: '鎌倉市独自の制度で、神奈川県全体の制度ではありません。',
  },
  {
    prefecture: '岩手県',
    entity: '宮古市',
    entityLevel: 'city',
    name: '宮古市フリースクール等利用児童生徒支援補助金',
    summary: '不登校状態でフリースクール等に在籍する児童生徒の保護者向け。支払った利用料（入学料・保険料等は除く）が対象（他団体の助成がある場合は差引）。',
    sourceUrl: 'https://www.city.miyako.iwate.jp/material/files/group/37/freeschoolhojyokintirashi.pdf',
    note: '宮古市独自の制度で、岩手県全体の制度ではありません。',
  },
  {
    prefecture: '富山県',
    entity: '富山県',
    entityLevel: 'prefecture',
    name: '富山県フリースクール等通所児童生徒支援事業補助金',
    summary: '県ガイドライン適合施設に通所し、在籍校長が「出席扱い」と認定した児童生徒の保護者向け。対象経費の2分の1以内、月額上限15,000円。',
    sourceUrl: 'https://www.pref.toyama.jp/documents/46498/1youkou.pdf',
    note: '',
  },
  {
    prefecture: '山梨県',
    entity: '山梨県',
    entityLevel: 'prefecture',
    name: '山梨県フリースクール利用支援事業費補助金',
    summary: '生活困窮・ひとり親・多子世帯のいずれかに該当する世帯向け（市町村を通じて補助）。対象経費の2分の1以内、月額上限15,000円。',
    sourceUrl: 'https://www.pref.yamanashi.jp/documents/126651/kouhuyoukou.pdf',
    note: '',
  },
  {
    prefecture: '三重県',
    entity: '三重県',
    entityLevel: 'prefecture',
    name: 'フリースクール利用料補助金（令和8年度）',
    summary: '生活保護・就学援助・非課税・児童扶養手当のいずれかに該当し、県の対象フリースクール一覧（22施設）を利用する保護者向け。利用料の2分の1、月額上限15,000円。',
    sourceUrl: 'https://www.pref.mie.lg.jp/TOPICS/m0045700158.htm',
    note: '対象は県が指定した一覧の施設に限られます。',
  },
  {
    prefecture: '滋賀県',
    entity: '守山市',
    entityLevel: 'city',
    name: '守山市フリースクール等利用児童生徒支援助成金',
    summary: '市内居住・年間概ね30日以上欠席・市認定施設の利用が条件。月額上限4万円を基準に、生活保護世帯は10/10、就学援助世帯は3/4、その他は1/2を助成。',
    sourceUrl: 'https://www.city.moriyama.lg.jp/_res/projects/default_project/_page_/001/009/907/freeschoolchirashir7.pdf',
    note: '守山市独自の制度で、滋賀県全体の制度ではありません。',
  },
  {
    prefecture: '兵庫県',
    entity: '神戸市',
    entityLevel: 'city',
    name: '神戸市フリースクール等利用料助成',
    summary: '利用料の半額を助成。通所型は月額上限2万円、オンライン型は月額上限1万5千円。',
    sourceUrl: 'https://www.city.kobe.lg.jp/a33992/fsriyouryoujosei.html',
    note: '神戸市独自の制度で、兵庫県全体の制度ではありません。',
  },
  {
    prefecture: '愛知県',
    entity: '名古屋市',
    entityLevel: 'city',
    name: '名古屋市フリースクール等利用料補助金',
    summary: '市内在住・市立小中学校等在籍の不登校児童生徒の保護者向け。就学援助世帯等は2分の1（月額上限22,000円）、その他は4分の1（月額上限11,000円）。',
    sourceUrl: 'https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/046/944/08kouhuyoukou.pdf',
    note: '名古屋市独自の制度で、愛知県全体の制度ではありません。',
  },
  {
    prefecture: '長野県',
    entity: '長野市',
    entityLevel: 'city',
    name: '長野市フリースクール等民間施設利用料助成事業',
    summary: '市内居住・市指定施設の利用・長野市の就学援助受給が条件。対象経費の2分の1以内、年額上限156,000円。',
    sourceUrl: 'https://www.city.nagano.nagano.jp/n601000/contents/p006054.html',
    note: '長野市独自の制度で、長野県全体の制度ではありません（県は施設向けの認証制度のみ）。',
  },
  {
    prefecture: '鳥取県',
    entity: '鳥取市',
    entityLevel: 'city',
    name: 'フリースクール利用料助成事業補助金',
    summary: '県教育委員会が「出席扱いが考えられる」と通知した施設に通う児童生徒の保護者向け。授業料は月2万円または月額授業料の3分の2の低い方。交通費・実習費は小学生月3,000円、中学生月6,000円。',
    sourceUrl: 'https://www.city.tottori.lg.jp/www/contents/1190788717391/simple/freeschoolchirashi.pdf',
    note: '鳥取市独自の制度で、鳥取県全体の制度ではありません。',
  },
  {
    prefecture: '鳥取県',
    entity: '米子市',
    entityLevel: 'city',
    name: 'フリースクール利用料等補助金',
    summary: '義務教育段階の児童生徒の保護者向け（一部地域は対象外）。鳥取市とほぼ同内容（授業料は月2万円または3分の2の低い方、交通費等は小学生月3,000円・中学生月6,000円）。',
    sourceUrl: 'https://www.city.yonago.lg.jp/secure/47344/youkou.pdf',
    note: '米子市独自の制度で、鳥取県全体の制度ではありません。',
  },
  {
    prefecture: '熊本県',
    entity: '熊本県（熊本市除く）',
    entityLevel: 'prefecture',
    name: '不登校児童生徒に対する経済的支援推進事業補助金',
    summary: '民間施設・教育支援センターを利用し出席扱いとなっている就学援助世帯等向け。交通費・実習費等の個人負担実費の一部、前期・後期それぞれ上限2万円（年2回募集）。',
    sourceUrl: 'https://www.pref.kumamoto.jp/soshiki/132/238984.html',
    note: '熊本市は対象外。利用料そのものではなく、交通費・実費が対象の制度です。',
  },
  {
    prefecture: '岡山県',
    entity: '岡山市',
    entityLevel: 'city',
    name: '不登校児童生徒を支援する民間施設等利用支援補助金',
    summary: '市内居住・年間30日以上欠席・市登録施設の利用が条件。対象経費の2分の1以内、月額上限10,000円。',
    sourceUrl: 'https://www.city.okayama.jp/shisei/0000082520.html',
    note: '岡山市独自の制度で、岡山県全体の制度ではありません。',
  },
  {
    prefecture: '愛媛県',
    entity: '松山市',
    entityLevel: 'city',
    name: 'フリースクール等利用補助金',
    summary: '市立小中学校在籍・年間30日以上欠席の不登校児童生徒の保護者向け。教育委員会認定施設が対象で、対象経費の2分の1（1,000円未満切り捨て）と月額10,000円の低い方。',
    sourceUrl: 'https://www.city.matsuyama.ehime.jp/kurashi/kosodate/kyoikushien/kysogosodan/freeschool/freehozyo2026.files/hozyoyoukou.pdf',
    note: '松山市独自の制度で、愛媛県全体の制度ではありません。',
  },
];

export function getFreeschoolSubsidiesByPrefecture(prefecture: string): FreeschoolSubsidy[] {
  return FREESCHOOL_SUBSIDIES.filter((s) => s.prefecture === prefecture);
}
