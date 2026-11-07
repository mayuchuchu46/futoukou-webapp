import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isFacilityFeatureTag } from '@/lib/data/facilityFeatures';

// 施設・学校の費用・特徴タグの提案フォーム送信先（2026-11-07追加）。
// 誰でも送信できる（ログイン不要）が、即時には公開されない。運営が/adminで
// 承認するまでは表示されない（app/api/admin/facility-info/review/route.ts）。
const FACILITY_TYPES = ['free', 'alternative', 'online'] as const;
type FacilityType = (typeof FACILITY_TYPES)[number];

function isFacilityType(value: unknown): value is FacilityType {
  return typeof value === 'string' && (FACILITY_TYPES as readonly string[]).includes(value);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const { facility_type, facility_no, facility_name, fee, features, submitter_role, submitter_contact, note } = body;

  if (!isFacilityType(facility_type)) {
    return NextResponse.json({ error: 'invalid facility_type' }, { status: 400 });
  }
  const no = Number(facility_no);
  if (!Number.isInteger(no)) {
    return NextResponse.json({ error: 'invalid facility_no' }, { status: 400 });
  }

  const safeFeatures = Array.isArray(features)
    ? features.filter((f): f is string => typeof f === 'string' && isFacilityFeatureTag(f))
    : [];
  const safeFee = typeof fee === 'string' && fee.trim() ? fee.trim().slice(0, 200) : null;
  const safeNote = typeof note === 'string' && note.trim() ? note.trim().slice(0, 1000) : null;
  const safeContact =
    typeof submitter_contact === 'string' && submitter_contact.trim()
      ? submitter_contact.trim().slice(0, 200)
      : null;
  const safeRole = submitter_role === 'staff' ? 'staff' : 'parent';
  const safeName = typeof facility_name === 'string' ? facility_name.trim().slice(0, 200) : '';

  if (!safeFee && safeFeatures.length === 0) {
    return NextResponse.json({ error: '費用または特徴タグのいずれかを入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('facility_info_submissions').insert({
    facility_type,
    facility_no: no,
    facility_name: safeName,
    fee: safeFee,
    features: safeFeatures,
    submitter_role: safeRole,
    submitter_contact: safeContact,
    note: safeNote,
    status: 'pending',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
