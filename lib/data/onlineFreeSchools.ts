// 全国どこからでも利用できる「オンラインフリースクール」。
//
// 都道府県別のFREE_SCHOOLS（lib/data/freeSchools.ts）は、施設が所在する都道府県で
// 絞り込んで探す形だが、オンライン完結型のフリースクールは居住地を問わず利用できるため、
// 都道府県の選択に関係なく常に案内できるよう、このファイルに分けて持つ。
//
// 各施設の出典は sourceKind / sourceUrl で個別に管理している。
//   sourceKind: 'government'    = 教育委員会・都道府県・市区町村が公開する一覧に
//                                 「オンライン」等として掲載されている施設
//   sourceKind: 'official-site' = 運営会社・団体自身の公式サイト／発表のみで確認した施設
//                                 （公的な一覧には掲載が確認できていない）
// どちらの場合も「教育委員会・学校等が認証・あっせんするものではない」点は変わらない。
// 2026年10月に複数回の調査を行い随時追加しているため、各施設のsourceUrlで個別に
// 確認日・出典を追えるようにしている（一覧全体としての「網羅率」は保証できない）。
// category: 件数が増えて一覧が見づらくなったため、UI側で見出し分けするための区分。
//   'community' = 仲間づくり・居場所の機能がある学校・スクールタイプ
//   'tutoring'  = 個別指導・家庭教師型（交流の場ではなく学習サポートが中心）
//   'referral'  = 自治体等からの紹介がないと利用できない（個人が直接申し込めない）
import type { SpecialtyTag } from './correspondenceHighSchools';

export type OnlineFreeSchool = {
  /** 公式サイトで確認できた専門コース・プログラム（無い＝未確認） */
  specialties?: { tag: SpecialtyTag; course: string; sourceUrl: string }[];
  // 1校ごとの紹介ページ（app/gakko/online/[no]/page.tsx、2026-10-21追加）用の連番。
  // 配列の並び順＝掲載順をそのまま番号にしているだけで、公的な整理番号等ではない。
  no: number;
  name: string;
  operator: string;
  ageRange: string;
  contact: string;
  url: string;
  note: string;
  sourceKind: 'government' | 'official-site';
  sourceUrl: string;
  category: 'community' | 'tutoring' | 'referral';
};

export const ONLINE_FREE_SCHOOLS: OnlineFreeSchool[] = [
  {
    no: 1,
    specialties: [{ tag: 'it', course: 'プログラミングクラス（ネット部活）', sourceUrl: 'https://www.cjgakuen.com/onlinehractivities' }, { tag: 'art', course: 'イラスト（ネット部活）', sourceUrl: 'https://www.cjgakuen.com/onlinehractivities' }],
    name: 'クラスジャパン小中学園',
    operator: '一般社団法人クラスジャパンプロジェクト',
    ageRange: '小学1年生～高校3年生',
    contact: '03-5050-0485',
    url: 'https://www.cjgakuen.com/',
    note: 'オンライン上の教室で学習・交流する形式。出席扱い制度の活用支援も行っている。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/8_kurasujapan.pdf',
    category: 'community',
  },
  {
    no: 2,
    specialties: [{ tag: 'it', course: '選択学習カリキュラム プログラミングコース', sourceUrl: 'https://n-jr.jp/select_curriculum/programming/' }],
    name: 'N中等部 ネットコース',
    operator: '学校法人角川ドワンゴ学園',
    ageRange: '中学生',
    contact: '0120-025-215',
    url: 'https://n-jr.jp/',
    note: '通学キャンパス（N中等部）と同じ学校法人が運営するオンライン専用コース。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/8_ncyuutoubu.pdf',
    category: 'community',
  },
  {
    no: 3,
    name: 'オンラインフリースクール シンガク',
    operator: '株式会社成基',
    ageRange: '小学4年生～中学3年生',
    contact: '0120-542-777',
    url: 'https://www.shingaku-fs.jp/',
    note: '学習塾を母体とするオンラインフリースクール。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/8_shingaku.pdf',
    category: 'community',
  },
  {
    no: 4,
    specialties: [{ tag: 'it', course: 'パソコン部（プログラム学習含む）', sourceUrl: 'https://clulu.kirin-npo.com/' }, { tag: 'art', course: 'お絵かき部', sourceUrl: 'https://clulu.kirin-npo.com/' }],
    name: 'オンラインフリースクール clulu（クルル）',
    operator: 'NPO法人キリンこども応援団',
    ageRange: '小学4年生～中学3年生',
    contact: '公式サイトの問い合わせフォームより',
    url: 'https://clulu.kirin-npo.com/',
    note: '大阪府泉佐野市の「フリースクールキリンのとびら」と同じ団体が運営するオンライン版。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/7_clulu.pdf',
    category: 'community',
  },
  {
    no: 5,
    specialties: [{ tag: 'it', course: '専門領域プログラム メタバースコース', sourceUrl: 'https://emi-ko.jp/course/metaverse/' }],
    name: 'EMI高等学院・親子キャリアアカデミーちゃんぱす',
    operator: '運営者：山中恵美子（運営法人の記載なし）',
    ageRange: '小学1年生～高校3年生',
    contact: '0798-98-2848',
    url: 'https://emi-ko.jp/',
    note: '拠点は兵庫県西宮市だが、授業はオンライン中心。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.kyoto.lg.jp/kyoiku/cmsfiles/contents/0000332/332077/7_emi.pdf',
    category: 'community',
  },
  {
    no: 6,
    name: 'NIJINアカデミー',
    operator: '株式会社NIJIN',
    ageRange: '小学1年生～小学5年生、中学1年生～中学3年生',
    contact: '070-4126-7703 / nijin.academy@gmail.com',
    url: 'https://www.nijin.co.jp/academy',
    note: 'メタバース（VR空間）上の「オンライン校舎」に通う形式。学習だけでなく子ども主体のイベント・サークル活動、専門スタッフによるメンタルサポートも行っている。',
    sourceKind: 'government',
    sourceUrl: 'https://www.city.asahikawa.hokkaido.jp/kurashi/218/241/305/d082142_d/fil/NIJIN.pdf',
    category: 'community',
  },
  {
    no: 7,
    name: 'aini school（アイニースクール）',
    operator: '株式会社ロコタビ',
    ageRange: '小学1年生～中学3年生',
    contact: '公式サイトのLINE相談（平日10:00～17:00）または入学申込フォームより',
    url: 'https://ainischool.helloaini.com/',
    note: '学習支援だけでなく、心のケアや仲間づくりに重点を置くオンラインスクール。学校への出席扱いの実績があるとしている（公式サイトによれば2026年2月時点で97%）。政府・教育委員会の一覧には掲載されておらず、運営会社の公式サイトに基づく情報。',
    sourceKind: 'official-site',
    sourceUrl: 'https://ainischool.helloaini.com/',
    category: 'community',
  },
  {
    no: 8,
    name: 'SOZOW SCHOOL 小中等部',
    operator: 'SOZOW株式会社',
    ageRange: '小学4年生～中学3年生（高等部は別途あり）',
    contact: '公式サイトの問い合わせフォームより',
    url: 'https://sozow-school.com/',
    note: 'プロジェクト型の学び・メタバースでの交流が特徴とされる。政府・教育委員会の一覧には掲載されておらず、運営会社の発表に基づく情報。',
    sourceKind: 'official-site',
    sourceUrl: 'https://resemom.jp/release/prtimes/20231012/105409.html',
    category: 'community',
  },
  {
    no: 9,
    specialties: [{ tag: 'it', course: '情報Ⅰ（プログラミング演習）', sourceUrl: 'https://surala.jp/school/lp/Informatics/' }],
    name: 'すらら',
    operator: '株式会社すららネット',
    ageRange: '小学生～高校生（無学年式）',
    contact: '公式サイトの問い合わせフォームより',
    url: 'https://surala.jp/',
    note: '厳密には「フリースクール」ではなく自宅学習用のAI教材で、学校の出席扱い制度の活用支援として使われることが多い。他の施設のような交流の場ではない点に注意。政府・教育委員会の一覧には掲載されておらず、運営会社の公式サイトに基づく情報。',
    sourceKind: 'official-site',
    sourceUrl: 'https://surala.jp/',
    category: 'tutoring',
  },
  {
    no: 10,
    name: 'オンラインフリースクール フォレストリンク',
    operator: '個人運営（代表：浜 直也）',
    ageRange: '小学1年生～中学3年生',
    contact: '080-5365-3387',
    url: 'https://www.pref.osaka.lg.jp/documents/35606/r8-2freeschool.pdf',
    note: 'Discord・マインクラフト等を使ったオンラインの居場所づくり。公式サイトが見つからなかったため、リンク先は大阪府の資料（出典）になる。年4回程度、実際に集まる機会もある。',
    sourceKind: 'government',
    sourceUrl: 'https://www.pref.osaka.lg.jp/documents/35606/r8-2freeschool.pdf',
    category: 'community',
  },
  {
    no: 11,
    name: 'For Everyone Study',
    operator: '個人運営（代表：植竹智央）',
    ageRange: '小学生・中学生・高校生',
    contact: '080-5682-2134 / fes-info@fes-project.com',
    url: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2025/06/freeschool.pdf',
    note: '学習支援・コミュニケーション支援・オンラインゲーム交流会等をオンラインで実施。所在地は茨城県石岡市だが活動はオンライン。公式サイトが見つからなかったため、リンク先は茨城県の資料（出典）になる。',
    sourceKind: 'government',
    sourceUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2025/06/freeschool.pdf',
    category: 'community',
  },
  {
    no: 12,
    specialties: [{ tag: 'music', course: '音楽部', sourceUrl: 'https://www.hello-halolab.org/' }, { tag: 'art', course: '工作・美術部', sourceUrl: 'https://www.hello-halolab.org/' }, { tag: 'food', course: 'お料理部', sourceUrl: 'https://www.hello-halolab.org/' }, { tag: 'sports', course: '運動部', sourceUrl: 'https://www.hello-halolab.org/' }],
    name: 'ハロハロラボ',
    operator: 'NPO法人ハロハロラボ',
    ageRange: '6歳～15歳（学習支援は6歳～12歳）',
    contact: 'Hello.halolab@gmail.com',
    url: 'https://www.hello-halolab.org/',
    note: 'ZOOM・Gather Townを使ったオンラインの居場所・学習支援団体（カリキュラム型の「学校」ではない点に注意）。インターネットがあれば全国どこからでも参加可能。',
    sourceKind: 'government',
    sourceUrl: 'https://www.pref.kanagawa.jp/docs/ch3/cnt/nposupport/npo/07_kinrin/haroharo.html',
    category: 'community',
  },
  {
    no: 13,
    name: 'トライ式中等部',
    operator: '株式会社トライグループ',
    ageRange: '小学5年生～中学3年生（出願時点で中学在学中であることが条件）',
    contact: '0120-919-439',
    url: 'https://www.try-gakuin.com/freeschool/',
    note: '対面・オンラインを選択できるほか、自宅訪問支援もある。学校長の判断で出席扱いとなる制度の活用支援を行っている（件数は非公開）。',
    sourceKind: 'official-site',
    sourceUrl: 'https://www.try-gakuin.com/freeschool/',
    category: 'community',
  },
  {
    no: 14,
    name: 'クラーク国際中等部',
    operator: 'クラーク記念国際高等学校と連携（運営法人名は公式サイトに明記なし）',
    ageRange: '小学6年生～中学3年生',
    contact: '公式サイトの問い合わせフォームより',
    url: 'https://clark-jr.jp/',
    note: 'オンラインキャンパス「FAMcampus」で全国から参加可能。学校教育法第一条の中学校ではないと公式サイトに明記されており、出席扱いになるかは在籍校の判断次第。',
    sourceKind: 'official-site',
    sourceUrl: 'https://clark-jr.jp/',
    category: 'community',
  },
  {
    no: 15,
    specialties: [{ tag: 'it', course: 'プログラミング講座（希望者オプション）', sourceUrl: 'https://www.daiichigakuin-jr.jp/support/programming/' }],
    name: '第一学院中等部',
    operator: 'ウィザスグループ',
    ageRange: '中学生年代（学年の明記なし）',
    contact: '0120-953-324',
    url: 'https://www.daiichigakuin-jr.jp/',
    note: '月1～4回程度の登校とオンラインの相談・学習を組み合わせる形式。「中学校の出席扱いも目指せる」としているが実績数値は非公開。',
    sourceKind: 'official-site',
    sourceUrl: 'https://www.daiichigakuin-jr.jp/',
    category: 'community',
  },
  {
    no: 16,
    name: 'キズキ共育塾',
    operator: '株式会社キズキ',
    ageRange: '小学生～社会人（オンライン校では中学生も対象）',
    contact: '0120-501-858',
    url: 'https://kizuki.or.jp/',
    note: '完全1対1の個別指導。不登校や発達特性による学び直し・受験サポートが中心で、オンライン授業は全国対応。',
    sourceKind: 'official-site',
    sourceUrl: 'https://kizuki.or.jp/',
    category: 'tutoring',
  },
  {
    no: 17,
    name: 'Branch（ブランチ）',
    operator: '運営会社名は公式サイトに明記なし（代表：中里祐次）',
    ageRange: '小学生～高校生',
    contact: '体験申込フォームまたは公式LINEより',
    url: 'https://branchkids.jp/',
    note: 'オンライン版「Branch home+」と東京都内の対面教室「Branch room」がある。東京都の不登校児童生徒向け利用料助成（月額上限2万円）の対象として案内されている。',
    sourceKind: 'official-site',
    sourceUrl: 'https://branchkids.jp/',
    category: 'community',
  },
  {
    no: 18,
    specialties: [{ tag: 'it', course: 'room-Kプログラム（プログラミング）', sourceUrl: 'https://futoko.katariba.online/' }, { tag: 'art', course: 'room-Kプログラム（イラスト・工作）', sourceUrl: 'https://futoko.katariba.online/' }],
    name: 'room-K',
    operator: 'NPO法人カタリバ',
    ageRange: '小学生・中学生（連携自治体の教育委員会・学校からの紹介が必要）',
    contact: '保護者はLINE「カタリバ相談チャット」（https://soudan.katariba.online/）から相談',
    url: 'https://futoko.katariba.online/',
    note: '自治体の教育委員会・学校から紹介を受けた児童生徒のみが対象で、個人が直接申し込むことはできない（2026年10月時点で新規連携自治体の募集も停止中）。利用できるかはお住まいの自治体がカタリバと連携しているかに左右される。',
    sourceKind: 'official-site',
    sourceUrl: 'https://futoko.katariba.online/',
    category: 'referral',
  },
  {
    no: 19,
    name: '家庭教師のユイロ（旧サイル学院）',
    operator: '運営会社名は公式サイトに明記なし（旧サイル学院中等部・高等部の運営は株式会社サイルビジネス学院）',
    ageRange: '小学生～大学生',
    contact: '050-5785-3250（平日9:00～17:00）',
    url: 'https://yuiro.org/',
    note: '以前は「サイル学院中等部・高等部」というオンライン通信制スクールだったが、sairu.schoolのドメインは現在このサービスに転送されており、家庭教師型の伴走サービスに形態が変わっている。教科学習ではなく生活・自己理解・進路選択を中心に支援し、「不登校・行き渋り・学校が合わない」家庭を対象とすると明記。フリースクールというより個別の家庭教師サービスに近い点に注意。',
    sourceKind: 'official-site',
    sourceUrl: 'https://yuiro.org/',
    category: 'tutoring',
  },
  {
    no: 20,
    name: 'ソウガク オンライン個別指導塾',
    operator: 'ソウガク合同会社',
    ageRange: '小学生・中学生（発達障害・グレーゾーンの子ども向け）',
    contact: 'support@sogaku.jp',
    url: 'https://sogaku-online.com/',
    note: '発達障害・グレーゾーンの小中学生向けオンライン個別指導塾（2023年10月開校）。完全1対1のマンツーマン指導で、診断名・診断書は不要。一般社団法人「発達凸凹アソシエーション」と連携した専門研修を受けた社会人講師が担当し、心理カウンセラーや学校教諭資格を持つ講師も在籍。専門家監修のアセスメントシートで子どもの特性を把握し、スモールステップで「できた！」を積み重ねる指導方針。集中力に課題がある子向けの25分・35分の短時間コースあり。授業の振替可能、講師変更無料。毎回の指導報告を専用アプリで保護者に共有。映像授業2,000本・ドリル10,000問以上を利用可能。不登校の子への対応あり（詳細は要問い合わせ）。居場所・交流の機能はなく学習指導が中心。無料体験授業あり。料金は小学生13,200円〜・中学生18,480円〜（月4回）、入塾金22,000円以下。',
    sourceKind: 'official-site',
    sourceUrl: 'https://resemom.jp/release/prtimes/20231116/107101.html',
    category: 'tutoring',
  },
  {
    no: 21,
    name: 'WIALIS（ウィアリス）オンラインフリースクール',
    operator: '株式会社WIALIS',
    ageRange: '中学生（小学校高学年は要相談）',
    contact: '相談フォームまたは公式LINEより',
    url: 'https://wialis.co.jp/',
    note: '3Dバーチャルキャンパスにアバターで登校する形式。教員免許を持つスタッフが在籍。出席扱いは「目指す」支援であり実績数値は非公開。',
    sourceKind: 'official-site',
    sourceUrl: 'https://wialis.co.jp/',
    category: 'community',
  },
];
