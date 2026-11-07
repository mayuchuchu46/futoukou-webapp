import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isFacilityFeatureTag } from '@/lib/data/facilityFeatures';
import {
  MAX_FACILITY_PHOTO_BYTES,
  isAllowedFacilityPhotoType,
  uploadFacilityPhoto,
} from '@/lib/facilityPhoto';

// 施設・学校の費用・特徴タグ・写真の提案フォーム送信先（2026-11-07追加、写真対応で
// multipart/form-data に変更）。誰でも送信できる（ログイン不要）が、即時には公開
// されない。運営が/adminで承認するまでは表示されない
// （app/api/admin/facility-info/review/route.ts）。
const FACILITY_TYPES = ['free', 'alternative', 'online'] as const;
type FacilityType = (typeof FACILITY_TYPES)[number];

function isFacilityType(value: unknown): value is FacilityType {
  return typeof value === 'string' && (FACILITY_TYPES as readonly string[]).includes(value);
}

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const facilityType = form.get('facility_type');
  if (!isFacilityType(facilityType)) {
    return NextResponse.json({ error: 'invalid facility_type' }, { status: 400 });
  }
  const no = Number(form.get('facility_no'));
  if (!Number.isInteger(no)) {
    return NextResponse.json({ error: 'invalid facility_no' }, { status: 400 });
  }

  let featuresRaw: unknown = [];
  try {
    const rawStr = form.get('features');
    featuresRaw = typeof rawStr === 'string' ? JSON.parse(rawStr) : [];
  } catch {
    featuresRaw = [];
  }
  const safeFeatures = Array.isArray(featuresRaw)
    ? featuresRaw.filter((f): f is string => typeof f === 'string' && isFacilityFeatureTag(f))
    : [];

  const safeFee = str(form, 'fee')?.slice(0, 200) ?? null;
  const safeNote = str(form, 'note')?.slice(0, 1000) ?? null;
  const safeContact = str(form, 'submitter_contact')?.slice(0, 200) ?? null;
  const safeRole = form.get('submitter_role') === 'staff' ? 'staff' : 'parent';
  const safeName = str(form, 'facility_name')?.slice(0, 200) ?? '';

  const photo = form.get('photo');
  const hasPhoto = photo instanceof File && photo.size > 0;

  if (!safeFee && safeFeatures.length === 0 && !hasPhoto) {
    return NextResponse.json({ error: '費用・特徴タグ・写真のいずれかを入力してください' }, { status: 400 });
  }
  if (hasPhoto) {
    if (!isAllowedFacilityPhotoType((photo as File).type)) {
      return NextResponse.json({ error: '写真はjpg・png・webpのいずれかで添付してください' }, { status: 400 });
    }
    if ((photo as File).size > MAX_FACILITY_PHOTO_BYTES) {
      return NextResponse.json(
        { error: `写真のファイルサイズは${MAX_FACILITY_PHOTO_BYTES / 1024 / 1024}MB以内にしてください` },
        { status: 400 }
      );
    }
  }

  const supabase = getSupabaseAdmin();
  // 先にid（行の主キー）を発行し、写真があればそのidをストレージのパスに使う
  // （lib/facilityPhoto.ts）。挿入前にアップロードするため、挿入自体が失敗した
  // 場合は写真だけ孤立して残る可能性があるが、非公開情報ではなく実害は小さいため許容する。
  const id = crypto.randomUUID();
  let photoUrl: string | null = null;
  if (hasPhoto) {
    try {
      photoUrl = await uploadFacilityPhoto(id, photo as File);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'アップロードに失敗しました';
      return NextResponse.json({ error: '写真のアップロードに失敗しました: ' + message }, { status: 500 });
    }
  }

  const { error } = await supabase.from('facility_info_submissions').insert({
    id,
    facility_type: facilityType,
    facility_no: no,
    facility_name: safeName,
    fee: safeFee,
    features: safeFeatures,
    submitter_role: safeRole,
    submitter_contact: safeContact,
    note: safeNote,
    photo_url: photoUrl,
    status: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
