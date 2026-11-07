// 施設・学校の「特徴タグ」固定語彙（2026-11-07追加）。
//
// 競合の不登校支援ポータル（CoCon等）が個別施設ページに「少人数制」「見学可」のような
// 一目でわかるタグを出しているのに対し、どうする先生の施設ページにはこれが無かった。
// ただし運営側がWeb調査で全施設分を確認するのは非現実的（事実確認が取れないものを
// 推測で埋めない方針のため、結局「記載なし」ばかりになる）。そこで、施設・学校の
// 関係者自身に申告してもらい、運営が内容を確認したうえで公開する運用にする
// （facility_info_submissions、lib/facilityInfo.ts参照）。
//
// タグは固定語彙のみ（自由記述タグは認めない）。一覧性・比較可能性を保つため。
export type FacilityFeatureTag =
  | 'small_group'
  | 'tour_available'
  | 'online_available'
  | 'school_attendance_linkage'
  | 'individual_support'
  | 'developmental_support'
  | 'free_trial'
  | 'subsidy_eligible'
  | 'pickup_available'
  | 'flexible_schedule';

export const FACILITY_FEATURE_LABEL: Record<FacilityFeatureTag, string> = {
  small_group: '少人数制',
  tour_available: '見学可',
  online_available: 'オンライン対応',
  school_attendance_linkage: '登校扱い連携可',
  individual_support: '個別対応',
  developmental_support: '発達特性への対応',
  free_trial: '体験利用可',
  subsidy_eligible: '助成金対象',
  pickup_available: '送迎あり',
  flexible_schedule: '通う頻度を選べる',
};

export const FACILITY_FEATURE_OPTIONS = Object.keys(FACILITY_FEATURE_LABEL) as FacilityFeatureTag[];

export function isFacilityFeatureTag(value: string): value is FacilityFeatureTag {
  return (FACILITY_FEATURE_OPTIONS as string[]).includes(value);
}
