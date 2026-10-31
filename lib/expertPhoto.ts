// 専門家プロフィール写真（アイコン用）のファイル管理設定。
//
// 登録証（expert-documents）とは異なり、プロフィール写真は専門家一覧などで
// 誰でも閲覧できる前提の情報なので、公開バケット（expert-photos、public: true）に保存し、
// Supabaseの公開URL（getPublicUrl）をそのまま experts.photo_url に入れる。
import { getSupabaseAdmin } from '@/lib/supabase';

export const EXPERT_PHOTO_BUCKET = 'expert-photos';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedPhotoType(type: string): boolean {
  return ALLOWED_TYPES.has(type);
}

// 写真をアップロードし、公開URLを返す。パスは専門家IDごとに固定（upsert）にすることで、
// 差し替え時に古いファイルが残り続けないようにしている。
export async function uploadExpertPhoto(expertId: string, file: File): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const path = `${expertId}/photo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(EXPERT_PHOTO_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(EXPERT_PHOTO_BUCKET).getPublicUrl(path);
  // ファイルパスが専門家IDごとに固定（上書き保存）のため、差し替えても公開URLの
  // 見た目は同じで、ブラウザ・CDN側にキャッシュされた古い画像がそのまま表示され
  // 続けてしまう（2026-10-31、「写真をアップロードし直したのに変更されてるか
  // わからない」との報告を受けて発覚）。アップロード時刻をクエリパラメータとして
  // 付け、差し替えるたびにURL自体が変わるようにしてキャッシュを回避する。
  return `${data.publicUrl}?v=${Date.now()}`;
}
