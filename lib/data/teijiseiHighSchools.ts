// 定時制高校（全日制高校に併設された夜間部・昼間部等を含む）の全国データ。
//
// 文部科学省は定時制高校の学校数・生徒数等の統計は公表しているが（2024年時点で全国613校、
// うち約90%が公立。2013年は669校で減少傾向。出典: マネーポストWEB
// https://www.moneypost.jp/1295666 ）、学校名を含む全国一覧を一本で公表してはいない。
// 全国高等学校定時制通信制教育振興会等の加盟校一覧も確認できなかった（2026-10-28時点）。
// そのため、各都道府県教育委員会が公開している定時制高校一覧・入学者選抜実施要項・
// 学校要覧等のPDF/Webページを一次資料として、都道府県ごとに調査して収集している。
//
// 「パレットスクール」（埼玉県）・「チャレンジスクール」（東京都）・「クリエイティブスクール」
// （神奈川県）等、都道府県ごとに異なる名称を持つ多部制（昼間部・夜間部・三部制等）・単位制の
// 定時制高校（不登校経験者・中途退学者等を主な対象とすることが多い）も、通常の定時制課程
// （全日制高校に併設された夜間部など）も、ともにこのデータに含める。schoolCategoryフィールドで
// 区別する。
//
// 推測によるデータ追加は行わない（市区町村・部制・支援体制等を資料で確認できない場合は
// フィールドを省略する）。確認できた事実には出典を明記する。
export type TeijiseiHighSchool = {
  no: number;
  prefecture: string;
  municipality?: string; // 資料で確認できた場合のみ
  name: string;
  publicPrivate: '公立' | '私立' | '国立';
  // 設置者（教育委員会名・学校法人名等）。確認できた場合のみ。
  operator?: string;
  // 全日制高校に併設された定時制課程か、定時制単独校（多部制等）か。
  // 'attached' = 全日制高校等に併設された定時制課程
  // 'standalone' = 定時制単独校（多部制・単位制の独立校など）
  schoolCategory?: 'attached' | 'standalone';
  // 部制（確認できた場合のみ。例: '夜間部のみ', '三部制（午前部・午後部・夜間部）'）
  parts?: string;
  // 課程の仕組み（確認できた場合のみ。例: '単位制', '学年制'）
  curriculumType?: string;
  // 都道府県・学校独自の通称（例: 埼玉県の「パレットスクール」、東京都の「チャレンジスクール」）
  nickname?: string;
  officialUrl?: string;
  // 支援体制・入学条件等、資料で確認できた固有情報（無ければ省略）
  note?: string;
};

export const teijiseiHighSchools: TeijiseiHighSchool[] = [
  // ===== 埼玉県（23校） =====
  // 出典: 令和9年度入学者選抜 課程別・学科別募集校一覧 https://www.pref.saitama.lg.jp/documents/282982/93beppyo_r09.pdf
  //       志願者数資料 https://www.pref.saitama.lg.jp/documents/268192/r802101430shigansha.pdf
  //       戸田翔陽 部制詳細 https://www.pref.saitama.lg.jp/documents/277139/110_todashouyou_r9.pdf
  //       吉川美南 部制詳細 https://www.pref.saitama.lg.jp/documents/277139/144_yoshikawaminami_tei_r9.pdf
  //       パレットスクールの呼称・経緯 https://namiki-masatoshi.com/03/0331/619_1.html https://www.juku-coaching01.com/others/pallet/
  { no: 1, prefecture: '埼玉県', name: '埼玉県立上尾高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 2, prefecture: '埼玉県', name: '埼玉県立朝霞高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 3, prefecture: '埼玉県', name: '埼玉県立浦和高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科、男子）を併置' },
  { no: 4, prefecture: '埼玉県', name: '埼玉県立浦和第一女子高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科、女子）を併置' },
  { no: 5, prefecture: '埼玉県', name: '埼玉県立大宮商業高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科・商業科）を併置' },
  { no: 6, prefecture: '埼玉県', name: '埼玉県立大宮中央高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 7, prefecture: '埼玉県', name: '埼玉県立小川高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 8, prefecture: '埼玉県', name: '埼玉県立春日部高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 9, prefecture: '埼玉県', name: '埼玉県立川越工業高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科・工業技術科）を併置' },
  { no: 10, prefecture: '埼玉県', name: '埼玉県立久喜高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 11, prefecture: '埼玉県', name: '埼玉県立所沢高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 12, prefecture: '埼玉県', name: '埼玉県立秩父農工科学高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 13, prefecture: '埼玉県', name: '埼玉県立越ヶ谷高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 14, prefecture: '埼玉県', name: '埼玉県立熊谷高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 15, prefecture: '埼玉県', name: '埼玉県立羽生高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', parts: '昼間・夜間', note: '定時制（普通科）を併置。資料に「昼間、夜間」の区分記載あり' },
  { no: 16, prefecture: '埼玉県', name: '埼玉県立飯能高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 17, prefecture: '埼玉県', name: '埼玉県立本庄高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（普通科）を併置' },
  { no: 18, prefecture: '埼玉県', name: '埼玉県立大宮科学技術高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（工業技術科）を併置' },
  { no: 19, prefecture: '埼玉県', name: '埼玉県立川口工業高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'attached', note: '定時制（工業技術科）を併置' },
  { no: 20, prefecture: '埼玉県', name: '埼玉県立狭山緑陽高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部・Ⅱ部（総合学科）', nickname: 'パレットスクール', note: '不登校経験者・中退者・学び直したい社会人が対象' },
  { no: 21, prefecture: '埼玉県', name: '埼玉県立戸田翔陽高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部・Ⅱ部・Ⅲ部（総合学科、三部制）', nickname: 'パレットスクール', note: '不登校経験者・中退者・学び直したい社会人が対象。2011年開校' },
  { no: 22, prefecture: '埼玉県', name: '埼玉県立吹上秋桜高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部・Ⅱ部（総合学科）', nickname: 'パレットスクール', note: '不登校経験者・中退者・学び直したい社会人が対象' },
  { no: 23, prefecture: '埼玉県', name: '埼玉県立吉川美南高等学校', publicPrivate: '公立', operator: '埼玉県教育委員会', parts: 'Ⅰ部・Ⅱ部（総合学科、Ⅱ部は夜間と確認）' },

  // ===== 東京都（53校） =====
  // 出典: 令和9年度 東京都立高等学校 定時制課程・チャレンジスクール等 入学者選抜案内
  //       https://www.kyoiku.metro.tokyo.lg.jp/documents/d/kyoiku/r9_admission_pt_cs
  //       チャレンジスクール名称確認: https://www.kyoiku.metro.tokyo.lg.jp/admission/high_school/archives/exam/files/pamphlet2023_japanese/10.8.pdf
  { no: 24, prefecture: '東京都', name: '東京都立一橋高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制' },
  { no: 25, prefecture: '東京都', name: '東京都立浅草高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制' },
  { no: 26, prefecture: '東京都', name: '東京都立荻窪高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制' },
  { no: 27, prefecture: '東京都', name: '東京都立八王子拓真高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制' },
  { no: 28, prefecture: '東京都', name: '東京都立砂川高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制' },
  { no: 29, prefecture: '東京都', name: '東京都立新宿山吹高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '四部制', curriculumType: '単位制', note: '総合学科・情報科' },
  { no: 30, prefecture: '東京都', name: '東京都立六本木高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', nickname: 'チャレンジスクール' },
  { no: 31, prefecture: '東京都', name: '東京都立大江戸高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', nickname: 'チャレンジスクール' },
  { no: 32, prefecture: '東京都', name: '東京都立世田谷泉高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', nickname: 'チャレンジスクール' },
  { no: 33, prefecture: '東京都', name: '東京都立稔ヶ丘高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', nickname: 'チャレンジスクール' },
  { no: 34, prefecture: '東京都', name: '東京都立桐ヶ丘高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', nickname: 'チャレンジスクール' },
  { no: 35, prefecture: '東京都', name: '東京都立小台橋高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', nickname: 'チャレンジスクール' },
  { no: 36, prefecture: '東京都', municipality: '大田区', name: '東京都立六郷工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', curriculumType: '単位制', note: '住所：大田区東六郷2-18-2' },
  { no: 37, prefecture: '東京都', municipality: '北区', name: '東京都立飛鳥高等学校', publicPrivate: '公立', operator: '東京都教育委員会', curriculumType: '単位制', note: '住所：北区王子6-8-8' },
  { no: 38, prefecture: '東京都', municipality: '板橋区', name: '東京都立板橋有徳高等学校', publicPrivate: '公立', operator: '東京都教育委員会', curriculumType: '単位制', note: '住所：板橋区徳丸2-17-1' },
  { no: 39, prefecture: '東京都', name: '東京都立青梅総合高等学校', publicPrivate: '公立', operator: '東京都教育委員会', curriculumType: '単位制' },
  { no: 40, prefecture: '東京都', name: '東京都立東久留米総合高等学校', publicPrivate: '公立', operator: '東京都教育委員会', curriculumType: '単位制' },
  { no: 41, prefecture: '東京都', name: '東京都立瑞穂農芸高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '昼夜間', note: '併合科' },
  { no: 42, prefecture: '東京都', name: '東京都立橘高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '昼夜間', note: '産業科' },
  { no: 43, prefecture: '東京都', municipality: '品川区', name: '東京都立大崎高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：品川区豊町2-1-7' },
  { no: 44, prefecture: '東京都', municipality: '大田区', name: '東京都立大森高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：大田区西蒲田2-2-1' },
  { no: 45, prefecture: '東京都', municipality: '世田谷区', name: '東京都立松原高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：世田谷区桜上水4-3-5' },
  { no: 46, prefecture: '東京都', municipality: '豊島区', name: '東京都立豊島高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：豊島区千早4-9-21' },
  { no: 47, prefecture: '東京都', municipality: '足立区', name: '東京都立足立高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：足立区中央本町1-3-9' },
  { no: 48, prefecture: '東京都', municipality: '葛飾区', name: '東京都立南葛飾高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：葛飾区立石6-4-1' },
  { no: 49, prefecture: '東京都', municipality: '江戸川区', name: '東京都立江戸川高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：江戸川区松島2-38-1' },
  { no: 50, prefecture: '東京都', municipality: '江戸川区', name: '東京都立葛西南高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：江戸川区南葛西1-11-1' },
  { no: 51, prefecture: '東京都', municipality: '調布市', name: '東京都立神代高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：調布市若葉町1-46-1' },
  { no: 52, prefecture: '東京都', municipality: '町田市', name: '東京都立町田高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：町田市中町4-25-3' },
  { no: 53, prefecture: '東京都', municipality: '福生市', name: '東京都立福生高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：福生市北田園2-11-3' },
  { no: 54, prefecture: '東京都', municipality: 'あきる野市', name: '東京都立五日市高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：あきる野市五日市894' },
  { no: 55, prefecture: '東京都', municipality: '大島町', name: '東京都立大島高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：大島町元町字八重の水127' },
  { no: 56, prefecture: '東京都', municipality: '八丈町', name: '東京都立八丈高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：八丈町大賀郷3020' },
  { no: 57, prefecture: '東京都', municipality: '府中市', name: '東京都立農業高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：府中市寿町1-10-2' },
  { no: 58, prefecture: '東京都', municipality: '世田谷区', name: '東京都立園芸高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：世田谷区深沢5-38-1' },
  { no: 59, prefecture: '東京都', municipality: '杉並区', name: '東京都立農芸高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：杉並区今川3-25-1' },
  { no: 60, prefecture: '東京都', municipality: '葛飾区', name: '東京都立農産高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制', note: '住所：葛飾区西亀有1-28-1' },
  { no: 61, prefecture: '東京都', name: '東京都立小山台高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '普通科。令和9年度第1学年募集なしの予定（資料に★表記）' },
  { no: 62, prefecture: '東京都', name: '東京都立桜町高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '普通科。令和9年度第1学年募集なしの予定（資料に★表記）' },
  { no: 63, prefecture: '東京都', name: '東京都立大山高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '普通科。令和9年度第1学年募集なしの予定（資料に★表記）' },
  { no: 64, prefecture: '東京都', name: '東京都立立川高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '普通科。令和9年度第1学年募集なしの予定（資料に★表記）' },
  { no: 65, prefecture: '東京都', name: '東京都立工芸高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科' },
  { no: 66, prefecture: '東京都', name: '東京都立蔵前工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科。令和9年度第1学年募集なしの予定（資料に★表記）' },
  { no: 67, prefecture: '東京都', name: '東京都立墨田工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科' },
  { no: 68, prefecture: '東京都', name: '東京都立総合工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科' },
  { no: 69, prefecture: '東京都', name: '東京都立中野工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科' },
  { no: 70, prefecture: '東京都', name: '東京都立荒川工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科' },
  { no: 71, prefecture: '東京都', name: '東京都立北豊島工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科。令和9年度第1学年募集なしの予定（資料に★表記）' },
  { no: 72, prefecture: '東京都', name: '東京都立本所工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科' },
  { no: 73, prefecture: '東京都', name: '東京都立小金井工科高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '工業科' },
  { no: 74, prefecture: '東京都', name: '東京都立第三商業高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '商業科' },
  { no: 75, prefecture: '東京都', name: '東京都立葛飾商業高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '商業科。令和9年度第1学年募集なしの予定（資料に★表記）' },
  { no: 76, prefecture: '東京都', name: '東京都立第五商業高等学校', publicPrivate: '公立', operator: '東京都教育委員会', schoolCategory: 'attached', note: '商業科' },

  // ===== 神奈川県（20校） =====
  // 出典: 「はいすくーる・わんだーらんど」定時制一覧ページ https://www.pref.kanagawa.jp/docs/dc4/tokushoku/hsw/teiji.html
  //       相模向陽館 https://pen-kanagawa.ed.jp/sagamikoyokan-h/nyugaku/documents/leaflet2024.pdf
  //       湘南 https://www.pen-kanagawa.ed.jp/shonan-h/teiji/nyugaku/documents/school-guider8.pdf
  //       高浜 https://pen-kanagawa.ed.jp/takahama-h/teiji/nyugaku/documents/r8gakkouannnai.pdf
  //       厚木清南 https://pen-kanagawa.ed.jp/atsugiseinan-h/tokushoku/documents/r7_pamphlet.pdf
  //       神奈川総合産業 https://pen-kanagawa.ed.jp/kanagawasogosangyo-h/teiji/gaiyou/documents/educationplan.pdf
  { no: 77, prefecture: '神奈川県', municipality: '横浜市', name: '神奈川県立横浜翠嵐高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', officialUrl: 'https://www.pen-kanagawa.ed.jp/yokohamasuiran-h/' },
  { no: 78, prefecture: '神奈川県', municipality: '横浜市', name: '神奈川県立希望ケ丘高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', officialUrl: 'https://www.pen-kanagawa.ed.jp/kibogaoka-h/index.html' },
  { no: 79, prefecture: '神奈川県', municipality: '横須賀市', name: '神奈川県立横須賀高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', officialUrl: 'https://www.pen-kanagawa.ed.jp/yokosuka-h/teiji/' },
  { no: 80, prefecture: '神奈川県', municipality: '横須賀市', name: '神奈川県立追浜高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', officialUrl: 'https://www.pen-kanagawa.ed.jp/oppama-h/teiji/' },
  { no: 81, prefecture: '神奈川県', municipality: '茅ヶ崎市', name: '神奈川県立茅ケ崎高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', officialUrl: 'https://www.pen-kanagawa.ed.jp/chigasaki-h/' },
  { no: 82, prefecture: '神奈川県', municipality: '伊勢原市', name: '神奈川県立伊勢原高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', officialUrl: 'https://www.pen-kanagawa.ed.jp/isehara-h/' },
  { no: 83, prefecture: '神奈川県', municipality: '相模原市', name: '神奈川県立津久井高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', officialUrl: 'https://www.pen-kanagawa.ed.jp/tsukui-h/' },
  { no: 84, prefecture: '神奈川県', municipality: '小田原市', name: '神奈川県立小田原北高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', note: '工業科（機械・電気）', officialUrl: 'https://www.pen-kanagawa.ed.jp/odawarakita-h/teiji/index.html' },
  { no: 85, prefecture: '神奈川県', municipality: '横浜市', name: '神奈川県立神奈川工業高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', note: '普通科（単位制）。別に機械・電気・建設の工業科（学年制）も設置', officialUrl: 'https://www.pen-kanagawa.ed.jp/kanagawa-th/' },
  { no: 86, prefecture: '神奈川県', municipality: '横浜市', name: '神奈川県立横浜明朋高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.pen-kanagawa.ed.jp/y-meiho-h/' },
  { no: 87, prefecture: '神奈川県', municipality: '川崎市', name: '神奈川県立川崎高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.pen-kanagawa.ed.jp/kawasaki-h/index.html' },
  { no: 88, prefecture: '神奈川県', municipality: '平塚市', name: '神奈川県立高浜高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', note: '入学時に「プログレスコース」「スタンダードコース」を選択（部制表記はなし）', officialUrl: 'https://www.pen-kanagawa.ed.jp/takahama-h/' },
  { no: 89, prefecture: '神奈川県', municipality: '藤沢市', name: '神奈川県立湘南高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', parts: '夜間定時制（学年の区分を設けない単位制）', officialUrl: 'https://www.pen-kanagawa.ed.jp/shonan-h/index.html' },
  { no: 90, prefecture: '神奈川県', municipality: '小田原市', name: '神奈川県立小田原高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.pen-kanagawa.ed.jp/odawara-h/' },
  { no: 91, prefecture: '神奈川県', municipality: '厚木市', name: '神奈川県立厚木清南高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', nickname: 'フレキシブルスクール（学校全体の通称。定時制独自の通称ではない）', note: '全日制・定時制等3課程一体の「単位制普通科高校フレキシブルスクール」', officialUrl: 'https://www.pen-kanagawa.ed.jp/atsugiseinan-h/index.html' },
  { no: 92, prefecture: '神奈川県', municipality: '座間市', name: '神奈川県立相模向陽館高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', parts: '二部制（午前部8:50-14:15、午後部14:20-17:45）', officialUrl: 'https://www.pen-kanagawa.ed.jp/sagamikoyokan-h/' },
  { no: 93, prefecture: '神奈川県', municipality: '横浜市', name: '神奈川県立磯子工業高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', note: '総合学科（定時制）', officialUrl: 'https://www.pen-kanagawa.ed.jp/isogo-th/' },
  { no: 94, prefecture: '神奈川県', municipality: '川崎市', name: '神奈川県立向の岡工業高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', note: '総合学科（定時制）', officialUrl: 'https://www.pen-kanagawa.ed.jp/mukainooka-th/' },
  { no: 95, prefecture: '神奈川県', municipality: '秦野市', name: '神奈川県立秦野総合高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', note: '総合学科（定時制）', officialUrl: 'https://www.pen-kanagawa.ed.jp/hadanosogo-ih/' },
  { no: 96, prefecture: '神奈川県', municipality: '相模原市', name: '神奈川県立神奈川総合産業高等学校', publicPrivate: '公立', operator: '神奈川県教育委員会', curriculumType: '単位制', note: '総合学科（定時制、課程単位制総合学科）', officialUrl: 'https://www.pen-kanagawa.ed.jp/kanagawasogosangyo-h/' },

  // ===== 茨城県（13校） =====
  // 出典: https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf（県立高校一覧）
  //       https://www.kashimanada-h.ibk.ed.jp/wysiwyg/file/download/8/766（鹿島灘高等学校）
  { no: 97, prefecture: '茨城県', municipality: '高萩市', name: '高萩高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は普通科' },
  { no: 98, prefecture: '茨城県', municipality: '日立市', name: '日立工業高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は総合学科' },
  { no: 99, prefecture: '茨城県', municipality: '常陸太田市', name: '太田第一高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は普通科' },
  { no: 100, prefecture: '茨城県', municipality: '那珂市', name: '水戸農業高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は農業科' },
  { no: 101, prefecture: '茨城県', municipality: '水戸市', name: '水戸南高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制（普通科）に加え通信制課程も併設' },
  { no: 102, prefecture: '茨城県', municipality: '笠間市', name: 'IT未来高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は情報（IT科）' },
  { no: 103, prefecture: '茨城県', municipality: '鹿嶋市', name: '鹿島灘高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'standalone', parts: '午前部・午後部・夜間部（三部制）', curriculumType: '単位制', nickname: 'フレックススクール', officialUrl: 'https://www.kashimanada-h.ibk.ed.jp/wysiwyg/file/download/8/766', note: '鹿行地区唯一のフレックススクール（定時制・普通科）' },
  { no: 104, prefecture: '茨城県', municipality: '土浦市', name: '土浦第一高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は普通科' },
  { no: 105, prefecture: '茨城県', municipality: '石岡市', name: '石岡第一高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は普通科' },
  { no: 106, prefecture: '茨城県', municipality: '龍ケ崎市', name: '竜ヶ崎第一高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '学校名は出典PDF表記ママ（「竜ヶ崎」）' },
  { no: 107, prefecture: '茨城県', municipality: 'つくば市', name: '茎崎高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は普通科' },
  { no: 108, prefecture: '茨城県', municipality: '結城市', name: '結城第二高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は普通科' },
  { no: 109, prefecture: '茨城県', municipality: '古河市', name: '古河第一高等学校', publicPrivate: '公立', operator: '茨城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kyoiku.pref.ibaraki.jp/wp-content/uploads/2023/09/school-list.pdf', note: '定時制課程は普通科' },

  // ===== 栃木県（7校） =====
  // 出典: https://www.pref.tochigi.lg.jp/m04/r4boshuusuruseitozou.html（設置校一覧）
  //       各校個別の定時制課程案内PDF（pref.tochigi.lg.jp/m04/documents/63〜69番）
  { no: 110, prefecture: '栃木県', municipality: '宇都宮市', name: '宇都宮清陵高等学校', publicPrivate: '公立', operator: '栃木県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.tochigi.lg.jp/m04/documents/63_utsunomiyashougyou_teiji.pdf', note: '単位制夜間定時制高校（旧・宇都宮商業高等学校）' },
  { no: 111, prefecture: '栃木県', municipality: '鹿沼市', name: '鹿沼華陵高等学校', publicPrivate: '公立', operator: '栃木県教育委員会', schoolCategory: 'attached', parts: '夕間部・夜間部', curriculumType: '単位制', officialUrl: 'https://www.pref.tochigi.lg.jp/m04/documents/64_kanumashoukou_teiji.pdf', note: '平成17年に単位制へ移行（旧・鹿沼商工高等学校）' },
  { no: 112, prefecture: '栃木県', municipality: '栃木市', name: '学悠館高等学校', publicPrivate: '公立', operator: '栃木県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部（午前）・Ⅱ部（午後）・Ⅲ部（夜間）の三部制', curriculumType: '単位制', officialUrl: 'https://www.pref.tochigi.lg.jp/m04/documents/65_gakuyukan_teiji.pdf', note: '前期・後期の2学期制、最短3年・74単位で卒業可。少人数制、スクールカウンセラー対応あり' },
  { no: 113, prefecture: '栃木県', municipality: '足利市', name: '足利工業高等学校', publicPrivate: '公立', operator: '栃木県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.tochigi.lg.jp/m04/documents/66_ashikagakougyou_teiji.pdf', note: '学習時間帯は夕方/夜間/夕夜の選択制。三年次編入制度あり' },
  { no: 114, prefecture: '栃木県', municipality: '真岡市', name: '真岡高等学校', publicPrivate: '公立', operator: '栃木県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.tochigi.lg.jp/m04/documents/67_moka_teiji.pdf', note: '学習時間帯は夕方/夜間/夕夜の選択制' },
  { no: 115, prefecture: '栃木県', municipality: '大田原市', name: '大田原東高等学校', publicPrivate: '公立', operator: '栃木県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.tochigi.lg.jp/m04/documents/68_otawarahigashi_teiji.pdf', note: '卒業に74単位の修得が必要' },
  { no: 116, prefecture: '栃木県', municipality: '矢板市', name: '矢板東高等学校', publicPrivate: '公立', operator: '栃木県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.tochigi.lg.jp/m04/documents/69_yaitahigashi_teiji.pdf' },

  // ===== 群馬県（14校） =====
  // 出典: https://www.pref.gunma.jp/uploaded/attachment/643992.pdf（定員一覧PDF）
  //       https://www.pref.gunma.jp/uploaded/attachment/13649.pdf（前橋清陵高等学校）
  //       https://www.pref.gunma.jp/uploaded/attachment/695130.pdf（太田フレックス高等学校）
  { no: 117, prefecture: '群馬県', municipality: '前橋市', name: '前橋工業高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は機械・建築' },
  { no: 118, prefecture: '群馬県', municipality: '前橋市', name: '前橋清陵高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'standalone', parts: '昼間部・夜間部（各普通科2学級）', curriculumType: '単位制（無学年制）', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/13649.pdf', note: '2学期制、定通併修・科目履修生受入れ・技能連携を実施' },
  { no: 119, prefecture: '群馬県', municipality: '高崎市', name: '高崎工業高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は工業技術' },
  { no: 120, prefecture: '群馬県', municipality: '高崎市', name: '高崎商業高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は商業' },
  { no: 121, prefecture: '群馬県', municipality: '桐生市', name: '桐生工業高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は工業技術' },
  { no: 122, prefecture: '群馬県', municipality: '伊勢崎市', name: '伊勢崎工業高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は工業技術' },
  { no: 123, prefecture: '群馬県', municipality: '渋川市', name: '渋川工業高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は工業技術' },
  { no: 124, prefecture: '群馬県', municipality: '藤岡市', name: '藤岡中央高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は普通科' },
  { no: 125, prefecture: '群馬県', municipality: '富岡市', name: '富岡高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は普通科' },
  { no: 126, prefecture: '群馬県', municipality: '安中市', name: '安中総合学園高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は普通科' },
  { no: 127, prefecture: '群馬県', municipality: '館林市', name: '館林高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は普通科' },
  { no: 128, prefecture: '群馬県', municipality: '沼田市', name: '沼田高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '定時制課程は普通科（出典PDF上は「沼田（新設）」と表記）' },
  { no: 129, prefecture: '群馬県', municipality: '桐生市', name: '桐生市立商業高等学校', publicPrivate: '公立', operator: '桐生市教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/643992.pdf', note: '県立ではなく市立。定時制課程は商業' },
  { no: 130, prefecture: '群馬県', municipality: '太田市', name: '太田フレックス高等学校', publicPrivate: '公立', operator: '群馬県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部（午前）・Ⅱ部（午後）・Ⅲ部（夜間）', curriculumType: '単位制', officialUrl: 'https://www.pref.gunma.jp/uploaded/attachment/695130.pdf', note: '2004年創立。通信制課程も併設。2024年度から日本語基礎・日本語Ⅰを開講し日本語指導支援員を配置' },

  // ===== 千葉県（16校） =====
  // 出典: https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html
  //       （出典ページに「県立高校の定時制はすべて単位制」と明記。市区町村の記載はなく、ここでは省略している）
  { no: 131, prefecture: '千葉県', name: '千葉商業高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は商業' },
  { no: 132, prefecture: '千葉県', name: '千葉工業高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は工業' },
  { no: 133, prefecture: '千葉県', name: '生浜高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'standalone', parts: '三部制（普通科）', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '千葉県内の多部制（三部制）定時制3校のうちの1校' },
  { no: 134, prefecture: '千葉県', name: '船橋高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は総合学科（令和4年度から）' },
  { no: 135, prefecture: '千葉県', name: '市川工業高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は工業' },
  { no: 136, prefecture: '千葉県', name: '松戸南高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'standalone', parts: '三部制（普通科）', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '千葉県内の多部制（三部制）定時制3校のうちの1校' },
  { no: 137, prefecture: '千葉県', name: '東葛飾高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },
  { no: 138, prefecture: '千葉県', name: '佐倉南高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'standalone', parts: '三部制（普通科）', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '令和4年度から設置。千葉県内3校のうちの1校' },
  { no: 139, prefecture: '千葉県', name: '佐原高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },
  { no: 140, prefecture: '千葉県', name: '銚子商業高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は商業' },
  { no: 141, prefecture: '千葉県', name: '匝瑳高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },
  { no: 142, prefecture: '千葉県', name: '東金高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },
  { no: 143, prefecture: '千葉県', name: '長生高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },
  { no: 144, prefecture: '千葉県', name: '長狭高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },
  { no: 145, prefecture: '千葉県', name: '館山総合高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },
  { no: 146, prefecture: '千葉県', name: '木更津東高等学校', publicPrivate: '公立', operator: '千葉県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', officialUrl: 'https://www.pref.chiba.lg.jp/kyouiku/jisei/seitoshidou/kousoku/ichiran.html', note: '定時制課程は普通科' },

  // ===== 秋田県（4校） =====
  // 出典: https://www.pref.akita.lg.jp/uploads/public/archive_0000049957_00/秋田県高等学校一覧.pdf（秋田県教育委員会）
  // 2回の調査でこの4校以外の定時制設置校は確認できなかった。部制・単位制/学年制・通称・公式URLは
  // 出典資料に記載がなく、各校公式サイトも検索で特定できなかったため省略している。
  { no: 147, prefecture: '秋田県', municipality: '大館市', name: '大館鳳鳴高等学校', publicPrivate: '公立', operator: '秋田県教育委員会', schoolCategory: 'attached', note: '定時制課程を併設' },
  { no: 148, prefecture: '秋田県', municipality: '能代市', name: '能代高等学校', publicPrivate: '公立', operator: '秋田県教育委員会', schoolCategory: 'attached', note: '定時制課程を併設' },
  { no: 149, prefecture: '秋田県', municipality: '仙北市', name: '角館高等学校', publicPrivate: '公立', operator: '秋田県教育委員会', schoolCategory: 'attached', note: '定時制課程を併設' },
  { no: 150, prefecture: '秋田県', municipality: '横手市', name: '横手高等学校', publicPrivate: '公立', operator: '秋田県教育委員会', schoolCategory: 'attached', note: '定時制課程を併設' },

  // ===== 福島県（6校） =====
  // 出典: https://www.pref.fukushima.lg.jp/uploaded/attachment/600080.pdf（福島県教育委員会、入学者選抜関連資料）
  //       各校公式サイト（fcs.ed.jp ドメイン）の募集要項・学校案内
  { no: 151, prefecture: '福島県', municipality: '福島市', name: 'ふくしま新世高等学校', publicPrivate: '公立', operator: '福島県教育委員会', schoolCategory: 'standalone', parts: '夕間部・夜間部', officialUrl: 'https://fukushimashinsei-h.fcs.ed.jp/', note: '定時制普通科。夕間部は15:40〜19:25、夜間部は17:25〜21:05。夕間部は3年間での卒業も選択可能。所在地（福島市渡利七社宮17）はベネッセ提供データのみでの確認で、県教委・学校公式資料による独立した裏付けは取れていない。' },
  { no: 152, prefecture: '福島県', municipality: '郡山市', name: '郡山萌世高等学校', publicPrivate: '公立', operator: '福島県教育委員会', schoolCategory: 'standalone', parts: '昼間主コース（募集120名）・夜間主コース（募集40名）', officialUrl: 'https://housei-h.fcs.ed.jp/', note: '定時制普通科。通信制課程も併設。' },
  { no: 153, prefecture: '福島県', municipality: '白河市', name: '白河第二高等学校', publicPrivate: '公立', operator: '福島県教育委員会', schoolCategory: 'standalone', parts: '夜間', officialUrl: 'https://shirakawa2-h.fcs.ed.jp/', note: '夜間定時制普通科。1学年1クラスでクラス替えなし、1日4校時、卒業まで4年。' },
  { no: 154, prefecture: '福島県', municipality: '会津若松市', name: '会津第二高等学校', publicPrivate: '公立', operator: '福島県教育委員会', schoolCategory: 'standalone', parts: '夜間', officialUrl: 'https://aizu2-h.fcs.ed.jp/', note: '定時制普通科（夜間）。在籍校での修得単位数に応じた編入学年の募集あり。' },
  { no: 155, prefecture: '福島県', municipality: 'いわき市', name: 'いわき翠の杜高等学校', publicPrivate: '公立', operator: '福島県教育委員会', schoolCategory: 'standalone', parts: '夜間主コース・昼間主コース', curriculumType: '単位制', officialUrl: 'https://iwakimidorinomori-h.fcs.ed.jp/', note: '定時制普通科。募集要項に「単位制による」と明記。' },
  { no: 156, prefecture: '福島県', municipality: '福島市', name: '福島工業高等学校', publicPrivate: '公立', operator: '福島県教育委員会', schoolCategory: 'attached', parts: '夜間', officialUrl: 'https://fukushima-th.fcs.ed.jp/', note: '定時制（夜間）工業科。修業年限4年だが3年修了制を選択可能。2年次から機械コース・建築コースに分かれる。' },

  // ===== 岩手県（9校） =====
  // 出典: 令和7年度岩手県立高等学校入学者選抜実施一覧表 https://www.pref.iwate.jp/_res/projects/default_project/_page_/001/069/076/ichiranhyou.pdf
  //       各校公式サイト（www2.iwate-ed.jp ドメイン）の募集要項PDF
  { no: 157, prefecture: '岩手県', municipality: '盛岡市', name: '岩手県立杜陵高等学校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'standalone', parts: '3部制（1部・2部・3部）', officialUrl: 'https://www2.iwate-ed.jp/tor-h/', note: '定時制専門校（通信制も併置）' },
  { no: 158, prefecture: '岩手県', municipality: '奥州市', name: '岩手県立杜陵高等学校奥州校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', parts: '2部制（昼間部・夜間部）', curriculumType: '単位制（年次制）', officialUrl: 'https://www2.iwate-ed.jp/osh-h/', note: '岩手県立杜陵高等学校の校舎（分校）' },
  { no: 159, prefecture: '岩手県', municipality: '盛岡市', name: '岩手県立盛岡工業高等学校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www2.iwate-ed.jp/mot-h/', note: '定時制課程（工業科）に「4年卒業コース」「3年卒業コース」の記載あり' },
  { no: 160, prefecture: '岩手県', municipality: '一関市', name: '岩手県立一関第一高等学校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www2.iwate-ed.jp/ic1-h/', note: '定時制課程は4年制' },
  { no: 161, prefecture: '岩手県', municipality: '大船渡市', name: '岩手県立大船渡高等学校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www2.iwate-ed.jp/ofu-h/' },
  { no: 162, prefecture: '岩手県', municipality: '釜石市', name: '岩手県立釜石高等学校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www2.iwate-ed.jp/kas-h/' },
  { no: 163, prefecture: '岩手県', municipality: '宮古市', name: '岩手県立宮古高等学校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www2.iwate-ed.jp/myh-h/' },
  { no: 164, prefecture: '岩手県', municipality: '久慈市', name: '岩手県立久慈高等学校長内校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', parts: '2部制（昼間部・夜間部）', officialUrl: 'https://www2.iwate-ed.jp/kuo-h/', note: '入学者選抜一覧表では「久慈長内」と表記' },
  { no: 165, prefecture: '岩手県', municipality: '二戸市', name: '岩手県立福岡高等学校', publicPrivate: '公立', operator: '岩手県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www2.iwate-ed.jp/fuk-h/' },

  // ===== 宮城県（12校） =====
  // 出典: https://www.pref.miyagi.jp/site/kyouiku/koukou.html（県立・市立高校一覧）
  //       県立各校「スクール・ポリシー」PDF（pref.miyagi.jp/documents/65121/b01〜b11.pdf）
  //       仙台市立「スクール・ポリシー」PDF（city.sendai.jp）
  { no: 166, prefecture: '宮城県', municipality: '刈田郡七ヶ宿町', name: '宮城県白石高等学校　七ケ宿校', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://sitika.myswan.ed.jp/', note: '昼間定時制。普通科。3年で卒業できる「3修制」。小規模校、習熟度別学習・学び直し支援あり。' },
  { no: 167, prefecture: '宮城県', municipality: '仙台市青葉区', name: '宮城県第二工業高等学校', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'standalone', officialUrl: 'https://m2k.myswan.ed.jp/', note: '4年間の夜間定時制課程。電子機械科・電気科。電気科は第三種電気主任技術者認定校。' },
  { no: 168, prefecture: '宮城県', municipality: '岩沼市', name: '宮城県名取高等学校　定時制', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://natori-2h.myswan.ed.jp/', note: '夜間4年制の普通科。組織的な教育相談、完全給食制あり。' },
  { no: 169, prefecture: '宮城県', municipality: '多賀城市', name: '宮城県貞山高等学校', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'standalone', parts: '昼間部・夜間部（二部制）', curriculumType: '単位制', officialUrl: 'https://teizan.myswan.ed.jp/', note: '昼夜間二部制・単位制の普通科。昼間部・夜間部間の併修課程あり。3年での卒業可能。' },
  { no: 170, prefecture: '宮城県', municipality: '大崎市', name: '宮城県古川工業高等学校　定時制', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://furuk2-h.myswan.ed.jp/', note: '夜間定時制。機械科・電気科。4年間で80単位修得、4年次に課題研究。' },
  { no: 171, prefecture: '宮城県', municipality: '大崎市', name: '宮城県田尻さくら高等学校', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部・Ⅱ部', curriculumType: '単位制の多部制定時制', officialUrl: 'https://tajiri-hs.myswan.ed.jp/', note: '普通科にⅠ部・Ⅱ部。選択履修制度による「自分の時間割」。少人数授業によるきめ細かな支援。' },
  { no: 172, prefecture: '宮城県', municipality: '登米市', name: '宮城県佐沼高等学校　定時制', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://sanuma-teiji.myswan.ed.jp/', note: '普通科。「働きながら学ぶ定時制」。' },
  { no: 173, prefecture: '宮城県', municipality: '東松島市', name: '宮城県東松島高等学校', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部・Ⅱ部・Ⅲ部（各部定員40人）', curriculumType: '三部制・単位制', officialUrl: 'https://higashi-matsushima.myswan.ed.jp/', note: '普通科。200を超える授業講座、習熟度別・少人数授業、ICT活用、芸術・福祉科目重視。' },
  { no: 174, prefecture: '宮城県', municipality: '石巻市', name: '宮城県石巻北高等学校　飯野川校', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://i13-hama.myswan.ed.jp/', note: '普通科。各年次1クラス計4クラスの小規模校。国語・数学・英語で習熟度別授業、学び直し担当教員配置。' },
  { no: 175, prefecture: '宮城県', municipality: '気仙沼市', name: '宮城県気仙沼高等学校　定時制', publicPrivate: '公立', operator: '宮城県教育委員会', schoolCategory: 'attached', officialUrl: 'https://kesennuma-teiji.myswan.ed.jp/', note: '普通科。三年修業制・定通併修制あり。「学び直し」授業、ICT活用。' },
  { no: 176, prefecture: '宮城県', municipality: '仙台市宮城野区', name: '仙台市立仙台工業高等学校（定時制課程）', publicPrivate: '公立', operator: '仙台市教育委員会', schoolCategory: 'attached', officialUrl: 'https://sendai-c.ed.jp/~sen2kou/', note: '建築土木科・機械システム科。全日制課程と施設・設備を共用。' },
  { no: 177, prefecture: '宮城県', municipality: '仙台市宮城野区', name: '仙台市立仙台大志高等学校', publicPrivate: '公立', operator: '仙台市教育委員会', schoolCategory: 'standalone', note: '普通科。進路目標や生活スタイルに応じて生徒自身が時間割を作成する制度あり。習熟度別授業あり。' },

  // ===== 北海道（40校） =====
  // 出典: 北海道教育委員会「定時制・通信制課程のある高校」一覧 https://www.dokyoi.pref.hokkaido.lg.jp/hk/kki/teiji.html（全道一覧の一次ソース）
  //       各校公式サイト
  // 大半の校で部制・単位制/学年制は公式サイトから確認できず省略している。市区町村は校名に地名を
  // 含むもの・公式サイトの住所記載があるものに限り記載（校名からの推測であることをnoteに明記したものを含む）。
  { no: 178, prefecture: '北海道', municipality: '岩見沢市', name: '北海道岩見沢東高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.iwamizawahigashi.hokkaido-c.ed.jp/' },
  { no: 179, prefecture: '北海道', municipality: '滝川市', name: '北海道滝川高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.takikawa.hokkaido-c.ed.jp/' },
  { no: 180, prefecture: '北海道', municipality: '札幌市', name: '北海道札幌東高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.sapporohigashi.hokkaido-c.ed.jp/teiji' },
  { no: 181, prefecture: '北海道', municipality: '札幌市', name: '北海道札幌南高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.sapporominami.hokkaido-c.ed.jp/' },
  { no: 182, prefecture: '北海道', municipality: '札幌市', name: '北海道札幌月寒高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.sapporotsukisamu.hokkaido-c.ed.jp/' },
  { no: 183, prefecture: '北海道', municipality: '札幌市', name: '北海道札幌琴似工業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.sapporokotonikougyou.hokkaido-c.ed.jp/' },
  { no: 184, prefecture: '北海道', municipality: '江別市', name: '北海道江別高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.ebetsu.hokkaido-c.ed.jp' },
  { no: 185, prefecture: '北海道', municipality: '恵庭市', name: '北海道恵庭南高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', parts: '夜間', officialUrl: 'http://www.eniwaminami.hokkaido-c.ed.jp/', note: '定時制課程（夜間）普通科' },
  { no: 186, prefecture: '北海道', municipality: '札幌市', name: '北海道札幌西高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.sapporonishi.hokkaido-c.ed.jp/' },
  { no: 187, prefecture: '北海道', municipality: '札幌市', name: '北海道札幌北高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', parts: '夜間定時制', nickname: '北定（キタテイ）', officialUrl: 'http://www.sapporokita.hokkaido-c.ed.jp/teiji/', note: '修業年限4年' },
  { no: 188, prefecture: '北海道', municipality: '札幌市', name: '北海道札幌工業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.sakko.hokkaido-c.ed.jp/parttime/pindex.html' },
  { no: 189, prefecture: '北海道', municipality: '札幌市', name: '北海道有朋高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'standalone', parts: '3部制（Ⅰ部・Ⅱ部・Ⅲ部）', curriculumType: '単位制（完全単位制・無学年制）', officialUrl: 'http://www.yuho.hokkaido-c.ed.jp/', note: '定時制と通信制の両課程を設置' },
  { no: 190, prefecture: '北海道', municipality: '千歳市', name: '北海道千歳高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.chitose.hokkaido-c.ed.jp/menu/teiji/teiji1.html', note: '定時制課程普通科、募集40名（令和8年度）' },
  { no: 191, prefecture: '北海道', municipality: '札幌市', name: '市立札幌大通高等学校', publicPrivate: '公立', operator: '札幌市教育委員会', schoolCategory: 'standalone', parts: '3部制（午前部・午後部・夜間部）', curriculumType: '単位制', officialUrl: 'http://www.odori-h.sapporo-c.ed.jp/index.html' },
  { no: 192, prefecture: '北海道', municipality: '小樽市', name: '北海道小樽潮陵高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.otaruchouryou.hokkaido-c.ed.jp/?page_id=18', note: '普通科定時制課程' },
  { no: 193, prefecture: '北海道', municipality: 'ニセコ町', name: '北海道ニセコ高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'https://niseko-highschool.jp/', note: '市区町村は校名からの判断（公式サイト本文での住所の直接確認はできていない）' },
  { no: 194, prefecture: '北海道', municipality: '留寿都村', name: '北海道留寿都高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.phoenix-c.or.jp/~rusutu1/', note: '市区町村は校名からの判断（公式サイト本文での住所の直接確認はできていない）' },
  { no: 195, prefecture: '北海道', municipality: '小樽市', name: '北海道小樽未来創造高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'standalone', curriculumType: '単位制', officialUrl: 'http://www.miraisouzou.hokkaido-c.ed.jp/', note: '公式サイトに「道内唯一の単位制専門高校」と記載' },
  { no: 196, prefecture: '北海道', municipality: '真狩村', name: '北海道真狩高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.makkari-koukou.server-shared.com/', note: '市区町村は校名からの判断（公式サイト本文での住所の直接確認はできていない）' },
  { no: 197, prefecture: '北海道', municipality: '室蘭市', name: '北海道室蘭栄高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.muroransakae.hokkaido-c.ed.jp/bank/page/top0.html' },
  { no: 198, prefecture: '北海道', municipality: '苫小牧市', name: '北海道苫小牧工業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.tomakou.hokkaido-c.ed.jp/' },
  { no: 199, prefecture: '北海道', municipality: '苫小牧市', name: '北海道苫小牧東高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.tomahigashi.hokkaido-c.ed.jp/teiji/index02.html' },
  { no: 200, prefecture: '北海道', name: '北海道日高高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.hokkaido-hidaka-hs.jp/htdocs/', note: '所在市町村は公式ソースで確認できず省略' },
  { no: 201, prefecture: '北海道', municipality: '函館市', name: '北海道函館中部高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.kanchu.hokkaido-c.ed.jp/' },
  { no: 202, prefecture: '北海道', municipality: '函館市', name: '北海道函館工業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.kanko.hokkaido-c.ed.jp/' },
  { no: 203, prefecture: '北海道', municipality: '函館市', name: '北海道函館商業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.hakodateshougyou.hokkaido-c.ed.jp/' },
  { no: 204, prefecture: '北海道', municipality: '旭川市', name: '北海道旭川東高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.ah.hokkaido-c.ed.jp/teiji/', note: '定時制課程' },
  { no: 205, prefecture: '北海道', municipality: '旭川市', name: '北海道旭川商業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.kyokusyo.hokkaido-c.ed.jp/teijihp/top/top_school.html' },
  { no: 206, prefecture: '北海道', municipality: '士別市', name: '北海道士別東高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://academic1.plala.or.jp/seh/', note: '市区町村は校名からの判断（公式サイト本文での住所の直接確認はできていない）' },
  { no: 207, prefecture: '北海道', municipality: '旭川市', name: '北海道旭川北高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.asahikawakita.hokkaido-c.ed.jp/kitapage/kitateijihomepage1/framepage.htm' },
  { no: 208, prefecture: '北海道', municipality: '旭川市', name: '北海道旭川工業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://kyokko.ed.jp/' },
  { no: 209, prefecture: '北海道', municipality: '幌加内町', name: '北海道幌加内高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.infosnow.ne.jp/horokanai/', note: '市区町村は校名からの判断（公式サイト本文での住所の直接確認はできていない）' },
  { no: 210, prefecture: '北海道', name: '北海道天売高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.teuri.ed.jp/index.html', note: '天売島に所在するが行政区分（市町村）は公式ソースで確認できず省略' },
  { no: 211, prefecture: '北海道', municipality: '稚内市', name: '北海道稚内高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.chikou.hokkaido-c.ed.jp/', note: '定時制課程' },
  { no: 212, prefecture: '北海道', municipality: '北見市', name: '北海道北見北斗高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.kitamihokuto.hokkaido-c.ed.jp/' },
  { no: 213, prefecture: '北海道', municipality: '遠軽町', name: '北海道遠軽高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.engaru.hokkaido-c.ed.jp/' },
  { no: 214, prefecture: '北海道', municipality: '網走市', name: '北海道網走南ケ丘高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.abanan.hokkaido-c.ed.jp/' },
  { no: 215, prefecture: '北海道', municipality: '帯広市', name: '北海道帯広柏葉高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.obihirohakuyou.hokkaido-c.ed.jp/' },
  { no: 216, prefecture: '北海道', municipality: '釧路市', name: '北海道釧路湖陵高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.koryo946.hokkaido-c.ed.jp/?page_id=22', note: '普通科' },
  { no: 217, prefecture: '北海道', municipality: '釧路市', name: '北海道釧路工業高等学校', publicPrivate: '公立', operator: '北海道教育委員会', schoolCategory: 'attached', officialUrl: 'http://www.kushiro-th.hokkaido-c.ed.jp/' },

  // ===== 青森県（6校） =====
  // 出典: https://www.pref.aomori.lg.jp/soshiki/kyoiku/e-gakyo/files/R8teiji_saibojinnin.pdf 他、各校公式サイト
  { no: 218, prefecture: '青森県', municipality: '青森市', name: '青森県立北斗高等学校', publicPrivate: '公立', operator: '青森県教育委員会', schoolCategory: 'standalone', parts: '午前部・午後部・夜間部（3部制）', curriculumType: '単位制', officialUrl: 'https://www.hokuto-h.asn.ed.jp/', note: '普通科。定時制と通信制を設置する独立校' },
  { no: 219, prefecture: '青森県', municipality: '平川市', name: '青森県立尾上総合高等学校', publicPrivate: '公立', operator: '青森県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部（昼間）・Ⅱ部（昼間）・Ⅲ部（夜間）の3部制', curriculumType: '単位制', officialUrl: 'https://www.onoe-ih.asn.ed.jp/', note: '総合学科' },
  { no: 220, prefecture: '青森県', municipality: '八戸市', name: '青森県立八戸中央高等学校', publicPrivate: '公立', operator: '青森県教育委員会', schoolCategory: 'standalone', parts: '午前部・午後部・夜間部（3部制）', curriculumType: '単位制', officialUrl: 'https://www.hachinohechuo-h.asn.ed.jp/', note: '普通科。原級留置なし' },
  { no: 221, prefecture: '青森県', municipality: '五所川原市', name: '青森県立五所川原高等学校', publicPrivate: '公立', operator: '青森県教育委員会', schoolCategory: 'attached', parts: '夜間', officialUrl: 'https://www.goshogawara-h.asn.ed.jp/' },
  { no: 222, prefecture: '青森県', municipality: '三沢市', name: '青森県立三沢高等学校', publicPrivate: '公立', operator: '青森県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.misawa-h.asn.ed.jp/', note: '全日制（普通科）に併置' },
  { no: 223, prefecture: '青森県', municipality: 'むつ市', name: '青森県立田名部高等学校', publicPrivate: '公立', operator: '青森県教育委員会', schoolCategory: 'attached', officialUrl: 'https://www.tanabu-h.asn.ed.jp/', note: '全日制普通科単位制に併置。定時制は1学級40名（R7入学）' },

  // ===== 山形県（5校） =====
  // 出典: https://www.pref.yamagata.jp/documents/42443/r08jisshikouichiran.pdf（県立高校一覧表）他
  { no: 224, prefecture: '山形県', municipality: '山形市', name: '山形県立霞城学園高等学校', publicPrivate: '公立', operator: '山形県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部（午前）・Ⅱ部（午後）・Ⅲ部（夜間）の3部制', curriculumType: '単位制', note: '普通科（定時制）。通信制（普通科・服飾科）も併設。全日制は置かず独立校。霞城セントラル内に所在' },
  { no: 225, prefecture: '山形県', municipality: '新庄市', name: '山形県立新庄志誠館高等学校', publicPrivate: '公立', operator: '山形県教育委員会', schoolCategory: 'attached', parts: '夜間', note: '普通科。全日制に併置。「最北地区唯一の定時制の課程」。2026年4月、新庄北高校と新庄南高校の統合で開校' },
  { no: 226, prefecture: '山形県', municipality: '米沢市', name: '山形県立米沢鶴城高等学校', publicPrivate: '公立', operator: '山形県教育委員会', schoolCategory: 'attached', parts: '午前', note: '総合学科。全日制（工業科・商業科）に併置。「置賜地区唯一の定時制高校」' },
  { no: 227, prefecture: '山形県', municipality: '東田川郡庄内町', name: '山形県立庄内総合高等学校', publicPrivate: '公立', operator: '山形県教育委員会', schoolCategory: 'attached', parts: '昼間', note: '総合学科。全日制・通信制と一体的に運営' },
  { no: 228, prefecture: '山形県', municipality: '酒田市', name: '山形県立酒田西高等学校（定時制）', publicPrivate: '公立', operator: '山形県教育委員会', schoolCategory: 'attached', note: '全日制とは別校舎。2012年に酒田商業高校の定時制が統合移管' },

  // ===== 新潟県（9校） =====
  // 出典: 新潟県教育委員会告示第１号（令和8年3月17日付）、公立高等学校入学者選抜実施要綱（令和6・7年県報）
  //       各校公式サイト（nein.ed.jp ドメイン）
  { no: 229, prefecture: '新潟県', municipality: '村上市', name: '新潟県立荒川高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'standalone', parts: '午前部', curriculumType: '単位制', note: '全日制は確認できず、定時制のみ' },
  { no: 230, prefecture: '新潟県', municipality: '新発田市', name: '新潟県立西新発田高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'standalone', parts: '午前部', curriculumType: '単位制', officialUrl: 'https://nishishibata-h.nein.ed.jp/' },
  { no: 231, prefecture: '新潟県', municipality: '新潟市西区', name: '新潟県立新潟翠江高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'standalone', parts: '午前部', curriculumType: '単位制', officialUrl: 'https://niigatasuikou-h.nein.ed.jp/', note: '全日制なし。定時制（単位制）と通信制課程のみを置く学校' },
  { no: 232, prefecture: '新潟県', municipality: '長岡市', name: '新潟県立長岡明徳高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'standalone', parts: '午前部・夜間部', curriculumType: '単位制', officialUrl: 'https://nagaokameitoku-h.nein.ed.jp/', note: '定時制課程のみ（全日制の記載なし）' },
  { no: 233, prefecture: '新潟県', municipality: '三島郡出雲崎町', name: '新潟県立出雲崎高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'standalone', parts: '午前部', curriculumType: '単位制', note: '全日制なし' },
  { no: 234, prefecture: '新潟県', municipality: '魚沼市', name: '新潟県立堀之内高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'standalone', parts: '午前部', curriculumType: '単位制', officialUrl: 'https://horinouchi-h.nein.ed.jp/', note: '全日制の記載なし（定時制課程のみ掲載）' },
  { no: 235, prefecture: '新潟県', municipality: '十日町市', name: '新潟県立十日町高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'attached', note: '全日制と定時制を併設。部制・単位制/学年制は県資料に記載なし' },
  { no: 236, prefecture: '新潟県', municipality: '上越市', name: '新潟県立高田南城高等学校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'standalone', parts: '午前部', curriculumType: '単位制', officialUrl: 'https://takadammsr-h.nein.ed.jp/', note: '全日制なし。定時制（単位制）と通信制課程を置く学校' },
  { no: 237, prefecture: '新潟県', municipality: '佐渡市', name: '新潟県立佐渡高等学校　相川分校', publicPrivate: '公立', operator: '新潟県教育委員会', schoolCategory: 'attached', parts: '午前部', curriculumType: '単位制', note: '本校（佐渡高等学校、全日制・学年制）の分校' },

  // ===== 富山県（6校） =====
  // 出典: 富山県教育委員会「令和8年度富山県立高等学校入学者選抜」資料 https://www.pref.toyama.jp/documents/47208/r8minasan.pdf
  { no: 238, prefecture: '富山県', municipality: '魚津市', name: '新川みどり野高校', publicPrivate: '公立', operator: '富山県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.midorino-h.tym.ed.jp' },
  { no: 239, prefecture: '富山県', municipality: '富山市', name: '富山工業高校', publicPrivate: '公立', operator: '富山県教育委員会', officialUrl: 'https://www.toyama-th.tym.ed.jp', note: '定時制（夜間）。単位制ではないと公式資料に明記' },
  { no: 240, prefecture: '富山県', municipality: '富山市', name: '雄峰高校', publicPrivate: '公立', operator: '富山県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.yuho-h.tym.ed.jp', note: '定時制・通信制の両方を設置' },
  { no: 241, prefecture: '富山県', municipality: '高岡市', name: '志貴野高校', publicPrivate: '公立', operator: '富山県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.shikino-h.tym.ed.jp' },
  { no: 242, prefecture: '富山県', municipality: '小矢部市', name: '小矢部園芸高校', publicPrivate: '公立', operator: '富山県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.oyabeengei-h.tym.ed.jp' },
  { no: 243, prefecture: '富山県', municipality: '小矢部市', name: 'となみ野高校', publicPrivate: '公立', operator: '富山県教育委員会', curriculumType: '単位制', officialUrl: 'https://www.tonamino-h.tym.ed.jp' },

  // ===== 石川県（6校） =====
  // 出典: 石川県教育委員会「外国人生徒等に係る特別入学実施校」一覧 https://cms1.ishikawa-c.ed.jp/wazith/wysiwyg/file/download/1/1377
  { no: 244, prefecture: '石川県', name: '加賀聖城高校', publicPrivate: '公立', operator: '石川県教育委員会', note: '定時制：普通科（夜間・午前・午後）、総合学科（夜間・午前・午後）を設置' },
  { no: 245, prefecture: '石川県', name: '小松北高校', publicPrivate: '公立', operator: '石川県教育委員会' },
  { no: 246, prefecture: '石川県', municipality: '金沢市', name: '金沢中央高校', publicPrivate: '公立', operator: '石川県教育委員会', curriculumType: '単位制', note: '単位制総合学科' },
  { no: 247, prefecture: '石川県', name: '羽松高校', publicPrivate: '公立', operator: '石川県教育委員会', note: '定時制：普通科（午前）を設置' },
  { no: 248, prefecture: '石川県', name: '七尾城北高校', publicPrivate: '公立', operator: '石川県教育委員会', note: '定時制：普通科（夜間）を設置' },
  { no: 249, prefecture: '石川県', name: '輪島高校', publicPrivate: '公立', operator: '石川県教育委員会', note: '定時制：普通科（夜間）を設置' },

  // ===== 福井県（7校） =====
  // 出典: 福井県教育委員会「令和8年度福井県立高等学校入学者選抜実施要項」 https://www.pref.fukui.lg.jp/doc/koukou/nyugaku/r08youkou_d/fil/R08annai.pdf
  { no: 250, prefecture: '福井県', municipality: '坂井市', name: '丸岡高校', publicPrivate: '公立', operator: '福井県教育委員会', schoolCategory: 'attached', note: '定時制。募集人員40名。昭和39年「城東分校（定時制）」として開校' },
  { no: 251, prefecture: '福井県', municipality: '大野市', name: '大野高校', publicPrivate: '公立', operator: '福井県教育委員会', schoolCategory: 'attached', note: '定時制。募集人員30名' },
  { no: 252, prefecture: '福井県', municipality: '鯖江市', name: '鯖江高校', publicPrivate: '公立', operator: '福井県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', parts: '昼間部のみ', note: '定時制。募集人員30名。平成22年度より単位制・2学期制、令和元年度より夜間部を廃止し昼間部のみに' },
  { no: 253, prefecture: '福井県', municipality: '越前市', name: '武生高校', publicPrivate: '公立', operator: '福井県教育委員会', schoolCategory: 'attached', note: '定時制。募集人員80名' },
  { no: 254, prefecture: '福井県', municipality: '敦賀市', name: '敦賀高校', publicPrivate: '公立', operator: '福井県教育委員会', schoolCategory: 'attached', note: '定時制。募集人員30名' },
  { no: 255, prefecture: '福井県', municipality: '小浜市', name: '若狭高校', publicPrivate: '公立', operator: '福井県教育委員会', schoolCategory: 'attached', note: '定時制。募集人員30名' },
  { no: 256, prefecture: '福井県', municipality: '福井市', name: '道守高等学校', publicPrivate: '公立', operator: '福井県教育委員会', schoolCategory: 'standalone', parts: '午前部・午後部・夜間部', note: '定時制・通信制の独立校。募集人員（定時制）110名（午前40・午後40・夜間30）。1971年、定時制・通信制教育のモデル校として開校' },

  // ===== 静岡県（21校） =====
  // 出典: 静岡県教育委員会公式サイト（各校の定時制課程ページ）
  //       https://www.pref.shizuoka.jp/_res/projects/default_project/_page_/001/031/855/nanateiji.pdf（定時制所在地一覧）
  //       https://www.pref.shizuoka.jp/_res/projects/default_project/_page_/001/031/399/r7gakkoumeibo_kakutei.pdf（静岡県立学校名簿）
  { no: 257, prefecture: '静岡県', municipality: '下田市', name: '静岡県立下田高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 258, prefecture: '静岡県', municipality: '伊東市', name: '静岡県立伊豆伊東高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 259, prefecture: '静岡県', municipality: '三島市', name: '静岡県立三島長陵高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', parts: '3部制（1部・2部・3部、午前・午後・夜間）', curriculumType: '単位制' },
  { no: 260, prefecture: '静岡県', municipality: '駿東郡小山町', name: '静岡県立小山高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', curriculumType: '学年制' },
  { no: 261, prefecture: '静岡県', municipality: '沼津市', name: '静岡県立沼津工業高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', parts: '夜間', note: '工業' },
  { no: 262, prefecture: '静岡県', municipality: '富士市', name: '静岡県立富士高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', curriculumType: '学年制' },
  { no: 263, prefecture: '静岡県', municipality: '富士宮市', name: '静岡県立富士宮東高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 264, prefecture: '静岡県', municipality: '静岡市清水区', name: '静岡県立清水東高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 265, prefecture: '静岡県', municipality: '静岡市葵区', name: '静岡県立静岡高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', parts: '夜間' },
  { no: 266, prefecture: '静岡県', municipality: '静岡市葵区', name: '静岡県立科学技術高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', parts: '夜間', note: '工業' },
  { no: 267, prefecture: '静岡県', municipality: '静岡市葵区', name: '静岡県立静岡中央高等学校（定時制）', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', parts: '3コース制（aコース=午前、bコース=午後、cコース=夜間）', curriculumType: '単位制（学年のない単位制）' },
  { no: 268, prefecture: '静岡県', municipality: '島田市', name: '静岡県立島田商業高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', curriculumType: '学年制', note: '商業。令和6年度以降の生徒募集を停止し、志太榛原地域の再編統合校へ移行中' },
  { no: 269, prefecture: '静岡県', municipality: '島田市', name: '静岡県立ふじのくに国際高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', curriculumType: '単位制', note: '普通科' },
  { no: 270, prefecture: '静岡県', municipality: '藤枝市', name: '静岡県立藤枝東高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 271, prefecture: '静岡県', municipality: '牧之原市', name: '静岡県立榛原高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 272, prefecture: '静岡県', municipality: '磐田市', name: '静岡県立磐田南高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 273, prefecture: '静岡県', municipality: '浜松市中区', name: '静岡県立浜松北高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 274, prefecture: '静岡県', municipality: '浜松市西区', name: '静岡県立浜松大平台高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', parts: '3部制（朝・昼・夜）', curriculumType: '単位制', note: '普通科' },
  { no: 275, prefecture: '静岡県', municipality: '浜松市北区', name: '静岡県立浜松工業高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 276, prefecture: '静岡県', municipality: '浜松市浜北区', name: '静岡県立浜名高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached' },
  { no: 277, prefecture: '静岡県', municipality: '湖西市', name: '静岡県立新居高等学校', publicPrivate: '公立', operator: '静岡県教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '学年制' },

  // ===== 山梨県（7校） =====
  // 出典: 山梨県教育委員会 入学者選抜関連PDF（https://www.pref.yamanashi.jp/documents/7061/r6nyuushiteiinn.pdf 等）
  { no: 278, prefecture: '山梨県', name: '韮崎高等学校定時制', publicPrivate: '公立', operator: '山梨県教育委員会', schoolCategory: 'attached', note: '普通科' },
  { no: 279, prefecture: '山梨県', name: '甲府工業高等学校定時制', publicPrivate: '公立', operator: '山梨県教育委員会', schoolCategory: 'attached', note: '工業科（機械科・電気科・建築科を一括募集）' },
  { no: 280, prefecture: '山梨県', name: '巨摩高等学校定時制', publicPrivate: '公立', operator: '山梨県教育委員会', schoolCategory: 'attached', note: '普通科' },
  { no: 281, prefecture: '山梨県', name: '山梨高等学校定時制', publicPrivate: '公立', operator: '山梨県教育委員会', schoolCategory: 'attached', note: '普通科' },
  { no: 282, prefecture: '山梨県', name: '都留高等学校定時制', publicPrivate: '公立', operator: '山梨県教育委員会', schoolCategory: 'attached', note: '普通科（定員40名）' },
  { no: 283, prefecture: '山梨県', name: '中央高等学校定時制', publicPrivate: '公立', operator: '山梨県教育委員会', schoolCategory: 'attached', note: '普通科、衛生看護科' },
  { no: 284, prefecture: '山梨県', name: 'ひばりが丘高等学校定時制', publicPrivate: '公立', operator: '山梨県教育委員会', schoolCategory: 'attached', note: '普通科、情報経理科' },

  // ===== 長野県（15校） =====
  // 出典: 令和8年度長野県公立高校募集定員資料 https://www.pref.nagano.lg.jp/kyoiku/koko/saiyo-nyuushi/shiken/ko/r8/documents/20260319web2-2.pdf
  //       各校公式サイト・資料（nagano-c.ed.jp ドメイン等）
  { no: 285, prefecture: '長野県', municipality: '長野市', name: '長野商業高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', parts: '夜間部', curriculumType: '単位制（前後期2学期制）', nickname: '長商定時制', officialUrl: 'https://www.nagano-c.ed.jp/chosho/teijihp/documents/guide2024.pdf' },
  { no: 286, prefecture: '長野県', municipality: '長野市', name: '長野吉田高等学校戸隠分校（定時制）', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', parts: '昼間定時制' },
  { no: 287, prefecture: '長野県', municipality: '長野市', name: '長野高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached' },
  { no: 288, prefecture: '長野県', municipality: '長野市', name: '長野工業高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', note: '基礎工学科・建築科。4年間で卒業、1日4時限' },
  { no: 289, prefecture: '長野県', municipality: '長野市', name: '篠ノ井高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', parts: '夜間', note: '夜5時～8時25分。4年間で卒業' },
  { no: 290, prefecture: '長野県', municipality: '上田市', name: '上田千曲高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', note: '工業・機械科' },
  { no: 291, prefecture: '長野県', municipality: '上田市', name: '上田高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', note: '普通科' },
  { no: 292, prefecture: '長野県', municipality: '小諸市', name: '小諸商業高等学校定時制課程', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', parts: '夜間定時制', curriculumType: '学年制（卒業までに4年間）' },
  { no: 293, prefecture: '長野県', municipality: '佐久市', name: '野沢南高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', note: '普通科。授業時間17:30～20:55、卒業要件76単位' },
  { no: 294, prefecture: '長野県', municipality: '諏訪市', name: '諏訪実業高等学校定時制課程', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', parts: '夜間定時制', note: '普通科' },
  { no: 295, prefecture: '長野県', municipality: '駒ヶ根市', name: '赤穂高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached' },
  { no: 296, prefecture: '長野県', municipality: '飯田市', name: '飯田OIDE長姫高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', note: '普通科、機械科、基礎工学科' },
  { no: 297, prefecture: '長野県', name: '木曽青峰高等学校定時制', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached' },
  { no: 298, prefecture: '長野県', municipality: '北安曇郡池田町', name: '池田工業高等学校定時制課程', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'attached', nickname: '池工', note: '普通科（全日制と定時制を併設）。「3年間91単位」「3修制」' },
  { no: 299, prefecture: '長野県', name: '松本筑摩高等学校定時制（多部制・単位制）', publicPrivate: '公立', operator: '長野県教育委員会', schoolCategory: 'standalone', parts: '午前部・午後部・夜間部', curriculumType: '単位制' },

  // ===== 岐阜県（11校） =====
  // 出典: https://www.pref.gifu.lg.jp/uploaded/attachment/358214.pdf（県立高等学校一覧・校名と部制の対応）
  //       各校公式サイト（school.gifu-net.ed.jp ドメイン、多くが一時停止中）
  { no: 300, prefecture: '岐阜県', municipality: '岐阜市', name: '岐阜県立華陽フロンティア高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部・Ⅱ部・Ⅲ部', curriculumType: '単位制', officialUrl: 'https://school.gifu-net.ed.jp/kayofront-hs/', note: '普通科。市区町村・単位制は学校情報サイトでの確認で、県公式資料では未確認' },
  { no: 301, prefecture: '岐阜県', municipality: '土岐市', name: '岐阜県立東濃フロンティア高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', parts: 'Ⅰ部・Ⅱ部・Ⅲ部', curriculumType: '単位制', officialUrl: 'https://school.gifu-net.ed.jp/tonofront-hs/', note: '普通科。市区町村・単位制は学校情報サイトでの確認で、県公式資料では未確認' },
  { no: 302, prefecture: '岐阜県', name: '岐阜県立岐阜商業高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', officialUrl: 'https://school.gifu-net.ed.jp/gifu-chs/', note: 'ビジネス科。所在地・単位制/学年制は公式サイト一時停止のため未確認' },
  { no: 303, prefecture: '岐阜県', name: '岐阜県立岐阜工業高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', officialUrl: 'https://school.gifu-net.ed.jp/gifu-ths/', note: '工業技術。所在地・単位制/学年制は未確認' },
  { no: 304, prefecture: '岐阜県', municipality: '大垣市', name: '岐阜県立大垣商業高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', officialUrl: 'https://school.gifu-net.ed.jp/ogaki-chs/', note: 'ビジネス。単位制/学年制は未確認' },
  { no: 305, prefecture: '岐阜県', name: '岐阜県立大垣工業高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', officialUrl: 'https://school.gifu-net.ed.jp/ogaki-ths/', note: '工業技術。所在地・単位制/学年制は未確認' },
  { no: 306, prefecture: '岐阜県', municipality: '美濃加茂市', name: '岐阜県立加茂高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', curriculumType: '単位制', officialUrl: 'https://school.gifu-net.ed.jp/kamo-hs/', note: '普通科' },
  { no: 307, prefecture: '岐阜県', name: '岐阜県立中津高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', officialUrl: 'https://school.gifu-net.ed.jp/nakatsu-hs/', note: '普通科。所在地・単位制/学年制は未確認' },
  { no: 308, prefecture: '岐阜県', name: '岐阜県立飛騨高山高等学校', publicPrivate: '公立', operator: '岐阜県教育委員会', schoolCategory: 'standalone', officialUrl: 'https://school.gifu-net.ed.jp/htakayama-hs/', note: '普通科。通信制も併設。所在地・単位制/学年制は未確認' },
  { no: 309, prefecture: '岐阜県', municipality: '関市', name: '関市立関商工高等学校', publicPrivate: '公立', operator: '関市教育委員会', schoolCategory: 'standalone', officialUrl: 'https://school.gifu-net.ed.jp/seki-hs/', note: '機械科。単位制/学年制は未確認' },
  { no: 310, prefecture: '岐阜県', municipality: '中津川市', name: '中津川市立阿木高等学校', publicPrivate: '公立', operator: '中津川市教育委員会', schoolCategory: 'standalone', note: '生産科学・総合生活。所在地・単位制/学年制は未確認' },

  // ===== 愛知県（33校） =====
  // 出典: 愛知県公立高等学校入学者選抜（令和9年度/2027年度）定時制・通信制実施要項 https://www.pref.aichi.jp/uploaded/attachment/630112.pdf
  //       「フレキシブルハイスクール」紹介ページ https://www.pref.aichi.jp/soshiki/aichi-manabi/flexible-highschool.html
  //       各校公式サイト（*.aichi-c.ed.jp ドメイン）
  { no: 311, prefecture: '愛知県', municipality: '名古屋市北区', name: '城北つばさ高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'standalone', parts: '二部制（昼間部・夜間部）', curriculumType: '単位制', note: '昼間部=普通科120名、夜間部=ものづくり科40名。平成29年開校' },
  { no: 312, prefecture: '愛知県', municipality: '愛西市', name: '愛知県立佐屋高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '昼間部', note: 'フレキシブルハイスクール（全日制・昼間定時制・通信制を併置）。昼間定時制=普通科。令和7年度（2025年4月）開設' },
  { no: 313, prefecture: '愛知県', municipality: '知多郡武豊町', name: '愛知県立武豊高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '昼間部', curriculumType: '単位制', note: 'フレキシブルハイスクール。普通科。月～金、3限目から毎日4時間授業。令和7年度（2025年4月）開設' },
  { no: 314, prefecture: '愛知県', municipality: '豊田市', name: '愛知県立豊野高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '昼間部', note: 'フレキシブルハイスクール。令和7年度（2025年4月）開設' },
  { no: 315, prefecture: '愛知県', municipality: '豊川市', name: '愛知県立御津あおば高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '昼間部', curriculumType: '単位制', note: '普通科。令和5年4月に県立御津高等学校から校名変更し、全日制単位制に昼間定時制課程を併置' },
  { no: 316, prefecture: '愛知県', municipality: '一宮市', name: '愛知県立一宮起工科高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '昼間部', note: '普通科、募集80名' },
  { no: 317, prefecture: '愛知県', municipality: '刈谷市', name: '愛知県立刈谷東高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '二部制（昼間部・夜間部）', note: '昼間部=普通科、夜間部=機械科（募集40名）' },
  { no: 318, prefecture: '愛知県', municipality: '名古屋市東区', name: '愛知県立明和高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '夜間定時制=普通科' },
  { no: 319, prefecture: '愛知県', municipality: '名古屋市西区', name: '愛知県立名古屋西高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '夜間定時制=普通科' },
  { no: 320, prefecture: '愛知県', municipality: '東海市', name: '愛知県立横須賀高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '夜間定時制=普通科。授業は17:40～20:55' },
  { no: 321, prefecture: '愛知県', municipality: '一宮市', name: '愛知県立一宮高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '夜間定時制=普通科（4年制・3年制コースあり）' },
  { no: 322, prefecture: '愛知県', municipality: '瀬戸市', name: '愛知県立瀬戸工科高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '夜間定時制=総合ビジネス科' },
  { no: 323, prefecture: '愛知県', municipality: '半田市', name: '愛知県立半田商業高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '夜間定時制=総合ビジネス科' },
  { no: 324, prefecture: '愛知県', municipality: '蒲郡市', name: '愛知県立蒲郡高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '夜間定時制=普通科。授業時間17:15～21:30' },
  // 以下19校は入学者選抜実施要項（令和9年度）で学校名・学科は確認できたが、市区町村は公式資料で裏付けが取れず省略
  { no: 325, prefecture: '愛知県', name: '愛知県立熱田高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 326, prefecture: '愛知県', name: '愛知県立名古屋工科高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '機械科。旧・愛知工業高等学校' },
  { no: 327, prefecture: '愛知県', name: '愛知県立春日井高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 328, prefecture: '愛知県', name: '愛知県立犬山高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 329, prefecture: '愛知県', name: '愛知県立古知野高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 330, prefecture: '愛知県', name: '愛知県立小牧高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 331, prefecture: '愛知県', name: '愛知県立津島高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 332, prefecture: '愛知県', name: '愛知県立大府高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 333, prefecture: '愛知県', name: '愛知県立豊田西高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 334, prefecture: '愛知県', name: '愛知県立豊田工科高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '機械科。旧・豊田工業高等学校' },
  { no: 335, prefecture: '愛知県', name: '愛知県立岡崎高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 336, prefecture: '愛知県', name: '愛知県立岡崎工科高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '機械科。旧・岡崎工業高等学校' },
  { no: 337, prefecture: '愛知県', name: '愛知県立碧南高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 338, prefecture: '愛知県', name: '愛知県立安城高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 339, prefecture: '愛知県', name: '愛知県立一色高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '普通科' },
  { no: 340, prefecture: '愛知県', name: '愛知県立豊橋工科高等学校', publicPrivate: '公立', operator: '愛知県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '機械科。旧・豊橋工業高等学校' },
  { no: 341, prefecture: '愛知県', name: '名古屋市立中央高等学校', publicPrivate: '公立', operator: '名古屋市教育委員会', schoolCategory: 'attached', parts: '昼間部・夜間部', note: '普通科・商業科' },
  { no: 342, prefecture: '愛知県', municipality: '豊橋市', name: '豊橋市立豊橋高等学校', publicPrivate: '公立', operator: '豊橋市教育委員会', schoolCategory: 'attached', parts: '昼間部・夜間部', note: '普通科' },
  { no: 343, prefecture: '愛知県', name: '名古屋市立工業高等学校', publicPrivate: '公立', operator: '名古屋市教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '複数学科' },

  // ===== 京都府（8校） =====
  // 出典: 京都府教育委員会「定時制等設置校一覧」https://www.kyoto-be.ne.jp/koukyou/cms/wp-content/uploads/2022/12/teijiseitou.pdf
  //       各校個別案内PDF（kyoto-be.ne.jp ドメイン）
  { no: 344, prefecture: '京都府', municipality: '京都市北区', name: '京都府立清明高等学校', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'standalone', parts: '午前コース・午後コース（昼間2部制）', curriculumType: '単位制', note: '基本コンセプトは「学びアンダンテ」。ICT活用・AI学習アプリで自学自習を支援' },
  { no: 345, prefecture: '京都府', municipality: '京丹後市弥栄町', name: '京都府立清新高等学校', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'standalone', curriculumType: '単位制', note: '総合学科の記載もあり' },
  { no: 346, prefecture: '京都府', municipality: '京都市中京区', name: '京都府立朱雀高等学校　夜間定時制', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'attached', parts: '夜間', note: '朱雀高校は通信制課程も併設' },
  { no: 347, prefecture: '京都府', municipality: '京都市南区', name: '京都府立鳥羽高等学校　夜間定時制', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'attached', parts: '夜間', curriculumType: '単位制', note: '単位制による普通科（平成28年度入学生から実施）。4年制が基本だが三修制により3年卒業も可。学校設定科目「スタートライン」で学び直し支援。制服なし' },
  { no: 348, prefecture: '京都府', municipality: '京都市伏見区', name: '京都府立桃山高等学校　定時制', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'attached', note: '普通科・商業科。転入学は第2～4学年が対象' },
  { no: 349, prefecture: '京都府', municipality: '南丹市美山町', name: '京都府立北桑田高等学校　美山分校（昼間定時制）', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'attached', parts: '昼間', note: '家政科・農業科。月～木登校、金曜は就業日とし4年間かけて学ぶ' },
  { no: 350, prefecture: '京都府', municipality: '綾部市', name: '京都府立綾部高等学校　由良川キャンパス（東分校）夜間定時制', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'attached', parts: '夜間', note: '普通科。少人数・ティームティーチングによる個別支援' },
  { no: 351, prefecture: '京都府', municipality: '舞鶴市', name: '京都府立東舞鶴高等学校　浮島分校（夜間定時制）', publicPrivate: '公立', operator: '京都府教育委員会', schoolCategory: 'attached', parts: '夜間' },

  // ===== 兵庫県（19校） =====
  // 出典: https://www.hyogo-c.ed.jp/~koko-bo/H30senbatu/H30tabusei.pdf（多部制単位制4校）
  //       令和6年7月 兵庫県議会文教常任委員会資料 https://web.pref.hyogo.lg.jp/gikai/iinkai/index/joniniinkai/bunkyo/documents/06bunshiryo060716.pdf（定時制設置校19校の確認）
  //       各校公式サイト・PDF
  // schoolCategory・curriculumType が資料で確認できなかった学校は、該当フィールドを省略（noteに経緯を記載）
  { no: 352, prefecture: '兵庫県', municipality: '西宮市', name: '兵庫県立西宮香風高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', note: '普通科。多部制単位制。' },
  { no: 353, prefecture: '兵庫県', municipality: '伊丹市', name: '兵庫県立阪神昆陽高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', note: '普通科。多部制単位制。' },
  { no: 354, prefecture: '兵庫県', municipality: '西脇市', name: '兵庫県立西脇北高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', note: '普通科。多部制単位制。' },
  { no: 355, prefecture: '兵庫県', municipality: '姫路市', name: '兵庫県立飾磨工業高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', schoolCategory: 'standalone', parts: '三部制', curriculumType: '単位制', note: '工業科。多部制単位制。' },
  { no: 356, prefecture: '兵庫県', municipality: '神戸市長田区', name: '兵庫県立湊川高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '普通科。夜間定時制。学年制/単位制は資料に明記なし。' },
  { no: 357, prefecture: '兵庫県', municipality: '三田市', name: '兵庫県立有馬高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '普通科。夜間定時制課程。学年制/単位制は資料に明記なし。' },
  { no: 358, prefecture: '兵庫県', municipality: '明石市', name: '兵庫県立錦城高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '定時制。学年制/単位制は資料に明記なし。' },
  { no: 359, prefecture: '兵庫県', municipality: '加古川市', name: '兵庫県立農業高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '定時制課程。学年制/単位制は資料に明記なし。' },
  { no: 360, prefecture: '兵庫県', municipality: '高砂市', name: '兵庫県立松陽高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '定時制課程。学年制/単位制は資料に明記なし。' },
  { no: 361, prefecture: '兵庫県', municipality: '赤穂市', name: '兵庫県立赤穂高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '定時制課程。学年制と推察されるが資料に明記なし。' },
  { no: 362, prefecture: '兵庫県', municipality: '豊岡市', name: '兵庫県立豊岡高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '定時制課程。学年制/単位制は資料に明記なし。' },
  { no: 363, prefecture: '兵庫県', municipality: '洲本市', name: '兵庫県立洲本高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '定時制の課程。学年制/単位制は資料に明記なし。' },
  { no: 364, prefecture: '兵庫県', name: '兵庫県立姫路北高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', curriculumType: '単位制', note: '普通科。夜間定時制・単位制（県議会資料で確認）。所在市区町村は公式資料で確認できず。' },
  { no: 365, prefecture: '兵庫県', municipality: '神戸市兵庫区', name: '兵庫県立神戸工業高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '工業科。定時制。学年制/単位制は資料に明記なし。' },
  { no: 366, prefecture: '兵庫県', municipality: '尼崎市', name: '兵庫県立神崎工業高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '工業科。定時制。学年制/単位制は資料に明記なし。' },
  { no: 367, prefecture: '兵庫県', name: '兵庫県立小野工業高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '工業科（機械科）。定時制。所在市区町村は公式資料で確認できず。' },
  { no: 368, prefecture: '兵庫県', municipality: '相生市', name: '兵庫県立相生産業高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '工業科。定時制課程。学年制/単位制は資料に明記なし。' },
  { no: 369, prefecture: '兵庫県', municipality: '神戸市長田区', name: '兵庫県立長田商業高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '商業科。定時制課程。学年制/単位制は資料に明記なし。' },
  { no: 370, prefecture: '兵庫県', municipality: 'たつの市', name: '兵庫県立龍野北高等学校', publicPrivate: '公立', operator: '兵庫県教育委員会', note: '商業科。定時制。学年制/単位制は資料に明記なし。' },

  // ===== 三重県（11校） =====
  // 出典: 三重県教育委員会（各校リンク一覧 https://www.pref.mie.lg.jp/SEISHI/HP/p0013700012.htm）、
  //       ベネッセ学校情報（czemi.benesse.ne.jp）、school.js88.com、minkou.jp 等
  { no: 371, prefecture: '三重県', municipality: '桑名市', name: '三重県立桑名高等学校', publicPrivate: '公立', operator: '三重県教育委員会', note: '定時制の学科名・部制・単位制/学年制の区別は公式サイトで未確認' },
  { no: 372, prefecture: '三重県', municipality: '四日市市', name: '三重県立四日市工業高等学校', publicPrivate: '公立', operator: '三重県教育委員会', curriculumType: '単位制', note: '定時制学科は機械交通工学科・住システム工学科（いずれも単位制）。部制の記載なし' },
  { no: 373, prefecture: '三重県', municipality: '四日市市', name: '三重県立北星高等学校', publicPrivate: '公立', operator: '三重県教育委員会', parts: '夜間部', curriculumType: '単位制', note: '定時制普通科（夜間部・単位制）のほか情報ビジネス科（単位制）、普通科（昼間部）の募集も記載あり（出典に記述の食い違いあり、要公式サイト確認）' },
  { no: 374, prefecture: '三重県', municipality: '鈴鹿市', name: '三重県立飯野高等学校', publicPrivate: '公立', operator: '三重県教育委員会', curriculumType: '単位制', note: '定時制普通科（単位制）。部制の記載なし' },
  { no: 375, prefecture: '三重県', municipality: '津市', name: '三重県立みえ夢学園高等学校', publicPrivate: '公立', operator: '三重県教育委員会', parts: '三部制（昼間部＝午前部・午後部、夜間部）', curriculumType: '単位制', note: '総合学科' },
  { no: 376, prefecture: '三重県', municipality: '伊賀市', name: '三重県立上野高等学校', publicPrivate: '公立', operator: '三重県教育委員会', note: '定時制の学科・部制・単位制/学年制は未確認' },
  { no: 377, prefecture: '三重県', municipality: '名張市', name: '三重県立名張高等学校', publicPrivate: '公立', operator: '三重県教育委員会', curriculumType: '単位制', note: '定時制普通科（単位制）。部制の記載なし' },
  { no: 378, prefecture: '三重県', municipality: '松阪市', name: '三重県立松阪工業高等学校', publicPrivate: '公立', operator: '三重県教育委員会', curriculumType: '単位制', note: '定時制普通科（単位制）。部制の記載なし' },
  { no: 379, prefecture: '三重県', municipality: '伊勢市', name: '三重県立伊勢まなび高等学校', publicPrivate: '公立', operator: '三重県教育委員会', parts: '三部制（昼間部＝午前部・午後部、夜間部）', curriculumType: '単位制', note: '定時制学科はものづくり工学科（単位制）' },
  { no: 380, prefecture: '三重県', municipality: '尾鷲市', name: '三重県立尾鷲高等学校', publicPrivate: '公立', operator: '三重県教育委員会', curriculumType: '単位制', note: '定時制普通科（単位制）。部制の記載なし' },
  { no: 381, prefecture: '三重県', municipality: '熊野市', name: '三重県立熊野青藍高等学校（木本校舎）', publicPrivate: '公立', operator: '三重県教育委員会', curriculumType: '単位制', note: '定時制普通科（単位制）。部制の記載なし' },

  // ===== 滋賀県（5校） =====
  // 出典: 滋賀県教育委員会 確定出願状況資料（平成30・31年度）、各校公式サイト、school.js88.com、minkou.jp
  { no: 382, prefecture: '滋賀県', municipality: '大津市', name: '滋賀県立大津清陵高等学校', publicPrivate: '公立', operator: '滋賀県教育委員会', parts: '昼間部・夜間部', curriculumType: '単位制', note: '普通科。昼間部・通信部は大平1丁目14-1、夜間部は大津市中心部（JR膳所駅付近）。' },
  { no: 383, prefecture: '滋賀県', municipality: '東近江市', name: '滋賀県立能登川高等学校', publicPrivate: '公立', operator: '滋賀県教育委員会', parts: '昼間部・夜間部', note: '普通科。' },
  { no: 384, prefecture: '滋賀県', municipality: '大津市', name: '滋賀県立瀬田工業高等学校', publicPrivate: '公立', operator: '滋賀県教育委員会', note: '定時制学科は機械・電気科。部制・単位制/学年制は未確認' },
  { no: 385, prefecture: '滋賀県', municipality: '彦根市', name: '滋賀県立彦根工業高等学校', publicPrivate: '公立', operator: '滋賀県教育委員会', note: '定時制学科は機械科。部制・単位制/学年制は未確認' },
  { no: 386, prefecture: '滋賀県', municipality: '長浜市', name: '滋賀県立長浜北星高等学校', publicPrivate: '公立', operator: '滋賀県教育委員会', note: '総合学科。部制・単位制/学年制は未確認' },

  // ===== 大阪府（19校） =====
  // 出典: 大阪府公立高等学校入学者選抜実施要項（別表）https://www.pref.osaka.lg.jp/documents/129117/r9_jisshiko.pdf
  //       守口市教育委員会転載資料 https://www.city.moriguchi.osaka.jp/material/files/group/38/r5jissikou.pdf
  //       大阪府教育便覧 https://www.pref.osaka.lg.jp/documents/35533/r8_handbook.pdf
  // 注: エンパワメントスクール（淀川清流・成城・長吉・箕面東・布施北・和泉総合等）は全日制総合学科であり定時制ではない（要項で確認）。
  //     成城・和泉総合は全日制エンパワメントスクールと別に定時制総合学科も設置しているため、下記に掲載。
  { no: 387, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '普通科', name: '大阪府立大手前高等学校', note: '定時制の課程' },
  { no: 388, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '普通科', name: '大阪府立桃谷高等学校', note: '定時制の課程（一般・秋季入学者選抜の両方で実施）。通信制の課程も併置' },
  { no: 389, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '普通科', name: '大阪府立桜塚高等学校', note: '定時制の課程。学区: 豊能地区' },
  { no: 390, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '普通科', name: '大阪府立春日丘高等学校', note: '定時制の課程' },
  { no: 391, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '普通科', name: '大阪府立寝屋川高等学校', note: '定時制の課程。学区: 北河内地区' },
  { no: 392, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '普通科', name: '大阪府立布施高等学校', note: '定時制の課程。学区: 中河内地区' },
  { no: 393, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '普通科', name: '大阪府立三国丘高等学校', note: '定時制の課程' },
  { no: 394, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立都島工業高等学校', note: '定時制総合学科（全日制は工業系専門学科）' },
  { no: 395, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立西野田工科高等学校', note: '定時制総合学科。令和8年度入学者選抜で生徒募集を行っていない旨の記載あり（教育便覧）。募集停止・統廃合の可能性、要確認。' },
  { no: 396, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立今宮工科高等学校', note: '定時制総合学科' },
  { no: 397, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立工芸高等学校', note: '定時制総合学科' },
  { no: 398, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立茨木工科高等学校', note: '定時制総合学科' },
  { no: 399, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立藤井寺工科高等学校', note: '定時制総合学科' },
  { no: 400, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立堺工科高等学校', note: '定時制総合学科' },
  { no: 401, prefecture: '大阪府', municipality: '泉佐野市', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立佐野工科高等学校', officialUrl: 'https://www.osaka-c.ed.jp/sano-t-p/', note: '定時制総合学科' },
  { no: 402, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立成城高等学校', note: '定時制総合学科。同校は全日制で総合学科（エンパワメントスクール）も設置' },
  { no: 403, prefecture: '大阪府', publicPrivate: '公立', operator: '大阪府教育委員会', schoolCategory: 'attached', curriculumType: '総合学科', name: '大阪府立和泉総合高等学校', note: '定時制総合学科。同校は全日制で総合学科（エンパワメントスクール）も設置' },
  { no: 404, prefecture: '大阪府', municipality: '堺市', publicPrivate: '公立', operator: '堺市教育委員会', schoolCategory: 'attached', curriculumType: '工業に関する学科／マネジメント創造科', name: '堺市立堺高等学校', note: '定時制。学科は工業に関する学科とマネジメント創造科の2系統' },
  { no: 405, prefecture: '大阪府', municipality: '岸和田市', publicPrivate: '公立', operator: '岸和田市教育委員会', schoolCategory: 'attached', curriculumType: '商業科', name: '岸和田市立産業高等学校', note: '定時制' },

  // ===== 奈良県（3校） =====
  // 出典: 奈良県教育委員会 https://www.pref.nara.jp/secure/296921/0_Koukou_r6_Mokuji.pdf、
  //       五條市公式資料 https://www.pref.nara.jp/secure/263408/gojoshi.pdf
  // 山辺高等学校は目次上「定時制課程」とされるが、学校公式資料では「通信制課程」としか記載されず矛盾があるため、今回は含めない。
  { no: 406, prefecture: '奈良県', municipality: '奈良市', name: '奈良県立奈良商工高等学校', publicPrivate: '公立', operator: '奈良県教育委員会', officialUrl: 'https://www.pref.nara.jp/secure/296921/0_Koukou_r6_Mokuji.pdf', note: '所在地は全日制と同一住所（奈良市柏木町248）。部制・単位制/学年制の記載は確認できず。' },
  { no: 407, prefecture: '奈良県', municipality: '橿原市', name: '奈良県立畝傍高等学校', publicPrivate: '公立', operator: '奈良県教育委員会', officialUrl: 'https://www.pref.nara.jp/secure/296921/0_Koukou_r6_Mokuji.pdf', note: '所在地は全日制と同一住所（橿原市八木町3-13-2）。部制・単位制/学年制の記載は確認できず。' },
  { no: 408, prefecture: '奈良県', municipality: '五條市', name: '五條市立西吉野農業高等学校', publicPrivate: '公立', operator: '五條市教育委員会', parts: '昼間部', officialUrl: 'https://www.pref.nara.jp/secure/263408/gojoshi.pdf', note: '単科（農業科）、修業年限4年。令和3年4月、県立五條高等学校賀名生分校を継承して開校。' },

  // ===== 和歌山県（3校） =====
  // 出典: 和歌山県教育委員会 令和7・8年度入学者選抜実施状況（07jokyo.pdf, 08jukenjoukyou.pdf）、再編整備計画資料
  // 粉河高校定時制課程は令和5年度末、海南高校定時制課程は令和6年度末にそれぞれ閉課済みのため、現存校には含めない。
  { no: 409, prefecture: '和歌山県', municipality: '御坊市', name: '和歌山県立日高高等学校', publicPrivate: '公立', operator: '和歌山県教育委員会', officialUrl: 'https://www.hidaka-h.wakayama-c.ed.jp/tei/data/gakkoannai.pdf', note: '住所は御坊市島45番地。修業年限は4修制・3修制の2種類があり単位修得が卒業要件とされるが「単位制」の呼称自体は確認できず。部制の記載なし。' },
  { no: 410, prefecture: '和歌山県', name: '和歌山県立耐久高等学校', publicPrivate: '公立', operator: '和歌山県教育委員会', officialUrl: 'https://www.taikyu-h.wakayama-c.ed.jp/schoolpolicy/schoolpolicy.pdf', note: '令和7年度入学者選抜実施状況でも定時制課程が確認できる。市区町村・単位制/学年制・部制は公式資料で確認できず省略。' },
  { no: 411, prefecture: '和歌山県', name: '和歌山県立新宮高等学校', publicPrivate: '公立', operator: '和歌山県教育委員会', officialUrl: 'https://www.pref.wakayama.lg.jp/prefg/500200/d00216812_d/fil/07jokyo.pdf', note: '始業時間は18:00（新宮高等学校定時制生徒心得より）。市区町村・単位制/学年制・部制は公式資料で確認できず省略。' },

  // ===== 鳥取県（4校） =====
  // 出典: https://www.pref.tottori.lg.jp/315424.htm（校名一覧）、https://www.pref.tottori.lg.jp/87667.htm（所在地一覧）、
  //       各校スクール・ポリシーPDF（pref.tottori.lg.jp）
  { no: 412, prefecture: '鳥取県', municipality: '鳥取市', name: '鳥取県立鳥取緑風高等学校', publicPrivate: '公立', operator: '鳥取県教育委員会', schoolCategory: 'attached', note: '全日制・通信制も併設。定時制課程は総合学科。' },
  { no: 413, prefecture: '鳥取県', municipality: '米子市', name: '鳥取県立米子東高等学校', publicPrivate: '公立', operator: '鳥取県教育委員会', schoolCategory: 'attached', note: '定時制課程は普通学科。' },
  { no: 414, prefecture: '鳥取県', municipality: '米子市', name: '鳥取県立米子白鳳高等学校', publicPrivate: '公立', operator: '鳥取県教育委員会', schoolCategory: 'attached', note: '全日制・通信制も併設。定時制課程は総合学科。' },
  { no: 415, prefecture: '鳥取県', municipality: '倉吉市', name: '鳥取県立倉吉東高等学校', publicPrivate: '公立', operator: '鳥取県教育委員会', schoolCategory: 'attached', curriculumType: '単位制（通信制科目を併修し3年間での卒業も可能な教育課程）', note: '定時制課程は普通学科。' },

  // ===== 島根県（3校） =====
  // 出典: https://www1.pref.shimane.lg.jp/gakkokikaku/school/index.data/p40_teiji.pdf（校名一覧）、
  //       島根県教育委員会 各校定時制課程資料
  { no: 416, prefecture: '島根県', name: '島根県立松江工業高等学校', publicPrivate: '公立', operator: '島根県教育委員会', schoolCategory: 'attached', note: '定時制課程（夜間）。学科：機械科・電気科・建築科。1日4時間授業、4年間で卒業する教育課程。所在地は資料上未確認。' },
  { no: 417, prefecture: '島根県', municipality: '松江市', name: '島根県立宍道高等学校', publicPrivate: '公立', operator: '島根県教育委員会', schoolCategory: 'standalone', parts: '三部制（午前部・午後部・夜間部）', curriculumType: '単位制', note: '普通科（入学定員：午前部80名、午後部40名、夜間部40名）。全校生徒数365名（令和7年5月1日現在）。' },
  { no: 418, prefecture: '島根県', municipality: '浜田市', name: '島根県立浜田高等学校', publicPrivate: '公立', operator: '島根県教育委員会', schoolCategory: 'attached', parts: '二部制（昼間部・夜間部。定通併修・他部履修も条件付きで可能）', note: '定時制課程の学科は資料上未確認。' },

  // ===== 山口県（7校） =====
  // 出典: 山口県教育委員会 高校一覧資料 https://www.pref.yamaguchi.lg.jp/uploaded/life/148551_267732_misc.pdf
  //       平成29年10月会議資料 https://www.pref.yamaguchi.lg.jp/uploaded/attachment/75274.pdf
  //       各校学科・部制資料 https://www.pref.yamaguchi.lg.jp/uploaded/attachment/76557.pdf, 76740.pdf
  { no: 419, prefecture: '山口県', name: '山口県立岩国商業高等学校　東分校', publicPrivate: '公立', operator: '山口県教育委員会', schoolCategory: 'attached', parts: '昼間部・夜間部', note: '普通科。入学定員は昼間部40人・夜間部40人。所在市区町村は資料上確認できず。' },
  { no: 420, prefecture: '山口県', name: '山口県立下松工業高等学校', publicPrivate: '公立', operator: '山口県教育委員会', note: '定時制課程・機械科、入学定員40人。部制・所在市区町村・本校/分校の区別は資料上確認できず。' },
  { no: 421, prefecture: '山口県', municipality: '周南市', name: '山口県立徳山高等学校', publicPrivate: '公立', operator: '山口県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '定時制課程・普通科、修業年限3年または4年、入学定員40人。' },
  { no: 422, prefecture: '山口県', municipality: '山口市', name: '山口県立山口松風館高等学校', publicPrivate: '公立', operator: '山口県教育委員会', schoolCategory: 'standalone', parts: '三部制（昼間部午前部・昼間部午後部・夜間部）', curriculumType: '単位制', note: '普通科。所在地は山口市小郡令和三丁目。入学定員は各部38人程度。通信制課程も併設。' },
  { no: 423, prefecture: '山口県', name: '山口県立宇部中央高等学校', publicPrivate: '公立', operator: '山口県教育委員会', note: '定時制課程・普通科、入学定員40人。部制・所在市区町村・本校/分校の区別は資料上確認できず。' },
  { no: 424, prefecture: '山口県', municipality: '山陽小野田市', name: '山口県立小野田工業高等学校', publicPrivate: '公立', operator: '山口県教育委員会', schoolCategory: 'attached', parts: '夜間部', note: '定時制課程・機械科、修業年限3年または4年、入学定員40人。' },
  { no: 425, prefecture: '山口県', name: '山口県立下関双葉高等学校', publicPrivate: '公立', operator: '山口県教育委員会', parts: '昼間部・夜間部', note: '定時制課程・学科名は資料上「総合」と表記（総合学科と推定されるが正式表記の確証なし）。入学定員は昼間部40人・夜間部40人。所在市区町村・本校/分校の区別は資料上確認できず。' },

  // ===== 岡山県（11校） =====
  // 出典: 岡山県教育委員会 令和7年度 入学定員資料 https://www.pref.okayama.jp/uploaded/life/1054590_10218886_misc.pdf
  { no: 426, prefecture: '岡山県', name: '岡山県立烏城高等学校', publicPrivate: '公立', operator: '岡山県教育委員会', note: '普通科。R7募集定員140人。' },
  { no: 427, prefecture: '岡山県', municipality: '倉敷市', name: '倉敷市立精思高等学校', publicPrivate: '公立', operator: '倉敷市教育委員会', note: '普通科。R7募集定員80人。' },
  { no: 428, prefecture: '岡山県', municipality: '倉敷市', name: '倉敷市立精思高等学校霞丘校', publicPrivate: '公立', operator: '倉敷市教育委員会', note: '普通科・商業科。精思高等学校の分校。' },
  { no: 429, prefecture: '岡山県', municipality: '倉敷市', name: '倉敷市立工業高等学校', publicPrivate: '公立', operator: '倉敷市教育委員会', note: '機械科・電気科。R7募集定員120人。' },
  { no: 430, prefecture: '岡山県', municipality: '倉敷市', name: '倉敷市立倉敷翔南高等学校', publicPrivate: '公立', operator: '倉敷市教育委員会', curriculumType: '単位制', note: '総合学科。R7募集定員120人。' },
  { no: 431, prefecture: '岡山県', municipality: '倉敷市', name: '倉敷市立真備陵南高等学校', publicPrivate: '公立', operator: '倉敷市教育委員会', note: '普通科。R7募集定員80人。' },
  { no: 432, prefecture: '岡山県', municipality: '玉野市', name: '玉野市立玉野備南高等学校', publicPrivate: '公立', operator: '玉野市教育委員会', note: '普通科。R7募集定員40人。' },
  { no: 433, prefecture: '岡山県', municipality: '井原市', name: '井原市立高等学校', publicPrivate: '公立', operator: '井原市教育委員会', note: '普通科。R7募集定員80人。' },
  { no: 434, prefecture: '岡山県', municipality: '高梁市', name: '高梁市立松山高等学校', publicPrivate: '公立', operator: '高梁市教育委員会', note: '普通科。R7募集定員40人。' },
  { no: 435, prefecture: '岡山県', municipality: '高梁市', name: '高梁市立宇治高等学校', publicPrivate: '公立', operator: '高梁市教育委員会', note: '普通科。R7募集定員40人。' },
  { no: 436, prefecture: '岡山県', municipality: '備前市', name: '備前市立片上高等学校', publicPrivate: '公立', operator: '備前市教育委員会', note: '普通科。R7募集定員40人。' },

  // ===== 広島県（15校） =====
  // 出典: 広島県教育委員会 令和6年度 入学定員資料 https://www.pref.hiroshima.lg.jp/uploaded/attachment/548698.pdf
  //       広島市教育委員会 学校一覧 https://www.city.hiroshima.lg.jp/site/education/16733.html
  { no: 437, prefecture: '広島県', municipality: '広島市安佐北区', name: '広島県立可部高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 438, prefecture: '広島県', municipality: '呉市', name: '広島県立呉工業高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '機械科（技能連携を含む）・電気科。' },
  { no: 439, prefecture: '広島県', municipality: '三原市', name: '広島県立三原高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '午前部・夜間部', note: '普通科。' },
  { no: 440, prefecture: '広島県', municipality: '尾道市', name: '広島県立尾道南高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 441, prefecture: '広島県', municipality: '尾道市（因島）', name: '広島県立因島高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 442, prefecture: '広島県', municipality: '福山市', name: '広島県立福山誠之館高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 443, prefecture: '広島県', municipality: '福山市', name: '広島県立葦陽高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '午前部', note: '普通科。' },
  { no: 444, prefecture: '広島県', municipality: '福山市', name: '広島県立松永高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 445, prefecture: '広島県', municipality: '福山市', name: '広島県立福山工業高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '機械科（技能連携を含む）・電気科。' },
  { no: 446, prefecture: '広島県', municipality: '福山市', name: '広島県立芦品まなび学園高等学校', publicPrivate: '公立', operator: '広島県教育委員会', schoolCategory: 'standalone', parts: '三部制（午前部・午後部・夜間部）', curriculumType: '単位制', note: '普通科のみ。所在地は福山市新市町戸手1330。定時制単独の三部制・単位制高校。' },
  { no: 447, prefecture: '広島県', municipality: '三次市', name: '広島県立三次高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 448, prefecture: '広島県', municipality: '東広島市', name: '広島県立賀茂高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 449, prefecture: '広島県', municipality: '廿日市市', name: '広島県立廿日市高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '普通科。' },
  { no: 450, prefecture: '広島県', municipality: '廿日市市', name: '広島県立宮島工業高等学校', publicPrivate: '公立', operator: '広島県教育委員会', parts: '夜間', note: '機械科（技能連携を含む）。' },
  { no: 451, prefecture: '広島県', municipality: '広島市中区', name: '広島市立広島みらい創生高等学校', publicPrivate: '公立', operator: '広島市教育委員会', schoolCategory: 'standalone', curriculumType: '単位制（学年の区分なし）', note: '定時制は「平日登校コース」、通信制は「通信教育コース」。学科はキャリアデザイン科。授業料は定時制1単位につき1,740円。' },

  // ===== 愛媛県（4校） =====
  // 出典: 各校公式サイト（esnet.ed.jpドメイン）、愛媛県教育委員会 地区別募集定員計画PDF(R5) https://ehime-c.esnet.ed.jp/koukou/shinkou/shiryou/R5chikubetu.pdf
  // 注: 定時制設置校を網羅した公式一覧PDFには到達できず、個別学校サイトでの確認に依拠。今治・新居浜・宇和島等に他の設置校がないかは未確認。
  { no: 452, prefecture: '愛媛県', municipality: '松山市', name: '愛媛県立松山工業高等学校定時制', publicPrivate: '公立', operator: '愛媛県教育委員会', schoolCategory: 'attached', officialUrl: 'https://matsuyama-th-pt.esnet.ed.jp/', note: '学科は機械科・建築科。授業開始は17:40から。4年間での卒業が基本。' },
  { no: 453, prefecture: '愛媛県', municipality: '八幡浜市', name: '愛媛県立八幡浜高等学校定時制', publicPrivate: '公立', operator: '愛媛県教育委員会', schoolCategory: 'attached', officialUrl: 'https://yawatahama-h-pt.esnet.ed.jp/', note: '学科は普通科（入学定員40名）。時間割は17:00〜21:05（夜間のみ）。沿革上「昼間部」が設けられた時期があったが後に廃止。' },
  { no: 454, prefecture: '愛媛県', municipality: '西条市', name: '愛媛県立西条高等学校定時制', publicPrivate: '公立', operator: '愛媛県教育委員会', schoolCategory: 'attached', note: '学科は普通科。所在地：西条市明屋敷234番地。' },
  { no: 455, prefecture: '愛媛県', municipality: '大洲市', name: '愛媛県立大洲高等学校肱川分校', publicPrivate: '公立', operator: '愛媛県教育委員会', schoolCategory: 'attached', parts: '昼間定時制', note: '本校は愛媛県立大洲高等学校。学科は普通（昼間）、募集定員1学級40名。所在地：大洲市肱川町宇和川3395。' },

  // ===== 高知県（10校） =====
  // 出典: 高知県教育委員会 入学定員PDF(R4) https://www.pref.kochi.lg.jp/doc/r4_koukouyushi_main/file_contents/r4_koukouteiinn.pdf
  // 注: 所在市町村・部制・単位制区分は資料に記載なく省略。「高知工業」「高知東」等は記述が曖昧なため今回は含めず。
  { no: 456, prefecture: '高知県', name: '高知県立室戸高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜4名）。' },
  { no: 457, prefecture: '高知県', name: '高知県立山田高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜4名）。' },
  { no: 458, prefecture: '高知県', name: '高知県立高知東工業高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・工業科（機械／電気／土木／建築）、各学科入学定員40名（成人特別選抜は機械科4名、他学科各20名）。' },
  { no: 459, prefecture: '高知県', name: '高知県立高岡高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜8名）。' },
  { no: 460, prefecture: '高知県', name: '高知県立須崎総合高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜4名）。' },
  { no: 461, prefecture: '高知県', name: '高知県立佐川高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜8名）。' },
  { no: 462, prefecture: '高知県', name: '高知県立大方高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜4名）。' },
  { no: 463, prefecture: '高知県', name: '高知県立宿毛高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜4名）。' },
  { no: 464, prefecture: '高知県', name: '高知県立清水高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・普通科、入学定員40名（うち成人特別選抜4名）。' },
  { no: 465, prefecture: '高知県', name: '高知県立高知商業高等学校', publicPrivate: '公立', operator: '高知県教育委員会', schoolCategory: 'attached', note: '定時制・商業科、入学定員40名（うち成人特別選抜4名）。' },

  // ===== 徳島県（1校） =====
  // 出典: 徳島県教育委員会「避難施設一覧」資料、徳島中央高等学校公式サイト
  // 徳島県教育委員会資料によれば、県内で定時制課程を置く高校は本校のみ。
  { no: 466, prefecture: '徳島県', municipality: '徳島市', name: '徳島県立徳島中央高等学校', publicPrivate: '公立', operator: '徳島県教育委員会', parts: '昼間部・夜間部', officialUrl: 'https://tokushimachuo.tokushima-ec.ed.jp/', note: '徳島県内で唯一、定時制（昼間部・夜間部）課程を置く高等学校。通信制課程も併設。所在地は徳島市北矢三町1丁目3番8号。昼間部・夜間部の正式な学科名、単位制／学年制の区分は確認できなかった。' },

  // ===== 香川県（8校） =====
  // 出典: 香川県 令和9年度公立高等学校入学定員 https://www.pref.kagawa.lg.jp/documents/64233/r9_nyuugakuteiin_full.pdf
  //       各校学校紹介資料（pref.kagawa.lg.jp/documents/17867/ 配下）
  // 注: 入学定員表の行抽出に高松/高松工芸、丸亀/多度津の混在が疑われ、各校自身の資料で裏取りした（完全には解消できていない点を明記）。
  { no: 467, prefecture: '香川県', municipality: '小豆郡小豆島町', name: '香川県立小豆島中央高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', curriculumType: '四修制（夜間授業のみ・4年で卒業）／三修制（夜間4時間＋昼間2時間・3年で卒業）を2学年以降に選択', note: '令和9年度入学定員 普通科40人。所在地：小豆郡小豆島町蒲生甲1001番地。「昼間部・夜間部」という部制表記はなく、修業年数による四修制／三修制の区分で運営。' },
  { no: 468, prefecture: '香川県', municipality: '東かがわ市', name: '香川県立三本松高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', note: '令和9年度入学定員 普通科40人。所在地（旧資料）：東かがわ市三本松1500番地1。部制の確認はできなかった。' },
  { no: 469, prefecture: '香川県', municipality: '木田郡三木町', name: '香川県立三木高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', note: '令和9年度入学定員 普通科40人。所在地（旧資料）：木田郡三木町平木750番地。部制の確認はできなかった。' },
  { no: 470, prefecture: '香川県', municipality: '高松市', name: '香川県立高松高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', note: '所在地：高松市番町三丁目1番1号。令和9年度入学定員 普通科40人。同校自身の学校紹介資料では定時制課程の学科は「普通科のみ」と明記。' },
  { no: 471, prefecture: '香川県', municipality: '高松市', name: '香川県立高松商業高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', note: '令和9年度入学定員 商業科40人。所在地（旧資料）：高松市松島町1丁目18番54号。部制の確認はできなかった。' },
  { no: 472, prefecture: '香川県', municipality: '高松市', name: '香川県立高松工芸高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', note: '同校自身の学校紹介資料（令和8年度分）に定時制課程（工業科：機械科・建築科・インテリア科、4学年・12学級、全校生徒46名）の記載あり。ただし香川県の令和9年度入学定員一覧には該当行が見当たらず、新規募集の有無は資料上確認できていない。' },
  { no: 473, prefecture: '香川県', municipality: '丸亀市', name: '香川県立丸亀高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', note: '所在地：丸亀市六番丁1番地。令和9年度入学定員 普通科40人（全校生徒38名）。同校自身の学校紹介資料では定時制課程は「普通科」のみと明記。' },
  { no: 474, prefecture: '香川県', municipality: '観音寺市', name: '香川県立観音寺第一高等学校', publicPrivate: '公立', operator: '香川県教育委員会', schoolCategory: 'attached', note: '令和9年度入学定員 普通科40人。所在地（旧資料）：観音寺市茂木町4丁目2番38号。部制の確認はできなかった。' },
];
