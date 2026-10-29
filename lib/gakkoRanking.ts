import { cacheLife } from 'next/cache';
import { getSupabaseAdmin } from './supabase';
import { findMentionedSchool } from './schoolFacts';
import {
  findMentionedFreeSchool,
  findMentionedCorrespondenceSchool,
  findMentionedOnlineFreeSchool,
} from './facilityLinkMatch';
import { FeaturedGakko, FeaturedGakkoType } from './gakkoRankingTypes';

// ホーム画面「注目の学び場」ランキング（2026-10-29追加）。「注目の学び場、みたいな感じで
// ランキング出すのどう？トップに」との要望を受けて新設。
//
// 学校・施設の個別ページ（/gakko/school/[no]等）には相談（consultations）と違って
// 閲覧数（views）の記録が無いため、「よく読まれている相談」のような閲覧数ベースの
// ランキングはそのままでは作れない。新たに架空の数値を置いたり、閲覧トラッキングを
// 急ぎで足したりするのではなく、既にある実データ――実際に寄せられた相談の本文に
// その学校・施設名が出てきた件数――を「注目度」の代わりに使う。
//
// この「相談文に学校名が含まれているか」の判定自体は、学校個別ページの
// 「この学校についての相談」欄（app/gakko/school/[no]/SchoolConsultations.tsx等）や、
// AIへの事実注入（lib/schoolFacts.ts, lib/facilityLinkMatch.ts）で既に使っている
// 部分一致マッチング関数（findMentionedSchool等）をそのまま再利用する。新しい
// マッチングロジックを増やさない。
//
// 直近SCAN_LIMIT件（新着順）の相談だけを対象にすることで、「最近注目されている」
// という意味合いに近づける（開設から2週間の時点では実質ほぼ全件が対象になる）。
const SCAN_LIMIT = 500;

export async function getFeaturedGakkoRanking(topN = 5): Promise<FeaturedGakko[]> {
  // 全ユーザー共通（ログイン状態等に依存しない）の公開データのため、数分単位でキャッシュする
  // （直近500件の相談本文を毎回スキャンするコストを抑えるため。lib/themeSummary.tsの
  // getThemeSummaryと同じ考え方）。
  'use cache';
  cacheLife('minutes');
  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from('consultations')
    .select('question, answer')
    .eq('hidden', false)
    .is('parent_id', null)
    .not('answer', 'is', null)
    .order('created_at', { ascending: false })
    .limit(SCAN_LIMIT);

  if (!rows || rows.length === 0) return [];

  const counts = new Map<string, FeaturedGakko>();

  const bump = (type: FeaturedGakkoType, no: number, name: string, href: string) => {
    const key = `${type}-${no}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { key, type, no, name, href, count: 1 });
    }
  };

  for (const row of rows) {
    const texts = [row.question, row.answer];
    // 1件の相談から複数種別・複数校が一致することもあるが（例：A校とB校を比較する
    // 相談）、それぞれ独立の加点として扱う（1相談=1票に絞り込まない）。
    const school = findMentionedSchool(texts);
    if (school) bump('school', school.no, school.name, `/gakko/school/${school.no}`);

    const free = findMentionedFreeSchool(texts);
    if (free) bump('free', free.no, free.name, `/gakko/free/${free.no}`);

    const tsushin = findMentionedCorrespondenceSchool(texts);
    if (tsushin) bump('tsushin', tsushin.no, tsushin.name, `/gakko/tsushin/${tsushin.no}`);

    const online = findMentionedOnlineFreeSchool(texts);
    if (online) bump('online', online.no, online.name, `/gakko/online/${online.no}`);
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, topN);
}
