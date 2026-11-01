import { FREE_SCHOOLS, FreeSchool } from '@/lib/data/freeSchools';
import { MANABI_TAYOUKA_GAKKO, ManabiTayoukaGakko } from '@/lib/data/manabiTayoukaGakko';
import { EDUCATION_SUPPORT_CENTERS, EducationSupportCenter } from '@/lib/data/educationSupportCenters';

// 「お住まいの地域（都道府県・市区町村）」に実際にある学びの場（フリースクール・
// 学びの多様化学校・教育支援センター）を引くための共通ロジック（2026-11-01追加、
// 2026-11-02に教育支援センターを追加）。
// もともとapp/news/[id]/RelatedLocalSchools.tsx（自治体ニュース記事用）にのみ
// あったものを、ホーム画面の「自分の地域登録」機能（components/MyRegionCard.tsx）
// でも使うために共通化した。DBには問い合わせない（静的データの絞り込みのみ）ため、
// サーバー・クライアントどちらのコンポーネントからも呼べる。
//
// 教育支援センターを追加した経緯：フリースクール・学びの多様化学校のデータが
// 無い市区町村（例：埼玉県志木市）は、実際には教育支援センターがあるにもかかわらず
// 「自分の地域登録」のセレクトボックスに出てこず選べない、という指摘を受けた
// （志木市立教育サポートセンター ステップルームはeducationSupportCenters.tsに
// 既に収録されていたが、getCitiesForPrefecture/getLocalSchoolsが参照していなかった）。
//
// city側はデータの粒度が施設によって異なる（学びの多様化学校は「名古屋市」のように
// 市区町村まで、フリースクールは「名古屋市中区」のように区まで入っていることが多い）
// ため、完全一致ではなくstartsWithで判定する（prefectureは完全一致。同名の
// 市区町村が別の都道府県にある場合の取り違えを防ぐ）。
export function getLocalSchools(
  prefecture: string,
  city: string
): { freeSchools: FreeSchool[]; manabiSchools: ManabiTayoukaGakko[]; supportCenters: EducationSupportCenter[] } {
  const freeSchools = FREE_SCHOOLS.filter(
    (s) => s.prefecture === prefecture && s.city.startsWith(city)
  );
  const manabiSchools = MANABI_TAYOUKA_GAKKO.filter(
    (s) => s.prefecture === prefecture && s.city.startsWith(city)
  );
  const supportCenters = EDUCATION_SUPPORT_CENTERS.filter(
    (s) => s.prefecture === prefecture && s.city.startsWith(city)
  );
  return { freeSchools, manabiSchools, supportCenters };
}

// 「自分の地域登録」機能の市区町村セレクタ用（2026-11-01追加、2026-11-02に
// 教育支援センターを追加）。指定した都道府県にある施設（フリースクール・
// 学びの多様化学校・教育支援センター）のcityを重複なく集めて返す。
// ここに出てくる市区町村名は、必ずいずれかのデータに1件以上存在する
// （＝登録してもgetLocalSchoolsが0件になることはない）。
export function getCitiesForPrefecture(prefecture: string): string[] {
  const cities = new Set<string>();
  for (const s of FREE_SCHOOLS) {
    if (s.prefecture === prefecture && s.city) cities.add(s.city);
  }
  for (const s of MANABI_TAYOUKA_GAKKO) {
    if (s.prefecture === prefecture && s.city) cities.add(s.city);
  }
  for (const s of EDUCATION_SUPPORT_CENTERS) {
    if (s.prefecture === prefecture && s.city) cities.add(s.city);
  }
  return Array.from(cities).sort((a, b) => a.localeCompare(b, 'ja'));
}
