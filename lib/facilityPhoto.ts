// 施設・学校の写真（施設自身からの提供のみ）のファイル管理設定。lib/expertPhoto.tsと
// 同じ考え方（2026-11-07追加）。
//
// 施設自体の写真は、公式サイト等からの無断転載も、AI生成による実在校の見た目の
// 再現も避ける方針（app/gakko/school/[no]/page.tsx等のコメント参照）。そのため、
// 施設・学校自身がfacility_info_submissionsの提案フォームからアップロードし、
// 運営の承認を経て公開した写真のみを表示する。公開バケット（facility-photos）に保存。
import { getSupabaseAdmin } from '@/lib/supabase';

export const FACILITY_PHOTO_BUCKET = 'facility-photos';

export const MAX_FACILITY_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedFacilityPhotoType(type: string): boolean {
  return ALLOWED_TYPES.has(type);
}

// submissionId（facility_info_submissionsの行id）ごとにパスを固定し、公開URLを返す。
export async function uploadFacilityPhoto(submissionId: string, file: File): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const path = `${submissionId}/photo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(FACILITY_PHOTO_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(FACILITY_PHOTO_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
