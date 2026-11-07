import { getSupabaseAdmin } from './supabase';
import type { FacilityFeatureTag } from './data/facilityFeatures';

// フリースクール（free）・オルタナティブスクール（alternative）・
// オンラインフリースクール（online）の3カテゴリのみ対象。学びの多様化学校（school）は
// 公立校で費用が発生しないため対象外（2026-11-07、CoCon等の競合比較を受けて追加）。
export type FacilityType = 'free' | 'alternative' | 'online';

export type ApprovedFacilityInfo = {
  fee: string | null;
  features: FacilityFeatureTag[];
  updatedAt: string;
};

// 承認済み（status='approved'）の提案のうち、最新のものだけを採用する。
// 施設自身の自己申告のみを情報源とし、運営がWeb調査で埋めることはしない
// （facility_info_submissions, lib/data/facilityFeatures.ts冒頭のコメント参照）。
export async function getApprovedFacilityInfo(
  facilityType: FacilityType,
  facilityNo: number
): Promise<ApprovedFacilityInfo | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('facility_info_submissions')
    .select('fee, features, reviewed_at, created_at')
    .eq('facility_type', facilityType)
    .eq('facility_no', facilityNo)
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    fee: data.fee || null,
    features: (data.features || []) as FacilityFeatureTag[],
    updatedAt: data.reviewed_at || data.created_at,
  };
}
