import { CORRESPONDENCE_HIGH_SCHOOLS, type AttendanceStyle, type SpecialtyTag } from '@/lib/data/correspondenceHighSchools';
import { teijiseiHighSchools } from '@/lib/data/teijiseiHighSchools';
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';
import { FREE_SCHOOLS } from '@/lib/data/freeSchools';
import { ONLINE_FREE_SCHOOLS } from '@/lib/data/onlineFreeSchools';
import { ALTERNATIVE_SCHOOLS } from '@/lib/data/alternativeSchools';
import { parseTargetGrades } from '@/lib/schoolGrade';

// 選択式診断（app/gakko/shindan）で使う、サイト掲載の全種類の学校を共通の形にそろえたデータ。
// 各データの事実だけを写しており、診断のために新しく推測した値は入れない：
// - grades: 対象学年。通信制・定時制は高校課程（高1〜高3）、学びの多様化学校は学校種から、
//   それ以外はデータの対象学年の文字列から読み取る（読み取れなければnull＝未確認。lib/schoolGrade.ts）
// - styles/flexible: 通う頻度。通信制は確認済みの学校のみ。オンラインフリースクールは
//   「オンライン」であること自体が定義なのでonline。他の種類は確認済みデータが無いため空
// - care: 心のケア専門職の配置を確認できた学校（通信制・学びの多様化学校のフィールドのみ。
//   他の種類にはこの調査データが無いのでfalse＝未確認）

export type ShindanType = 'tsushin' | 'teiji' | 'manabi' | 'free' | 'online' | 'alternative';

export const SHINDAN_TYPE_LABEL: Record<ShindanType, string> = {
  tsushin: '通信制高校',
  teiji: '定時制高校',
  manabi: '学びの多様化学校',
  free: 'フリースクール等',
  online: 'オンラインのフリースクール',
  alternative: 'オルタナティブスクール',
};

export type ShindanItem = {
  id: string;
  type: ShindanType;
  name: string;
  href: string;
  // 所在地の都道府県。居住地に関係なく利用できるもの（オンライン）は null
  pref: string | null;
  city: string;
  // 通信制（広域）：本校以外のキャンパス等がある都道府県
  campusPrefs: string[];
  grades: number[] | null;
  // データに書かれている対象学年の元の文字列（表示用。無ければnull）
  ageText: string | null;
  styles: AttendanceStyle[];
  flexible: boolean;
  attendanceNote: string | null;
  care: boolean;
  // 公式ページで確認できたコース・専攻の分野（通信制高校のみ調査済み。他の種類は空＝未確認）
  specialties: SpecialtyTag[];
  sub: string;
};

const HS = [10, 11, 12];

export function buildShindanItems(): ShindanItem[] {
  const items: ShindanItem[] = [];

  for (const s of CORRESPONDENCE_HIGH_SCHOOLS) {
    items.push({
      id: `tsushin-${s.no}`,
      type: 'tsushin',
      name: s.name,
      href: `/gakko/tsushin/${s.no}`,
      pref: s.prefecture,
      city: s.municipality,
      campusPrefs: Array.from(new Set((s.campuses || []).map((c) => c.prefecture))),
      grades: HS,
      ageText: null,
      styles: s.attendanceStyles || [],
      flexible: !!s.attendanceFlexible,
      attendanceNote: s.attendanceNote || null,
      care: !!s.hasDedicatedMentalCareStaff,
      specialties: Array.from(new Set((s.specialties || []).map((x) => x.tag))),
      sub: `設置者：${s.operator}`,
    });
  }

  for (const s of teijiseiHighSchools) {
    items.push({
      id: `teiji-${s.no}`,
      type: 'teiji',
      name: s.name,
      href: `/gakko/teiji/${s.no}`,
      pref: s.prefecture,
      city: s.municipality || '',
      campusPrefs: [],
      grades: HS,
      ageText: null,
      styles: [],
      flexible: false,
      attendanceNote: null,
      care: false,
      specialties: [],
      sub: [s.publicPrivate, s.parts, s.nickname].filter(Boolean).join('・'),
    });
  }

  for (const s of MANABI_TAYOUKA_GAKKO) {
    const grades =
      s.schoolType === '小学校' ? [1, 2, 3, 4, 5, 6]
      : s.schoolType === '中学校' ? [7, 8, 9]
      : s.schoolType === '小・中' ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
      : s.schoolType === '高等学校' ? HS
      : null;
    items.push({
      id: `manabi-${s.no}`,
      type: 'manabi',
      name: s.branchName ? `${s.name}（${s.branchName}）` : s.name,
      href: `/gakko/school/${s.no}`,
      pref: s.prefecture,
      city: s.city,
      campusPrefs: [],
      grades,
      ageText: s.schoolType,
      styles: [],
      flexible: false,
      attendanceNote: null,
      care: !!s.hasDedicatedMentalCareStaff,
      specialties: [],
      sub: `${s.publicPrivate}・${s.type}`,
    });
  }

  for (const s of FREE_SCHOOLS) {
    items.push({
      id: `free-${s.no}`,
      type: 'free',
      name: s.name,
      href: `/gakko/free/${s.no}`,
      pref: s.prefecture,
      city: s.city,
      campusPrefs: [],
      grades: parseTargetGrades(s.ageRange),
      ageText: s.ageRange && s.ageRange !== '記載なし' ? s.ageRange : null,
      styles: [],
      flexible: false,
      attendanceNote: null,
      care: false,
      specialties: [],
      sub: '',
    });
  }

  for (const s of ONLINE_FREE_SCHOOLS) {
    items.push({
      id: `online-${s.no}`,
      type: 'online',
      name: s.name,
      href: `/gakko/online/${s.no}`,
      pref: null,
      city: '',
      campusPrefs: [],
      grades: parseTargetGrades(s.ageRange),
      ageText: s.ageRange || null,
      styles: ['online'],
      flexible: false,
      attendanceNote: null,
      care: false,
      specialties: Array.from(new Set((s.specialties || []).map((x) => x.tag))),
      sub: `運営：${s.operator}`,
    });
  }

  for (const s of ALTERNATIVE_SCHOOLS) {
    items.push({
      id: `alternative-${s.no}`,
      type: 'alternative',
      name: s.name,
      href: `/gakko/alternative/${s.no}`,
      pref: s.prefecture,
      city: s.city,
      campusPrefs: [],
      grades: parseTargetGrades(s.schoolType),
      ageText: s.schoolType,
      styles: [],
      flexible: false,
      attendanceNote: null,
      care: false,
      specialties: Array.from(new Set((s.specialties || []).map((x) => x.tag))),
      sub: s.isAccredited ? '一条校（認可私立学校）' : '',
    });
  }

  return items;
}
