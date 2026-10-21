import { ManabiTayoukaGakko } from './data/manabiTayoukaGakko';
import { FreeSchool } from './data/freeSchools';
import { CorrespondenceHighSchool } from './data/correspondenceHighSchools';
import { OnlineFreeSchool } from './data/onlineFreeSchools';

// 各詳細ページ（/gakko/school, /gakko/free, /gakko/tsushin, /gakko/online）の下部に、
// そのページを見た人が次に見たくなりそうな他の学校・施設を表示するための判定
// （2026-10-21追加。「似ている学校というか、それを見た人が次に見たくなるような掲載」
// との要望を受けて）。
//
// 「似ている」をAIや曖昧な基準ででっち上げるのではなく、各データが実際に持っている
// 項目（都道府県・市区町村・学校種・運営法人・カテゴリ等）だけを根拠にする。
// タイプごとに持っている項目が違うため、関数もタイプごとに分けている。

const DEFAULT_LIMIT = 5;

// 学びの多様化学校：まず同じ都道府県（地理的に現実的な選択肢）を優先し、
// 足りなければ同じ学校種（小学校／中学校／高校等）を全国から補う。
// 都道府県あたりの該当数が少ない（全国84校）ため、学校種での補完が無いと
// 同じ都道府県に他校が無い学校では何も表示できなくなってしまう。
export function findSimilarManabiSchools(
  all: ManabiTayoukaGakko[],
  current: ManabiTayoukaGakko,
  limit = DEFAULT_LIMIT
): ManabiTayoukaGakko[] {
  const others = all.filter((s) => s.no !== current.no);
  const samePref = others.filter((s) => s.prefecture === current.prefecture);
  const samePrefNos = new Set(samePref.map((s) => s.no));
  const sameType = others.filter((s) => s.schoolType === current.schoolType && !samePrefNos.has(s.no));
  return [...samePref, ...sameType].slice(0, limit);
}

// フリースクール：同じ市区町村を最優先（通える距離の可能性が高い）、
// 足りなければ同じ都道府県内から補う。
export function findSimilarFreeSchools(
  all: FreeSchool[],
  current: FreeSchool,
  limit = DEFAULT_LIMIT
): FreeSchool[] {
  const others = all.filter((s) => s.no !== current.no);
  const sameCity = others.filter((s) => s.prefecture === current.prefecture && s.city === current.city);
  const sameCityNos = new Set(sameCity.map((s) => s.no));
  const samePref = others.filter((s) => s.prefecture === current.prefecture && !sameCityNos.has(s.no));
  return [...sameCity, ...samePref].slice(0, limit);
}

// 通信制高校（広域）：本校所在地の都道府県が同じものを優先しつつ、同じ設置者
// （学校法人・企業）が運営する他校（例：学校法人三幸学園の複数校）も関心が近いと
// 考えられるため補う。広域通信制は本校の都道府県以外からも入学できるため、
// 都道府県の一致自体は「通える距離」を保証するものではない点に留意（詳細ページ本文の
// 説明と矛盾しないよう、あくまで補助的な一致基準として扱う）。
export function findSimilarCorrespondenceHighSchools(
  all: CorrespondenceHighSchool[],
  current: CorrespondenceHighSchool,
  limit = DEFAULT_LIMIT
): CorrespondenceHighSchool[] {
  const others = all.filter((s) => s.no !== current.no);
  const samePref = others.filter((s) => s.prefecture === current.prefecture);
  const samePrefNos = new Set(samePref.map((s) => s.no));
  const sameOperator = others.filter((s) => s.operator === current.operator && !samePrefNos.has(s.no));
  return [...samePref, ...sameOperator].slice(0, limit);
}

// オンラインフリースクール：居住地を問わず利用できるため都道府県の概念が無い。
// 唯一の分類項目であるcategory（仲間づくり・居場所／学習サポート中心／要紹介）が
// 一致するものを挙げる。
export function findSimilarOnlineFreeSchools(
  all: OnlineFreeSchool[],
  current: OnlineFreeSchool,
  limit = DEFAULT_LIMIT
): OnlineFreeSchool[] {
  const others = all.filter((s) => s.no !== current.no);
  return others.filter((s) => s.category === current.category).slice(0, limit);
}
