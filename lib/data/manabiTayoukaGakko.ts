// MEXT公表の「学びの多様化学校」（旧：不登校特例校）一覧データ。
// 出典: 文部科学省 https://www.mext.go.jp/a_menu/shotou/seitoshidou/1387004.htm
// 全国84校（令和8年時点の指定校一覧を元に作成）。手動更新が必要なため、
// 文科省の指定校追加があれば本ファイルを更新すること。
export type ManabiTayoukaGakko = {
  no: number;
  /** 設置形態：本校型・分校型・分教室型・コース指定型 */
  type: string;
  name: string;
  branchName: string | null;
  prefecture: string;
  city: string;
  /** 学校種：小学校・中学校・高等学校・小・中 */
  schoolType: string;
  publicPrivate: string;
  designatedYear: string;
};

export const MANABI_TAYOUKA_GAKKO: ManabiTayoukaGakko[] = [
  {
    "no": 1,
    "type": "本校型",
    "name": "八王子市立高尾山学園小学部・中学部",
    "branchName": null,
    "prefecture": "東京都",
    "city": "八王子市",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "平成16年"
  },
  {
    "no": 2,
    "type": "本校型",
    "name": "京都市立洛風中学校",
    "branchName": null,
    "prefecture": "京都府",
    "city": "京都市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "平成16年"
  },
  {
    "no": 3,
    "type": "本校型",
    "name": "星槎中学校",
    "branchName": null,
    "prefecture": "神奈川県",
    "city": "横浜市",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "平成17年"
  },
  {
    "no": 4,
    "type": "本校型",
    "name": "東京シューレ葛飾中学校",
    "branchName": null,
    "prefecture": "東京都",
    "city": "葛飾区",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "平成19年"
  },
  {
    "no": 5,
    "type": "本校型",
    "name": "京都市立洛友中学校",
    "branchName": null,
    "prefecture": "京都府",
    "city": "京都市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "平成19年"
  },
  {
    "no": 6,
    "type": "本校型",
    "name": "星槎名古屋中学校",
    "branchName": null,
    "prefecture": "愛知県",
    "city": "名古屋市",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "平成24年"
  },
  {
    "no": 7,
    "type": "本校型",
    "name": "星槎もみじ中学校",
    "branchName": null,
    "prefecture": "北海道",
    "city": "札幌市",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "平成26年"
  },
  {
    "no": 8,
    "type": "本校型",
    "name": "西濃学園中学校",
    "branchName": null,
    "prefecture": "岐阜県",
    "city": "揖斐郡",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "平成29年"
  },
  {
    "no": 9,
    "type": "本校型",
    "name": "東京シューレ江戸川小学校",
    "branchName": null,
    "prefecture": "東京都",
    "city": "江戸川区",
    "schoolType": "小学校",
    "publicPrivate": "私立",
    "designatedYear": "令和2年"
  },
  {
    "no": 10,
    "type": "本校型",
    "name": "星槎高等学校",
    "branchName": null,
    "prefecture": "神奈川県",
    "city": "横浜市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和2年"
  },
  {
    "no": 11,
    "type": "本校型",
    "name": "岐阜市立草潤中学校",
    "branchName": null,
    "prefecture": "岐阜県",
    "city": "岐阜市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和3年"
  },
  {
    "no": 12,
    "type": "本校型",
    "name": "白石市立白石南小学校・白石市立白石南中学校",
    "branchName": null,
    "prefecture": "宮城県",
    "city": "白石市",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "令和5年"
  },
  {
    "no": 13,
    "type": "本校型",
    "name": "ろりぽっぷ学園小学校",
    "branchName": null,
    "prefecture": "宮城県",
    "city": "仙台市",
    "schoolType": "小学校",
    "publicPrivate": "私立",
    "designatedYear": "令和5年"
  },
  {
    "no": 14,
    "type": "本校型",
    "name": "東京みらい中学校",
    "branchName": null,
    "prefecture": "東京都",
    "city": "足立区",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "令和6年"
  },
  {
    "no": 15,
    "type": "本校型",
    "name": "生野学園高等学校",
    "branchName": null,
    "prefecture": "兵庫県",
    "city": "朝来市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和6年"
  },
  {
    "no": 16,
    "type": "本校型",
    "name": "大阪市立心和中学校",
    "branchName": null,
    "prefecture": "大阪府",
    "city": "大阪市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和6年"
  },
  {
    "no": 17,
    "type": "本校型",
    "name": "玖珠町立くす若草小中学校",
    "branchName": null,
    "prefecture": "大分県",
    "city": "玖珠町",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "令和6年"
  },
  {
    "no": 18,
    "type": "本校型",
    "name": "上山市立西郷小学校・上山市立西郷中学校",
    "branchName": null,
    "prefecture": "山形県",
    "city": "上山市",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 19,
    "type": "本校型",
    "name": "三重県立みえ四葉ヶ咲中学校",
    "branchName": null,
    "prefecture": "三重県",
    "city": "津市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 20,
    "type": "本校型",
    "name": "生野学園中学校",
    "branchName": null,
    "prefecture": "兵庫県",
    "city": "朝来市",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 21,
    "type": "本校型",
    "name": "福岡市立百道松原中学校",
    "branchName": null,
    "prefecture": "福岡県",
    "city": "福岡市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 22,
    "type": "本校型",
    "name": "宮崎市立ひなた中学校",
    "branchName": null,
    "prefecture": "宮崎県",
    "city": "宮崎市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 23,
    "type": "本校型",
    "name": "横浜きりん学園",
    "branchName": null,
    "prefecture": "神奈川県",
    "city": "横浜市",
    "schoolType": "小・中",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 24,
    "type": "本校型",
    "name": "さいたま市立いろどり学園小学部・中学部",
    "branchName": null,
    "prefecture": "埼玉県",
    "city": "さいたま市",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 25,
    "type": "本校型",
    "name": "川口市立芝園学園中学校",
    "branchName": null,
    "prefecture": "埼玉県",
    "city": "川口市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 26,
    "type": "本校型",
    "name": "世田谷区立北沢学園中学校",
    "branchName": null,
    "prefecture": "東京都",
    "city": "世田谷区",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 27,
    "type": "本校型",
    "name": "富山市立古志はるかぜ学園小学部・中学部",
    "branchName": null,
    "prefecture": "富山県",
    "city": "富山市",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 28,
    "type": "本校型",
    "name": "愛知県立日進高等学校附属中学校",
    "branchName": null,
    "prefecture": "愛知県",
    "city": "日進市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 29,
    "type": "本校型",
    "name": "尼崎市立尼崎琴葉中学校",
    "branchName": null,
    "prefecture": "兵庫県",
    "city": "尼崎市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 30,
    "type": "本校型",
    "name": "都城市立あやめ野中学校",
    "branchName": null,
    "prefecture": "宮崎県",
    "city": "都城市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 31,
    "type": "本校型",
    "name": "志布志市立悠志学園",
    "branchName": null,
    "prefecture": "鹿児島県",
    "city": "志布志市",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 32,
    "type": "本校型",
    "name": "静岡学園なごみ中学校",
    "branchName": null,
    "prefecture": "静岡県",
    "city": "静岡市",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "令和8年"
  },
  {
    "no": 33,
    "type": "分校型",
    "name": "福生市立福生第一中学校",
    "branchName": "福生市立牛浜もくせい中学校",
    "prefecture": "東京都",
    "city": "福生市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和2年"
  },
  {
    "no": 34,
    "type": "分校型",
    "name": "大牟田市立宅峰中学校",
    "branchName": "ほしぞら分校",
    "prefecture": "福岡県",
    "city": "大牟田市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和6年"
  },
  {
    "no": 35,
    "type": "分校型",
    "name": "鎌倉市立御成中学校",
    "branchName": "鎌倉市立由比ガ浜中学校",
    "prefecture": "神奈川県",
    "city": "鎌倉市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 36,
    "type": "分校型",
    "name": "神戸市立湊翔楠中学校",
    "branchName": "みらいポート",
    "prefecture": "兵庫県",
    "city": "神戸市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 37,
    "type": "分校型",
    "name": "宇美町立原田小学校",
    "branchName": "ハピネス分校",
    "prefecture": "福岡県",
    "city": "宇美町",
    "schoolType": "小学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 38,
    "type": "分校型",
    "name": "宇美町立宇美南中学校",
    "branchName": "ハピネス分校",
    "prefecture": "福岡県",
    "city": "宇美町",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 39,
    "type": "分校型",
    "name": "釧路市立北中学校",
    "branchName": "釧路市立くしろ創明学園",
    "prefecture": "北海道",
    "city": "釧路市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 40,
    "type": "分校型",
    "name": "小千谷市立小千谷中学校",
    "branchName": "上ノ山分校",
    "prefecture": "新潟県",
    "city": "小千谷市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 41,
    "type": "分校型",
    "name": "上越市立雄志中学校",
    "branchName": "上越市立諏訪中学校",
    "prefecture": "新潟県",
    "city": "上越市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 42,
    "type": "分校型",
    "name": "大阪府教育センター附属高等学校",
    "branchName": "窓明分校",
    "prefecture": "大阪府",
    "city": "大阪市",
    "schoolType": "高等学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 43,
    "type": "分校型",
    "name": "下関市立文洋中学校",
    "branchName": "関西分校",
    "prefecture": "山口県",
    "city": "下関市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 44,
    "type": "分校型",
    "name": "大野城市立みずほ中学校",
    "branchName": null,
    "prefecture": "福岡県",
    "city": "大野城市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 45,
    "type": "分教室型",
    "name": "調布市立第七中学校",
    "branchName": "はしうち教室",
    "prefecture": "東京都",
    "city": "調布市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "平成30年"
  },
  {
    "no": 46,
    "type": "分教室型",
    "name": "大田区立御園中学校",
    "branchName": "みらい学園",
    "prefecture": "東京都",
    "city": "大田区",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和3年"
  },
  {
    "no": 47,
    "type": "分教室型",
    "name": "富谷市立富谷中学校",
    "branchName": "西成田教室",
    "prefecture": "宮城県",
    "city": "富谷市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和4年"
  },
  {
    "no": 48,
    "type": "分教室型",
    "name": "大和市立引地台中学校",
    "branchName": null,
    "prefecture": "神奈川県",
    "city": "大和市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和4年"
  },
  {
    "no": 49,
    "type": "分教室型",
    "name": "三豊市立高瀬中学校",
    "branchName": null,
    "prefecture": "香川県",
    "city": "三豊市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和4年"
  },
  {
    "no": 50,
    "type": "分教室型",
    "name": "世田谷区立世田谷中学校",
    "branchName": "ねいろ",
    "prefecture": "東京都",
    "city": "世田谷区",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和4年"
  },
  {
    "no": 51,
    "type": "分教室型",
    "name": "大和郡山市立郡山北小学校",
    "branchName": "ASU",
    "prefecture": "奈良県",
    "city": "大和郡山市",
    "schoolType": "小学校",
    "publicPrivate": "公立",
    "designatedYear": "令和5年"
  },
  {
    "no": 52,
    "type": "分教室型",
    "name": "大和郡山市立郡山中学校",
    "branchName": "ASU",
    "prefecture": "奈良県",
    "city": "大和郡山市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和5年"
  },
  {
    "no": 53,
    "type": "分教室型",
    "name": "大田区立大森第四小学校",
    "branchName": "みらい学園初等部",
    "prefecture": "東京都",
    "city": "大田区",
    "schoolType": "小学校",
    "publicPrivate": "公立",
    "designatedYear": "令和6年"
  },
  {
    "no": 54,
    "type": "分教室型",
    "name": "北方町立北学園",
    "branchName": "特例教室「オンリー１」",
    "prefecture": "岐阜県",
    "city": "北方町",
    "schoolType": "小・中",
    "publicPrivate": "公立",
    "designatedYear": "令和6年"
  },
  {
    "no": 55,
    "type": "分教室型",
    "name": "高山市立宮中学校",
    "branchName": "「にじ色」",
    "prefecture": "岐阜県",
    "city": "高山市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和6年"
  },
  {
    "no": 56,
    "type": "分教室型",
    "name": "延岡市立南浦中学校",
    "branchName": "熊野江教室",
    "prefecture": "宮崎県",
    "city": "延岡市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和6年"
  },
  {
    "no": 57,
    "type": "分教室型",
    "name": "棚倉町立棚倉中学校",
    "branchName": null,
    "prefecture": "福島県",
    "city": "棚倉町",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 58,
    "type": "分教室型",
    "name": "リリーベール小学校",
    "branchName": "リリーガーデン",
    "prefecture": "茨城県",
    "city": "水戸市",
    "schoolType": "小学校",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 59,
    "type": "分教室型",
    "name": "習志野市立袖ヶ浦西小学校",
    "branchName": null,
    "prefecture": "千葉県",
    "city": "習志野市",
    "schoolType": "小学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 60,
    "type": "分教室型",
    "name": "浦安市立浦安中学校",
    "branchName": "UMI",
    "prefecture": "千葉県",
    "city": "浦安市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 61,
    "type": "分教室型",
    "name": "港区立御成門学園御成門中学校",
    "branchName": null,
    "prefecture": "東京都",
    "city": "港区",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 62,
    "type": "分教室型",
    "name": "町田市立山崎中学校",
    "branchName": "「ゆめのき」",
    "prefecture": "東京都",
    "city": "町田市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 63,
    "type": "分教室型",
    "name": "府中市立浅間中学校",
    "branchName": "「かがやき」",
    "prefecture": "東京都",
    "city": "府中市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 64,
    "type": "分教室型",
    "name": "美作市立作東中学校",
    "branchName": "樸学園",
    "prefecture": "岡山県",
    "city": "美作市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 65,
    "type": "分教室型",
    "name": "東表中学校",
    "branchName": "各分教室（沖縄県内6か所）",
    "prefecture": "沖縄県",
    "city": "複数",
    "schoolType": "中学校",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 66,
    "type": "分教室型",
    "name": "那須塩原市立三島中学校",
    "branchName": "プリズム",
    "prefecture": "栃木県",
    "city": "那須塩原市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 67,
    "type": "分教室型",
    "name": "静岡市立末広中学校",
    "branchName": null,
    "prefecture": "静岡県",
    "city": "静岡市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 68,
    "type": "分教室型",
    "name": "長浜市立浅井中学校",
    "branchName": null,
    "prefecture": "滋賀県",
    "city": "長浜市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 69,
    "type": "分教室型",
    "name": "高知市立潮江中学校",
    "branchName": "SOLA",
    "prefecture": "高知県",
    "city": "高知市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 70,
    "type": "分教室型",
    "name": "いの町立伊野小学校",
    "branchName": "きぼう",
    "prefecture": "高知県",
    "city": "いの町",
    "schoolType": "小学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 71,
    "type": "分教室型",
    "name": "いの町立伊野中学校",
    "branchName": "きぼう",
    "prefecture": "高知県",
    "city": "いの町",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 72,
    "type": "分教室型",
    "name": "長崎市立桜馬場中学校",
    "branchName": null,
    "prefecture": "長崎県",
    "city": "長崎市",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 73,
    "type": "分教室型",
    "name": "さつま町立宮之城中学校",
    "branchName": null,
    "prefecture": "鹿児島県",
    "city": "さつま町",
    "schoolType": "中学校",
    "publicPrivate": "公立",
    "designatedYear": "令和8年"
  },
  {
    "no": 74,
    "type": "コース指定型",
    "name": "鹿児島城西高等学校",
    "branchName": "ドリームコース",
    "prefecture": "鹿児島県",
    "city": "日置市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "平成18年"
  },
  {
    "no": 75,
    "type": "コース指定型",
    "name": "NHK学園高等学校",
    "branchName": "ライフデザインコース",
    "prefecture": "東京都",
    "city": "国立市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "平成20年"
  },
  {
    "no": 76,
    "type": "コース指定型",
    "name": "精華高等学校",
    "branchName": "フリーアカデミーコース",
    "prefecture": "大阪府",
    "city": "堺市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和6年"
  },
  {
    "no": 77,
    "type": "コース指定型",
    "name": "岡山県美作高等学校",
    "branchName": "普通科Bloomコース",
    "prefecture": "岡山県",
    "city": "津山市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和6年"
  },
  {
    "no": 78,
    "type": "コース指定型",
    "name": "星槎国際高等学校",
    "branchName": "通信制課程リベラルアーツコース",
    "prefecture": "北海道",
    "city": "札幌市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 79,
    "type": "コース指定型",
    "name": "秋田修英高等学校",
    "branchName": "全日制課程ステップUPコース",
    "prefecture": "秋田県",
    "city": "大仙市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 80,
    "type": "コース指定型",
    "name": "福岡海星女子学院高等学校",
    "branchName": "ブライトコース",
    "prefecture": "福岡県",
    "city": "福岡市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 81,
    "type": "コース指定型",
    "name": "福岡県立小郡高等学校",
    "branchName": "みらい創造コース",
    "prefecture": "福岡県",
    "city": "小郡市",
    "schoolType": "高等学校",
    "publicPrivate": "公立",
    "designatedYear": "令和7年"
  },
  {
    "no": 82,
    "type": "コース指定型",
    "name": "慶成高等学校",
    "branchName": "至誠コース",
    "prefecture": "福岡県",
    "city": "北九州市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和7年"
  },
  {
    "no": 83,
    "type": "コース指定型",
    "name": "東奥学園高等学校",
    "branchName": "レバレッジコース",
    "prefecture": "青森県",
    "city": "青森市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和8年"
  },
  {
    "no": 84,
    "type": "コース指定型",
    "name": "石見智翠館高等学校",
    "branchName": "アスライズコース",
    "prefecture": "島根県",
    "city": "江津市",
    "schoolType": "高等学校",
    "publicPrivate": "私立",
    "designatedYear": "令和8年"
  }
];

export const MEXT_SOURCE_URL = "https://www.mext.go.jp/a_menu/shotou/seitoshidou/1387004.htm";
