// 「先輩保護者からこの学校の話を聞く」機能（学校の各紹介ページ）用の、学校名マッチング条件の組み立て。
// components/FacilityExperiencedParents.tsx と app/gakko/school/[no]/SchoolExperiencedParents.tsx の
// 両方で使うため共通化した（2026-10-31）。
//
// マッチング条件は2系統をORで組み合わせる：
// 1. bio（自己紹介文）に学校名・愛称がilikeで含まれているか（従来からの方式。専用欄が無かった
//    頃に登録した先輩保護者もヒットするよう引き続き残す）。
// 2. experienced_school_names（専用の構造化入力欄、2026-10-31追加）に学校名・愛称が
//    配列として含まれているか（ov=overlap演算子）。自由記述のbioより表記揺れに強い。
export function buildExperiencedParentOrFilter(candidateNames: string[]): string {
  const names = candidateNames.filter((n) => n && n.trim());
  const bioConditions = names.map((n) => `bio.ilike.%${n}%`);
  const arrayLiteral = pgTextArrayLiteral(names);
  const schoolNamesCondition = `experienced_school_names.ov.${arrayLiteral}`;
  return [...bioConditions, schoolNamesCondition].join(',');
}

// PostgRESTのフィルタ構文でtext[]カラムに渡すPostgres配列リテラル（例：{"〇〇学園","△△"}）を組み立てる。
// 学校名はapp/lib/data配下の静的データ（運営管理）由来のため危険な入力ではないが、
// カンマ・波かっこ・ダブルクォート・バックスラッシュを含む場合に備えて念のためエスケープする。
function pgTextArrayLiteral(values: string[]): string {
  const escaped = values.map((v) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
  return `{${escaped.join(',')}}`;
}
