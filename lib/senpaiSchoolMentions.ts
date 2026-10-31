import { MANABI_TAYOUKA_GAKKO } from './data/manabiTayoukaGakko';
import { CORRESPONDENCE_HIGH_SCHOOLS } from './data/correspondenceHighSchools';
import { FREE_SCHOOLS } from './data/freeSchools';
import { teijiseiHighSchools } from './data/teijiseiHighSchools';
import { ONLINE_FREE_SCHOOLS } from './data/onlineFreeSchools';

// 先輩保護者（経験者）のプロフィールページ（app/senpai/[id]/page.tsx）に、
// 「この方が話せる学校」を自動で出すための仕組み（2026-10-31追加）。
//
// 学校ページ側（SchoolExperiencedParents.tsx・FacilityExperiencedParents.tsx）は
// 「学校名 → 一致する先輩保護者」という向きの検索（ilikeでbioを検索）だが、
// こちらはその逆（先輩保護者のbio → 一致する学校）。5つの学校データセットは
// すべてアプリのメモリ上に持っている定数配列なので、DB問い合わせではなく、
// bioの文字列に対してJS側で単純な部分一致を行う（学校名が短すぎると誤マッチ
// しやすいため、3文字以下の名称は対象外にする。lib/schoolFacts.tsの
// coreName()と同じ考え方）。
//
// 1人の先輩保護者が複数の学校に言及することは稀だが、0件避けのため最大5件まで返す。
export type SenpaiSchoolMention = {
  name: string;
  path: string;
};

const MUNICIPAL_PREFIX_RE = /^.+?(?:都|道|府|県|市|区|町|村)立/;

function coreName(name: string): string | null {
  const m = name.match(MUNICIPAL_PREFIX_RE);
  if (!m) return null;
  const rest = name.slice(m[0].length);
  return rest.length > 3 ? rest : null;
}

function nameMatches(bio: string, name: string | null | undefined): boolean {
  if (!name || name.length <= 3) return false;
  if (bio.includes(name)) return true;
  const core = coreName(name);
  return !!core && bio.includes(core);
}

export function findSchoolMentionsInBio(bio: string | null | undefined): SenpaiSchoolMention[] {
  if (!bio) return [];
  const mentions: SenpaiSchoolMention[] = [];

  for (const s of MANABI_TAYOUKA_GAKKO) {
    if (nameMatches(bio, s.name) || nameMatches(bio, s.branchName)) {
      mentions.push({ name: s.branchName || s.name, path: `/gakko/school/${s.no}` });
    }
  }
  for (const s of CORRESPONDENCE_HIGH_SCHOOLS) {
    if (nameMatches(bio, s.name)) {
      mentions.push({ name: s.name, path: `/gakko/tsushin/${s.no}` });
    }
  }
  for (const s of FREE_SCHOOLS) {
    if (nameMatches(bio, s.name)) {
      mentions.push({ name: s.name, path: `/gakko/free/${s.no}` });
    }
  }
  for (const s of teijiseiHighSchools) {
    if (nameMatches(bio, s.name)) {
      mentions.push({ name: s.name, path: `/gakko/teiji/${s.no}` });
    }
  }
  for (const s of ONLINE_FREE_SCHOOLS) {
    if (nameMatches(bio, s.name)) {
      mentions.push({ name: s.name, path: `/gakko/online/${s.no}` });
    }
  }

  // 同じ学校を複数データセットで二重に拾うことは構造上ないが、念のため
  // path単位で重複を除く。
  const seen = new Set<string>();
  return mentions.filter((m) => (seen.has(m.path) ? false : (seen.add(m.path), true))).slice(0, 5);
}

// 自己紹介文（bio）からの自動検出は、表記ゆれ（愛称・略称・自治体名の有無等）で
// 一致しないことが多く、「話せる学校」セクションが何も出ないケースがあった
// （2026-10-31発覚）。別のセッションの作業で、登録・プロフィール編集画面に
// 「保護者視点で話せる学校名」専用の自由入力欄（experienced_school_names、
// 1件ずつ追加する方式）が既に追加されていたため、そちらを主たる情報源として使う
// （lib/expertSchoolMatch.tsが学校ページ側の逆引きに使っているのと同じカラム）。
// 自由入力のため実在の学校ページに結びつくとは限らず、ここでは各名称を5データ
// セットに対して照合し、一致すればリンク付き、一致しなければ名前のみで表示する。
export function resolveSchoolName(name: string): SenpaiSchoolMention {
  const trimmed = name.trim();
  for (const s of MANABI_TAYOUKA_GAKKO) {
    if (trimmed === s.name || trimmed === s.branchName) {
      return { name: s.branchName || s.name, path: `/gakko/school/${s.no}` };
    }
  }
  for (const s of CORRESPONDENCE_HIGH_SCHOOLS) {
    if (trimmed === s.name) return { name: s.name, path: `/gakko/tsushin/${s.no}` };
  }
  for (const s of FREE_SCHOOLS) {
    if (trimmed === s.name) return { name: s.name, path: `/gakko/free/${s.no}` };
  }
  for (const s of teijiseiHighSchools) {
    if (trimmed === s.name) return { name: s.name, path: `/gakko/teiji/${s.no}` };
  }
  for (const s of ONLINE_FREE_SCHOOLS) {
    if (trimmed === s.name) return { name: s.name, path: `/gakko/online/${s.no}` };
  }
  // 完全一致する学校ページが見つからない場合でも、本人が入力した名前自体は
  // 信頼できる情報として、リンク無しのテキストとして表示する。
  return { name: trimmed, path: '' };
}
