// 全国の学び場・居場所の掲載件数（2026-11-07追加、「この数もうちょっとアピールした方が
// いいかな」との指摘を受けて）。トップページ・/gakko・PCサイドバーの複数箇所で使うため、
// ここに集約した（2026-11-08、サイドバーにも置くことになったのに合わせて共通化）。
// 開校準備中の学校（PLANNED_MANABI_TAYOUKA_GAKKO）・助成金情報（FREESCHOOL_SUBSIDIES）は
// 「掲載件数」の趣旨（学び場・居場所の件数）と性質が異なるため合計には含めない。
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';
import { FREE_SCHOOLS } from '@/lib/data/freeSchools';
import { ONLINE_FREE_SCHOOLS } from '@/lib/data/onlineFreeSchools';
import { EDUCATION_SUPPORT_CENTERS } from '@/lib/data/educationSupportCenters';
import { CORRESPONDENCE_HIGH_SCHOOLS } from '@/lib/data/correspondenceHighSchools';
import { teijiseiHighSchools } from '@/lib/data/teijiseiHighSchools';
import { ALTERNATIVE_SCHOOLS } from '@/lib/data/alternativeSchools';

export const FACILITY_COUNT_BREAKDOWN = {
  free: FREE_SCHOOLS.length,
  teiji: teijiseiHighSchools.length,
  shien: EDUCATION_SUPPORT_CENTERS.length,
  tsushin: CORRESPONDENCE_HIGH_SCHOOLS.length,
  gakko: MANABI_TAYOUKA_GAKKO.length,
  alternative: ALTERNATIVE_SCHOOLS.length,
  online: ONLINE_FREE_SCHOOLS.length,
};

export const TOTAL_FACILITY_COUNT =
  FACILITY_COUNT_BREAKDOWN.free +
  FACILITY_COUNT_BREAKDOWN.teiji +
  FACILITY_COUNT_BREAKDOWN.shien +
  FACILITY_COUNT_BREAKDOWN.tsushin +
  FACILITY_COUNT_BREAKDOWN.gakko +
  FACILITY_COUNT_BREAKDOWN.alternative +
  FACILITY_COUNT_BREAKDOWN.online;
