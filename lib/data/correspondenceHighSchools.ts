// 広域通信制高校（私立中心）のデータ。
//
// 通信制高校は学校教育法上の正式な高等学校で、スクーリング（面接指導）・レポート提出等
// により高校卒業資格を取得できる。「広域」通信制高校は本校の所在する都道府県以外の
// 生徒も募集できるため、お住まいの地域にかかわらず選択肢になりうる。
//
// 文部科学省は通信制高校の学校数・生徒数等の統計は公表しているが、学校名を含む全国一覧は
// 公表していない（2026年10月確認）。そこで、東京都生活文化局が「私立都認可外通信制
// 高等学校在学生授業料助成金」等の参考資料として公開している、通信教育を行う区域に
// 東京都を含む（＝広域で、東京都内の生徒も対象にしている）通信制高校・狭域通信制高校の
// 一覧を出典として用いた。東京都を対象地域に含む学校のほぼすべてを収録していると考えられ、
// 全国規模で生徒募集を行う広域通信制高校の大部分をカバーしているとみられるが、
// 東京都を対象地域に含まない学校（都道府県内・近隣県のみを対象とする狭域通信制高校等）は
// このリストには含まれていない。
//
// 各校の校舎（キャンパス・サポート校）の所在地はこのリストには含まれておらず、本校所在地
// （所轄庁）のみを掲載している。校舎の所在地・学費・カリキュラム等は学校ごとに大きく異なる
// ため、気になる学校が見つかったら必ず各校の公式サイトで確認すること。公式サイトURLは
// 出典資料に記載がなく、誤ったURLを掲載するリスクを避けるため、このデータには含めていない。
export type CorrespondenceHighSchool = {
  no: number;
  prefecture: string; // 所轄庁（本校所在地の都道府県）
  municipality: string; // 所轄庁に市町村名が記載されている場合のみ（なければ空文字）
  name: string;
  operator: string; // 設置者名（学校法人・株式会社等）
  // 公式サイトURL（Web調査で確認できた学校のみ、任意。2026-10-21追加）。
  // 通信制高校は私立（学校法人・株式会社運営）が多く、資料請求等のアフィリエイト
  // プログラムを持つ学校が少なくないため、ここにURLを入れても詳細ページ側では
  // 直接<a>タグにはせず、app/out/route.ts（中継ルート）経由でリンクする。中立な
  // 直リンクのままでよいフリースクール・学びの多様化学校（公立中心・非営利中心）とは
  // 方針を分けている。
  officialUrl?: string;
};

export const CORRESPONDENCE_HIGH_SCHOOL_SOURCE_URL =
  'https://www.seikatubunka.metro.tokyo.lg.jp/documents/d/seikatubunka/15ninkagai_tsushinsei_gakoichiran2508_1563';
export const CORRESPONDENCE_HIGH_SCHOOL_AS_OF = '令和7年8月時点（東京都生活文化局調査）';

export const CORRESPONDENCE_HIGH_SCHOOLS: CorrespondenceHighSchool[] = [
  { no: 1, prefecture: '北海道', municipality: '', name: 'クラーク記念国際高等学校', operator: '学校法人創志学園', officialUrl: 'https://www.clark.ed.jp/' },
  { no: 2, prefecture: '北海道', municipality: '', name: '星槎国際高等学校', operator: '学校法人国際学園', officialUrl: 'https://seisa.ed.jp/' },
  { no: 3, prefecture: '北海道', municipality: '', name: '北海道芸術高等学校', operator: '学校法人恭敬学園', officialUrl: 'https://www.kyokei.ac.jp/' },
  { no: 4, prefecture: '北海道', municipality: '', name: '酪農学園大学附属とわの森三愛高等学校', operator: '学校法人酪農学園', officialUrl: 'https://www.san-ai.ed.jp/' },
  { no: 5, prefecture: '北海道', municipality: '', name: '札幌静修高等学校', operator: '学校法人札幌静修学園', officialUrl: 'https://www.sapporoseishu.ed.jp/' },
  { no: 6, prefecture: '青森県', municipality: '', name: '青森山田高等学校通信制課程', operator: '学校法人青森山田学園', officialUrl: 'http://www.yamada-tsushin.jp/' },
  { no: 7, prefecture: '宮城県', municipality: '', name: '仙台育英学園高等学校', operator: '学校法人仙台育英学園', officialUrl: 'https://www.sendaiikuei.ed.jp/hs/' },
  { no: 8, prefecture: '宮城県', municipality: '', name: '仙台白百合学園高等学校', operator: '学校法人白百合学園' },
  { no: 9, prefecture: '宮城県', municipality: '', name: '飛鳥未来きずな高等学校', operator: '学校法人三幸学園', officialUrl: 'https://www.sanko.ac.jp/asuka/kizuna/' },
  { no: 10, prefecture: '宮城県', municipality: '', name: '東陵高等学校', operator: '学校法人東陵学園', officialUrl: 'https://www.toryo.ed.jp/' },
  { no: 11, prefecture: '福島県', municipality: '川内村', name: '大智学園高等学校', operator: '株式会社コーチング・スタッフ' },
  { no: 12, prefecture: '福島県', municipality: '', name: '翔洋学園高等学校', operator: '学校法人翔洋学園', officialUrl: 'https://www.shoyo.ac.jp/' },
  { no: 13, prefecture: '茨城県', municipality: '', name: '鹿島学園高等学校', operator: '学校法人鹿島学園', officialUrl: 'https://kgh.ed.jp/' },
  { no: 14, prefecture: '茨城県', municipality: '', name: '晃陽学園高等学校', operator: '学校法人晃陽学園', officialUrl: 'https://www.koyo-gakuen.ac.jp/hs/' },
  { no: 15, prefecture: '茨城県', municipality: '', name: 'つくば開成高等学校', operator: '学校法人つくば開成学園', officialUrl: 'https://ibaraki.tsukuba-kaisei.ed.jp/' },
  { no: 16, prefecture: '茨城県', municipality: '', name: 'S高等学校', operator: '学校法人角川ドワンゴ学園', officialUrl: 'https://nnn.ed.jp/campus/s_high_school/' },
  { no: 17, prefecture: '茨城県', municipality: '', name: '日本ウェルネス高等学校', operator: '学校法人タイケン学園', officialUrl: 'https://www.taiken.ac.jp/gakuin/' },
  { no: 18, prefecture: '茨城県', municipality: '', name: '土浦日本大学高等学校', operator: '学校法人土浦日本大学学園', officialUrl: 'https://www.tng.ac.jp/tsuchiura/' },
  { no: 19, prefecture: '茨城県', municipality: '', name: '飛鳥未来きぼう高等学校', operator: '学校法人三幸学園', officialUrl: 'https://www.sanko.ac.jp/asuka/kibou/' },
  { no: 20, prefecture: '茨城県', municipality: '', name: '四谷学院高等学校', operator: '学校法人四谷学院', officialUrl: 'https://ygh.ed.jp/' },
  { no: 21, prefecture: '茨城県', municipality: '高萩市', name: '第一学院高等学校高萩校', operator: '株式会社ウィザス', officialUrl: 'https://www.daiichigakuin.ed.jp/campus/takahagi/' },
  { no: 22, prefecture: '茨城県', municipality: '大子町', name: 'ルネサンス高等学校', operator: 'ブロードメディア株式会社', officialUrl: 'https://www.r-ac.jp/' },
  { no: 23, prefecture: '栃木県', municipality: '', name: '日々輝学園高等学校', operator: '学校法人開桜学院', officialUrl: 'https://www.hibiki-gakuen.ed.jp/' },
  { no: 24, prefecture: '群馬県', municipality: '', name: 'R高等学校', operator: '学校法人角川ドワンゴ学園', officialUrl: 'https://nnn.ed.jp/campus/r_high_school/' },
  { no: 25, prefecture: '埼玉県', municipality: '', name: '武蔵野星城高等学校', operator: '学校法人小池学園' },
  { no: 26, prefecture: '埼玉県', municipality: '', name: '志学会高等学校', operator: '学校法人志学会学院', officialUrl: 'https://shigakukai.ed.jp/' },
  { no: 27, prefecture: '埼玉県', municipality: '', name: '松栄学園高等学校', operator: '学校法人松山学園' },
  { no: 28, prefecture: '埼玉県', municipality: '', name: '清和学園高等学校', operator: '学校法人一川学園', officialUrl: 'https://www.sgh.ed.jp/' },
  { no: 29, prefecture: '埼玉県', municipality: '', name: '大川学園高等学校', operator: '学校法人大川学園', officialUrl: 'https://www.ohkawa.ac.jp/' },
  { no: 30, prefecture: '埼玉県', municipality: '', name: '開智高等学校', operator: '学校法人開智学園', officialUrl: 'https://koutoubu.kaichigakuen.ed.jp/' },
  { no: 31, prefecture: '埼玉県', municipality: '', name: '霞ヶ関高等学校', operator: '学校法人山口学院', officialUrl: 'https://kasumigaseki.ed.jp/' },
  { no: 32, prefecture: '埼玉県', municipality: '', name: '国際学院高等学校', operator: '学校法人国際学院', officialUrl: 'https://cr.kgef.ac.jp/' },
  { no: 33, prefecture: '埼玉県', municipality: '', name: 'わせがく夢育高等学校', operator: '学校法人早稲田学園', officialUrl: 'https://www.yumeiku.wasegaku.ac.jp/' },
  { no: 34, prefecture: '埼玉県', municipality: '', name: '聖望学園高等学校', operator: '学校法人聖望学園', officialUrl: 'https://www.seibou.ac.jp/' },
  { no: 35, prefecture: '埼玉県', municipality: '深谷市', name: '創学舎高等学校', operator: '株式会社愛郷舎' },
  { no: 36, prefecture: '埼玉県', municipality: '', name: '明聖高等学校', operator: '学校法人花沢学園', officialUrl: 'https://www.meisei-hs.ac.jp/' },
  { no: 37, prefecture: '埼玉県', municipality: '', name: 'わせがく高等学校', operator: '学校法人早稲田学園', officialUrl: 'https://www.wasegaku.ac.jp/' },
  { no: 38, prefecture: '埼玉県', municipality: '', name: 'あずさ第一高等学校', operator: '学校法人野田鎌田学園', officialUrl: 'https://www.azusa1.ed.jp/' },
  { no: 39, prefecture: '千葉県', municipality: '', name: '中央国際高等学校', operator: '学校法人中央国際学園', officialUrl: 'https://chuo-kokusai.ac.jp/' },
  { no: 40, prefecture: '千葉県', municipality: '', name: '中山学園高等学校', operator: '学校法人中山学園', officialUrl: 'https://nakayama-gakuen.ac.jp/ngh/' },
  { no: 41, prefecture: '千葉県', municipality: '', name: '敬愛大学八日市場高等学校', operator: '学校法人長戸路学園', officialUrl: 'https://keiai8.ed.jp/' },
  { no: 42, prefecture: '千葉県', municipality: '', name: '鴨川令徳高等学校', operator: '学校法人令徳学園', officialUrl: 'https://reitoku.ed.jp/' },
  { no: 43, prefecture: '千葉県', municipality: '', name: '麗澤高等学校', operator: '学校法人廣池学園', officialUrl: 'https://www.hs.reitaku.jp/' },
  { no: 44, prefecture: '千葉県', municipality: '', name: '千葉科学大学附属高等学校', operator: '学校法人大城学園', officialUrl: 'https://www.cis.ac.jp/cish/index.html' },
  { no: 45, prefecture: '千葉県', municipality: '', name: 'ヒューマンキャンパスのぞみ高等学校', operator: '学校法人佐藤学園', officialUrl: 'https://www.hchs.ed.jp/' },
  { no: 46, prefecture: '千葉県', municipality: '勝浦市', name: '成美学園高等學校', operator: '株式会社勝浦成美', officialUrl: 'https://k-seibi.ed.jp/' },
  { no: 47, prefecture: '千葉県', municipality: '', name: '清心女子高等学校', operator: '学校法人大谷学園', officialUrl: 'https://www.seisin.ed.jp/' },
  { no: 48, prefecture: '千葉県', municipality: '', name: '秀英高等学校', operator: '学校法人大谷学園', officialUrl: 'https://www.shuei.ed.jp/' },
  { no: 49, prefecture: '神奈川県', municipality: '', name: '厚木中央高等学校', operator: '学校法人鈴木学園', officialUrl: 'https://www.suzukigakuen.ac.jp/chuo/' },
  { no: 50, prefecture: '神奈川県', municipality: '', name: '星槎高等学校', operator: '学校法人星槎', officialUrl: 'https://www.seisahighschool.ed.jp/' },
  { no: 51, prefecture: '神奈川県', municipality: '山北町', name: '鹿島山北高等学校', operator: '株式会社山北学園', officialUrl: 'https://kg-school.net/yamakita/' },
  { no: 52, prefecture: '新潟県', municipality: '', name: '新潟産業大学附属高等学校', operator: '学校法人柏専学院', officialUrl: 'https://www.nsf-h.ed.jp/' },
  { no: 53, prefecture: '新潟県', municipality: '', name: '開志創造高等学校', operator: '学校法人新潟総合学院', officialUrl: 'https://kaishi-souzou.ed.jp/' },
  { no: 54, prefecture: '石川県', municipality: '白山市', name: '白山市美川教育特区アットマーク国際高等学校', operator: '株式会社アットマーク・ラーニング', officialUrl: 'https://at-mhk.com/kokusai/' },
  { no: 55, prefecture: '福井県', municipality: '', name: 'AOIKE高等学校', operator: '学校法人青池学園', officialUrl: 'https://aoike-highschool.jp/' },
  { no: 56, prefecture: '山梨県', municipality: '', name: '日本航空高等学校', operator: '学校法人日本航空学園', officialUrl: 'https://www.jaaw-hs.net/' },
  { no: 57, prefecture: '山梨県', municipality: '', name: '駿台甲府高等学校', operator: '学校法人駿台甲府学園', officialUrl: 'https://www.sundai-kofu.ed.jp/' },
  { no: 58, prefecture: '長野県', municipality: '', name: '自然学園高等学校', operator: '学校法人自然学園', officialUrl: 'https://shizengakuen.ed.jp/' },
  { no: 59, prefecture: '山梨県', municipality: '', name: '甲斐清和高等学校', operator: '学校法人伊藤学園', officialUrl: 'https://seika.ito-gakuen.ed.jp/' },
  { no: 60, prefecture: '山梨県', municipality: '', name: '山梨学院高等学校', operator: '学校法人C2C Global Education Japan', officialUrl: 'https://www.yghs.ed.jp/' },
  { no: 61, prefecture: '山梨県', municipality: '', name: '山梨英和高等学校', operator: '学校法人山梨英和学院', officialUrl: 'https://www.yamanashi-eiwa.ac.jp/jsh' },
  { no: 62, prefecture: '山梨県', municipality: '', name: '帝京第三高等学校', operator: '学校法人帝京大学', officialUrl: 'https://www.teikyo3.ed.jp/' },
  { no: 63, prefecture: '岐阜県', municipality: '', name: '地球環境高等学校', operator: '学校法人吉沢学園', officialUrl: 'https://earth.ac.jp/' },
  { no: 64, prefecture: '岐阜県', municipality: '', name: 'さくら国際高等学校', operator: '学校法人上田煌桜学園', officialUrl: 'https://sakura-kokusai.ed.jp/' },
  { no: 65, prefecture: '長野県', municipality: '', name: '松本国際高等学校', operator: '学校法人理知の杜', officialUrl: 'https://m-kokusai.ac.jp/' },
  { no: 66, prefecture: '愛知県', municipality: '', name: 'コードアカデミー高等学校', operator: '学校法人信学会', officialUrl: 'https://www.code.ac.jp/' },
  { no: 67, prefecture: '愛知県', municipality: '', name: 'ID学園高等学校', operator: '学校法人郁文館夢学園', officialUrl: 'https://id.ikubunkan.ed.jp/' },
  { no: 68, prefecture: '愛知県', municipality: '', name: '中京高等学校', operator: '学校法人安達学園', officialUrl: 'https://www.chukyo-ch.ed.jp/' },
  { no: 69, prefecture: '愛知県', municipality: '', name: '啓晴高等学校', operator: '学校法人石井学園', officialUrl: 'https://fine.sc/' },
  { no: 70, prefecture: '愛知県', municipality: '', name: '中京大学付属中京高等学校', operator: '学校法人梅村学園', officialUrl: 'https://www.chukyo.ed.jp/' },
  { no: 71, prefecture: '愛知県', municipality: '豊田市', name: 'ルネサンス豊田高等学校', operator: 'ブロードメディア株式会社', officialUrl: 'https://www.r-ac.jp/campus/toyota/' },
  { no: 72, prefecture: '三重県', municipality: '', name: '代々木高等学校', operator: '学校法人代々木学園', officialUrl: 'https://yoyogi.ed.jp/' },
  { no: 73, prefecture: '滋賀県', municipality: '', name: 'ECC学園高等学校', operator: '学校法人山口学園', officialUrl: 'https://www.ecc.ed.jp/' },
  { no: 74, prefecture: '京都府', municipality: '', name: '京都芸術大学附属高等学校（じぶんみらい科）', operator: '学校法人瓜生山学園' },
  { no: 75, prefecture: '大阪府', municipality: '', name: '向陽台高等学校', operator: '学校法人早稲田大阪学園', officialUrl: 'https://www.koyodai.ed.jp/' },
  { no: 76, prefecture: '大阪府', municipality: '', name: '八洲学園高等学校', operator: '学校法人八洲学園', officialUrl: 'https://hs.yashima.ac.jp/' },
  { no: 77, prefecture: '大阪府', municipality: '', name: 'YMCA学院高等学校', operator: '学校法人大阪YMCA', officialUrl: 'https://www.ymcagakuin.ac.jp/' },
  { no: 78, prefecture: '大阪府', municipality: '', name: 'ルネサンス大阪高等学校', operator: 'ブロードメディア株式会社', officialUrl: 'https://www.r-ac.jp/campus/osaka/' },
  { no: 79, prefecture: '兵庫県', municipality: '相生市', name: '相生学院高等学校', operator: '富士コンピューター株式会社', officialUrl: 'https://aigaku.gr.jp/' },
  { no: 80, prefecture: '兵庫県', municipality: '淡路市', name: 'AIE国際高等学校', operator: '株式会社エーアイイー' },
  { no: 81, prefecture: '奈良県', municipality: '', name: '飛鳥未来高等学校', operator: '学校法人三幸学園', officialUrl: 'https://www.sanko.ac.jp/asuka/asukamirai/nara/' },
  { no: 82, prefecture: '和歌山県', municipality: '', name: '慶風高等学校', operator: '学校法人田原学園', officialUrl: 'https://keifu.ac.jp/' },
  { no: 83, prefecture: '和歌山県', municipality: '', name: '高野山高等学校', operator: '学校法人高野山学園', officialUrl: 'https://koyasan-h.ed.jp/' },
  { no: 84, prefecture: '和歌山県', municipality: '', name: '和歌山南陵高等学校', operator: '学校法人南陵学園', officialUrl: 'https://www.w-nanryo.ed.jp/' },
  { no: 85, prefecture: '島根県', municipality: '', name: '明誠高等学校', operator: '学校法人益田永島学園', officialUrl: 'https://meisei-ship.com/' },
  { no: 86, prefecture: '島根県', municipality: '', name: '立正大学淞南高等学校', operator: '学校法人淞南学園', officialUrl: 'https://www.shonangakuen-h.ed.jp/' },
  { no: 87, prefecture: '岡山県', municipality: '', name: '鹿島朝日高等学校', operator: '学校法人みつ朝日学園', officialUrl: 'https://kg-school.net/asahi/' },
  { no: 88, prefecture: '岡山県', municipality: '', name: '滋慶学園高等学校', operator: '学校法人大阪滋慶学園', officialUrl: 'https://www.jghs.ed.jp/' },
  { no: 89, prefecture: '岡山県', municipality: '', name: '興譲館高等学校', operator: '学校法人興譲館', officialUrl: 'https://kojokan-h.ed.jp/' },
  { no: 90, prefecture: '広島県', municipality: '', name: 'ワオ高等学校', operator: '学校法人ワオ未来学園', officialUrl: 'https://www.wao.ed.jp/' },
  { no: 91, prefecture: '岡山県', municipality: '', name: '創志学園高等学校', operator: '学校法人創志学園' },
  { no: 92, prefecture: '広島県', municipality: '', name: '東林館高等学校', operator: '学校法人喜田学園' },
  { no: 93, prefecture: '広島県', municipality: '', name: '並木学院高等学校', operator: '学校法人英数学館' },
  { no: 94, prefecture: '山口県', municipality: '', name: '精華学園高等学校', operator: '学校法人山口精華学園' },
  { no: 95, prefecture: '山口県', municipality: '', name: '松陰高等学校', operator: '学校法人山口松陰学園' },
  { no: 96, prefecture: '山口県', municipality: '', name: '萩明倫館高等学校', operator: '学校法人明倫学園' },
  { no: 97, prefecture: '徳島県', municipality: '', name: 'みのり高等学校', operator: '学校法人明里学園' },
  { no: 98, prefecture: '香川県', municipality: '', name: 'RITA学園高等学校', operator: '学校法人利他学園' },
  { no: 99, prefecture: '愛媛県', municipality: '', name: '日本ウェルネス高等学校', operator: '学校法人タイケン国際学園' },
  { no: 100, prefecture: '愛媛県', municipality: '', name: '未来高等学校', operator: '学校法人河原学園' },
  { no: 101, prefecture: '愛媛県', municipality: '', name: '今治精華高等学校', operator: '学校法人今治精華学園' },
  { no: 102, prefecture: '福岡県', municipality: '川崎町', name: '川崎特区明蓬館高等学校', operator: '株式会社アットマーク・ラーニング' },
  { no: 103, prefecture: '福岡県', municipality: '', name: '第一薬科大学付属高等学校', operator: '学校法人都築学園' },
  { no: 104, prefecture: '長崎県', municipality: '', name: 'こころ未来高等学校', operator: '学校法人第二岩永学園' },
  { no: 105, prefecture: '長崎県', municipality: '', name: '一ツ葉高等学校', operator: '株式会社I am success.' },
  { no: 106, prefecture: '福岡県', municipality: '', name: 'やまと高等学校', operator: 'エネルギープロダクト株式会社' },
  { no: 107, prefecture: '熊本県', municipality: '山都町', name: '勇志国際高等学校', operator: '学校法人青叡舎学院' },
  { no: 108, prefecture: '熊本県', municipality: '', name: 'くまもと清陵高等学校', operator: '学校法人熊ゼミ学園' },
  { no: 109, prefecture: '鹿児島県', municipality: '', name: '屋久島おおぞら高等学校', operator: '学校法人KTC学園' },
  { no: 110, prefecture: '鹿児島県', municipality: '', name: '神村学園高等部通信制課程', operator: '学校法人神村学園' },
  { no: 111, prefecture: '沖縄県', municipality: '', name: '八洲学園大学国際高等学校', operator: '学校法人八洲学園' },
  { no: 112, prefecture: '沖縄県', municipality: '', name: 'ヒューマンキャンパス高等学校', operator: '学校法人佐藤学園' },
  { no: 113, prefecture: '沖縄県', municipality: '', name: 'N高等学校', operator: '学校法人角川ドワンゴ学園' },
  { no: 114, prefecture: '沖縄県', municipality: '', name: 'つくば開成国際高等学校', operator: '学校法人つくば開成学園' },
  { no: 115, prefecture: '沖縄県', municipality: '', name: '瑞穂MSC高等学校', operator: '学校法人みずほ学園' },
];
