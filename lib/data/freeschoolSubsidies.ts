// フリースクール等の民間施設を利用する家庭向けの「利用料助成・補助金」制度。
//
// 文部科学省の全国統一制度ではなく、都道府県または市区町村が独自に実施しているため、
// フリースクール本体のデータ（freeSchools.ts）と同じく実施状況が地域ごとにバラバラで、
// 全国の自治体（約1,700）を網羅的に調査したものではない（2026年10月、都道府県単位＋
// 政令指定都市・主要市を中心にWeb検索で確認できたものを収集。2026年11月に全国6地域に
// 分けて追加調査を実施し、関東・中部・関西・九州沖縄で新たに確認できた制度を追加。
// 北海道・東北、中国・四国の両地域は、今回の調査では家庭向け制度を確認できなかった）。
//
// 2026年11月2日、ユーザーから「全自治体(約1,700)を網羅してほしい」との依頼を受け、
// 47都道府県を7地域（北海道・東北／関東／中部／近畿／中国／四国／九州・沖縄）に分けて
// 再調査を実施。市区町村を1件ずつ検索する完全な網羅は検索回数の制約上不可能だったため、
// 都道府県単位＋政令指定都市・県庁所在地・中核市を中心とした深掘り調査とした。
// 新たに確認できたのは4件（東京都板橋区・群馬県前橋市・神奈川県海老名市・山梨県大月市）。
// 群馬県・埼玉県・石川県・福井県・岐阜県・静岡県・京都府・大阪府・奈良県・島根県・広島県・
// 山口県・徳島県・香川県・高知県・福岡県・佐賀県・長崎県・宮崎県・鹿児島県は、今回の
// 再調査でも家庭向け利用料助成制度を発見できなかった（「制度が無い」と確定したわけでは
// なく、公開情報からは見つからなかったということ）。
// なお、兵庫県加東市（調査時点で予算計上段階・未施行の可能性）、山形県（県→市町村の
// 間接補助の仕組みの存在は資料で確認できたが、実施している具体的な市町村名が未確認）
// は、裏付けが取れなかったため追加していない。
//
// 2026年11月2日、同日中に続けて「20県の未確認分をさらに深掘りしてほしい」との依頼を
// 受け、2段階の追加調査を実施。1段目は上記20県の中規模市まで範囲を広げての個別検索
// （6グループに分割）、2段目は検索戦略を変更し、都道府県が市町村の実施状況をまとめた
// 資料・2025〜2026年の新設ニュース・議会請願の採択状況を軸に再調査（4グループに分割）。
// この結果、京都府亀岡市（公式PDFで確認）と、大分県別府市・日田市（当初は二次情報の
// みだったが、今回両市の公式ページで直接確認でき、日田市の補助上限額の資料間の相違も
// 「月15,000円が正しい」と確定）の3件を追加した。
// 一方、群馬県・埼玉県・石川県・福井県・岐阜県・静岡県・大阪府・奈良県・島根県・広島県・
// 山口県・徳島県・香川県・高知県・福岡県・佐賀県・長崎県・宮崎県・鹿児島県は、中規模市
// まで範囲を広げ、検索戦略を変えても家庭向け利用料助成制度を発見できなかった（広島県
// 三原市は令和7年3月時点で「制度の必要性を研究する」という回答止まりで、具体的な制度化
// には至っていないことを確認）。鹿児島県教育委員会が作成した市町別の対応状況一覧
// （https://www.pref.kagoshima.jp/ae08/documents/123872_20251017193801-1.pdf）は
// 画像PDFでテキスト抽出ができず、内容未確認のまま残っている（次回調査の有力な手がかり）。
//
// 掲載が無い都道府県・市区町村でも、個別の制度が存在する可能性があるため、お住まいの
// 市区町村教育委員会に直接確認することを勧める文言をページ側で表示する。
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
    prefecture: '長野県',
    entity: '中野市',
    entityLevel: 'city',
    name: '中野市信州型フリースクール認証施設利用料助成金',
    summary: '市内在住で、長野県の「信州型フリースクール認証制度」で認証を受けたフリースクールを利用する児童生徒の保護者向け。月ごとの利用料の2分の1と10,000円のうち少ない方を助成（例：月5,000円なら2,500円、月25,000円なら10,000円）。',
    sourceUrl: 'https://www.city.nakano.nagano.jp/docs/2024080900027/',
    note: '中野市独自の制度で、長野県全体の制度ではありません（長野市と同様、県は施設向けの認証制度のみ）。申請はフリースクール経由または教育委員会学校教育課に直接、利用料を支払った年度の3月31日までに行う。',
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
  {
    prefecture: '和歌山県',
    entity: '和歌山県',
    entityLevel: 'prefecture',
    name: 'フリースクール等に通う不登校児童生徒支援調査研究事業（不登校調査協力金）',
    summary: '県内公立小・中学校等に在籍し不登校状態でフリースクール等（週3日以上・平日日中に相談支援を行う等の要件を満たす施設）に通う児童生徒の保護者向け。調査への協力金として月1万円、年度最大7万円が支払われる。',
    sourceUrl: 'https://www.pref.wakayama.lg.jp/prefg/501200/d00222083.html',
    note: '制度上は「フリースクール利用料の補助」ではなく、県の調査（通所状況等の回答）への協力に対する「調査協力金」という位置づけ。利用施設が通所日数等の要件を満たしていること、在籍校・市町村教育委員会と連携できることなどの条件がある。令和8年度時点で実施中（期ごとの申請受付制）。',
  },
  // 以下、2026年11月追加分（北海道・東北／中国・四国は家庭向け制度が確認できず0件。
  // 関東・中部・関西・九州沖縄で新たに確認できたもののみ追加）
  {
    prefecture: '東京都',
    entity: '荒川区',
    entityLevel: 'city',
    name: '荒川区フリースクール等利用児童生徒支援補助金',
    summary: '区立小中学校に在籍し区内に住所を有する不登校児童生徒の保護者向け。申請前1年間で概ね30日以上欠席し、月1回以上在籍校の授業時間内にフリースクール等へ通所していること等が条件。月額上限2万円。',
    sourceUrl: 'https://www.city.arakawa.tokyo.jp/documents/37145/01youkou.pdf',
    note: '東京都の助成金（既存掲載）とは別の荒川区独自制度。',
  },
  {
    prefecture: '東京都',
    entity: '港区',
    entityLevel: 'city',
    name: '港区フリースクール等利用料助成金',
    summary: '東京都の助成金の交付決定を受けている港区内在住の不登校児童生徒の保護者向け。月額利用料の2分の1から都助成金の月額上限額を差し引いた額を区がさらに助成（区の上限は月額2万円）。',
    sourceUrl: 'https://www.city.minato.tokyo.jp/kyouikushien/minatofs.html',
    note: '都の助成金の交付決定を受けていることが前提条件（都助成への上乗せ）。',
  },
  {
    prefecture: '東京都',
    entity: '品川区',
    entityLevel: 'city',
    name: '品川区フリースクール等利用料助成金',
    summary: '東京都の助成金の交付決定を受けた品川区立学校在籍児童生徒の保護者向け。利用料から都助成金を差し引いた額を区がさらに助成（合計の上限は児童生徒1人につき月額2万円）。',
    sourceUrl: 'https://www.city.shinagawa.tokyo.jp/PC/kuseizyoho/kuseizyoho-siryo/kuseizyoho-siryo-reiki/kuseizyoho-siryo-reiki-yoko/kuseizyoho-siryo-reiki-yoko-kyoiku/freeschoolyoukou.pdf',
    note: '都の助成金の交付決定を受けていることが前提条件（都助成への上乗せ）。',
  },
  {
    prefecture: '神奈川県',
    entity: '藤沢市',
    entityLevel: 'city',
    name: '藤沢市フリースクール等利用児童生徒支援事業補助金',
    summary: '市内在住の不登校児童生徒の保護者向け。市登録フリースクールへ月1回以上の利用が条件で、利用料等を月額上限1万円まで補助。',
    sourceUrl: 'https://www.city.fujisawa.kanagawa.jp/documents/35903/tirasi.pdf',
    note: '入会金・交通費等は対象外。',
  },
  {
    prefecture: '神奈川県',
    entity: '相模原市',
    entityLevel: 'city',
    name: '相模原市フリースクール等利用児童生徒支援事業補助金',
    summary: '市内在住の不登校児童生徒の保護者向け。市登録フリースクールへ月1回以上の利用が条件で、利用料・実習費・教材費等を月額上限2万円まで補助。',
    sourceUrl: 'https://www.city.sagamihara.kanagawa.jp/_res/projects/default_project/_page_/001/033/578/tebiki.pdf',
    note: '',
  },
  {
    prefecture: '神奈川県',
    entity: '葉山町',
    entityLevel: 'city',
    name: '葉山町フリースクール等利用者支援補助金',
    summary: '町立小中学校在籍の不登校児童生徒の保護者向け。町が認定したフリースクール等への通所が条件で、利用料等の2分の1（月額上限15,000円）を補助。',
    sourceUrl: 'https://www.town.hayama.lg.jp/material/files/group/22/hogosya1.pdf',
    note: '年度ごとの申請が必要。',
  },
  {
    prefecture: '神奈川県',
    entity: '二宮町',
    entityLevel: 'city',
    name: '二宮町フリースクール等利用児童生徒支援事業補助金',
    summary: '町立小中学校在籍の不登校児童生徒の保護者向け。直近1年でおおむね30日以上欠席、月1回以上利用が条件で、利用料の3分の2または月額15,000円のいずれか低い額を補助。',
    sourceUrl: 'https://www.town.ninomiya.kanagawa.jp/cmsfiles/contents/0000003/3387/youkou.pdf',
    note: '',
  },
  {
    prefecture: '新潟県',
    entity: '上越市',
    entityLevel: 'city',
    name: '上越市フリースクール等利用支援補助金',
    summary: '市内在住の小中学生の保護者で、生活保護世帯または市町村民税所得割合計50万7,000円未満の世帯が対象。教育委員会が出席扱いと認める施設の利用で、対象経費（入学費・入寮費・学習費・寮費等）の2分の1を補助（学習費は月額上限2万円、中学生2.25万円など区分ごとに設定）。',
    sourceUrl: 'https://www.city.joetsu.niigata.jp/uploaded/attachment/265002.pdf',
    note: '所得制限あり。新潟県・新潟市レベルの家庭向け制度は確認できず、上越市のみ確認。',
  },
  {
    prefecture: '滋賀県',
    entity: '大津市',
    entityLevel: 'city',
    name: '大津市フリースクール等民間施設利用者支援補助金',
    summary: '大津市内在住で、申請前1か月以内に在籍校の学級活動参加が7日未満、校長がフリースクール等の利用を出席扱いと認めている不登校児童生徒の保護者向け。月額利用料の2分の1または10,000円のうち低い方を利用月ごとに算定し年度内で合算。',
    sourceUrl: 'https://www.city.otsu.lg.jp/material/files/group/58/R8youkou.pdf',
    note: '入会金・交通費・教材費・体験利用費は対象外。守山市（既存掲載）とは別の大津市独自制度。',
  },
  {
    prefecture: '滋賀県',
    entity: '草津市',
    entityLevel: 'city',
    name: '草津市フリースクール利用児童生徒支援補助金事業',
    summary: '認定フリースクール利用児童生徒の保護者向け。補助額は利用料の2分の1（標準）、就学援助受給世帯は4分の3、生活保護受給世帯は全額。月額上限40,000円。',
    sourceUrl: 'https://www.pref.shiga.lg.jp/file/attachment/5502721.pdf',
    note: '確認できたのは草津市の事業を紹介する滋賀県の会議資料で、草津市自身の公式要綱は未確認。申請前に草津市教育委員会への確認を推奨。オンライン施設は本資料時点では対象外（検討中）とされていた。',
  },
  {
    prefecture: '兵庫県',
    entity: '加西市',
    entityLevel: 'city',
    name: '加西市民間フリースクール等利用支援補助制度',
    summary: '加西市内在住・市立小中学校在籍で、フリースクール等利用が指導要録上出席扱いとされている児童生徒の保護者向け。他自治体からの同種補助なし・市税滞納なしが条件で、月ごとの対象経費（授業料・施設利用料）の2分の1と10,000円のうち低い方を補助。',
    sourceUrl: 'https://www.city.kasai.hyogo.jp/uploaded/attachment/33257.pdf',
    note: '',
  },
  {
    prefecture: '兵庫県',
    entity: '尼崎市',
    entityLevel: 'city',
    name: 'フリースクール等利用支援補助金',
    summary: '尼崎市内居住の不登校小中学生で、市教育委員会認定のフリースクール等を利用している保護者向け。他自治体から同種補助を受けていないこと等が条件で、利用料総額の2分の1（1人につき月額上限1万円）を補助。',
    sourceUrl: 'https://www.city.amagasaki.hyogo.jp/_res/projects/default_project/_page_/001/039/032/02bosyuyoko.pdf',
    note: '入会金・体験利用料は対象外。確認できたのは令和7年度版の要綱。期別の申請期間が設定されている。',
  },
  {
    prefecture: '兵庫県',
    entity: '三木市',
    entityLevel: 'city',
    name: '三木市フリースクール等利用支援補助金',
    summary: '三木市内在住で、市内小中学校・特別支援学校在籍、校長が出席扱いと認定、申請日前1年以内に概ね30日以上登校していない等の条件を満たす不登校児童生徒の保護者向け。対象経費（利用料）の2分の1（月額上限1万円）を補助。',
    sourceUrl: 'https://www.city.miki.lg.jp/uploaded/life/93967_267545_misc.pdf',
    note: '入会金・体験利用料は対象外。前期・後期で申請期間が分かれている。',
  },
  {
    prefecture: '兵庫県',
    entity: '豊岡市',
    entityLevel: 'city',
    name: '豊岡市フリースクール等利用料補助制度',
    summary: '豊岡市立小中・義務教育学校在籍かつ市内居住、過去1年間に概ね30日以上欠席、校長が出席扱い可と判断、月1回以上通所などの条件を満たす保護者向け。対象経費の2分の1（月額上限1万円）を補助。',
    sourceUrl: 'https://www.city.toyooka.lg.jp/_res/projects/default_project/_page_/001/033/376/chirashi.pdf',
    note: '2025年度新設。国・県・他自治体からの同種補助がないことが条件。',
  },
  {
    prefecture: '沖縄県',
    entity: '沖縄県',
    entityLevel: 'prefecture',
    name: '沖縄県フリースクール等通学費支援（高校生バス通学費等支援事業の一部）',
    summary: '在籍校が出席扱いとするフリースクールに通う中学生・高校生で、世帯が県民税・市町村民税非課税、児童扶養手当受給、ひとり親医療費助成受給、または急激な収入減少のいずれかに該当する場合、バス・モノレールの通学用ICカードを支給。',
    sourceUrl: 'https://www.pref.okinawa.jp/kyoiku/edu/1008819/1008843/1025153/1017916.html',
    note: '利用料そのものではなく通学費（交通費）が対象の制度。熊本県・栃木県の既存掲載制度と同種のスキーム。',
  },
  // 以下、2026年11月2日追加分（全国7地域の再調査で新たに確認できたもののみ）
  {
    prefecture: '東京都',
    entity: '板橋区',
    entityLevel: 'city',
    name: '板橋区フリースクール等利用料助成金',
    summary: '東京都の助成金の交付決定を受けた板橋区内在住の不登校児童・生徒の保護者向け。保護者が負担した利用料から都助成額等を差し引いた額を区が上乗せ助成する。児童・生徒1人につき月額2万円が上限（都助成と合算して月2万円）。',
    sourceUrl: 'https://www.city.itabashi.tokyo.jp/kyoikuiinkai/torikumi/1063309/1064106.html',
    note: '都の助成金の交付決定を受けていることが前提条件（都助成への上乗せ）。入会金・教材費など利用料以外の費用は対象外。令和8年度分は申請開始前の予定として案内されている時点の情報。',
  },
  {
    prefecture: '群馬県',
    entity: '前橋市',
    entityLevel: 'city',
    name: '前橋市不登校児童生徒等支援施設通所交通費補助金',
    summary: '前橋市在住（または区域外就学が認められた市外在住）で生活保護または就学援助を受けている不登校児童生徒の保護者向け。教育支援教室・群馬県フリースクール等支援事業補助金採択施設等への通所にかかる交通費の一部を補助。月額上限1万円。',
    sourceUrl: 'https://www.city.maebashi.gunma.jp/material/files/group/96/osirase.pdf',
    note: '利用料ではなく交通費のみが対象。直線距離1kmあたり50円（1日上限500円）で算定。要保護・準要保護世帯が対象で、全世帯対象ではない。',
  },
  {
    prefecture: '神奈川県',
    entity: '海老名市',
    entityLevel: 'city',
    name: '海老名市フリースクール利用児童生徒支援補助金',
    summary: '神奈川県の「フリースクール等に通う子どもへの支援（市町村による取組を支援）」事業の実施市町村として、神奈川県公式サイトに相模原市・鎌倉市・藤沢市・葉山町・二宮町と並んで掲載されている。他の実施市町村と同様、フリースクール等の利用料の一部を保護者等に補助する制度と見られる。',
    sourceUrl: 'https://www.pref.kanagawa.jp/docs/t7e/freeschool/2025freeschool.html',
    note: '海老名市自身の要綱・案内ページ（補助率・月額上限等の具体的な金額）は今回未確認。申請前に海老名市教育委員会への確認を推奨。',
  },
  {
    prefecture: '山梨県',
    entity: '大月市',
    entityLevel: 'city',
    name: 'フリースクール等利用料助成事業',
    summary: '市内に住所を有する小中学生の保護者で、在籍している学校に通えず就学援助を受けており、在籍校が出席扱いとすることを認めているフリースクール等に通っている（又は通う予定の）児童生徒が対象。補助上限は月額3万円。',
    sourceUrl: 'https://www.smart-hojokin.jp/subsidies/78005',
    note: '確認できたのは補助金情報アグリゲーターサイトの掲載内容で、大月市自身の公式要綱・ページは今回未確認。山梨県の既存掲載制度（山梨県フリースクール利用支援事業費補助金、市町村を通じて補助する仕組み）の大月市における実施例と見られる。申請前に大月市教育委員会への確認を推奨。',
  },
  // 以下、2026年11月2日の追加調査（都道府県・主要市への絞り込み戦略の変更：県の市町村取組
  // 一覧資料・2025〜2026年の新設ニュース・請願の採択状況を軸に再調査）で新たに確認できたもの。
  {
    prefecture: '京都府',
    entity: '亀岡市',
    entityLevel: 'city',
    name: '亀岡市まなびの機会サポート事業補助金',
    summary: '市立小中学校・義務教育学校に在籍し市内に住民票がある不登校児童生徒の保護者等向け。フリースクール利用に係る授業料の一部を補助。補助額は児童生徒1人あたり月額1万円と実際に支払った授業料の少ない方。在籍校がフリースクールでの学習を出席扱いと認めていること等が条件。',
    sourceUrl: 'https://www.city.kameoka.kyoto.jp/uploaded/attachment/31276.pdf',
    note: '対象経費は授業料のみ（入会金は対象外と見られる）。令和5年4月1日から適用。',
  },
  {
    prefecture: '大分県',
    entity: '別府市',
    entityLevel: 'city',
    name: 'フリースクール等利用児童生徒支援補助金',
    summary: '別府市立小中学校に在籍する不登校児童生徒の保護者向け。フリースクール等の利用料（入会金・施設整備費等を除く）の4分の3を補助、月額上限3万円。生活保護または就学援助の受給世帯は補助率10分の10（全額）。',
    sourceUrl: 'https://www.city.beppu.oita.jp/gakusyuu/gakkou/freeschool.html',
    note: '',
  },
  {
    prefecture: '大分県',
    entity: '日田市',
    entityLevel: 'city',
    name: 'フリースクール利用料補助金',
    summary: '日田市立小中学校に在籍する不登校児童生徒の保護者向け。フリースクールの利用料に相当する経費（入会金・交通費・教材費・実習費等は除く）を補助。生活保護または就学援助の受給世帯は補助率10分の10（全額、月額上限3万円）、それ以外の世帯は補助率2分の1（月額上限15,000円）。',
    sourceUrl: 'https://www.city.hita.oita.jp/site/kosodate/1324.html',
    note: '大分県総合教育会議の資料（2026年10月）では「利用料の1/2、上限月1万円」と簡略化されて記載されていたが、市公式ページで確認した結果、世帯区分により補助率・上限額が異なり、標準世帯の上限は正しくは月15,000円（生活保護・就学援助世帯は全額・月3万円上限）。',
  },
];

export function getFreeschoolSubsidiesByPrefecture(prefecture: string): FreeschoolSubsidy[] {
  return FREESCHOOL_SUBSIDIES.filter((s) => s.prefecture === prefecture);
}
