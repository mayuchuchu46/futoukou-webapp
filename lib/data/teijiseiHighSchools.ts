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
];
