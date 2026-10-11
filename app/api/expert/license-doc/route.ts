import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { EXPERT_LICENSE_DOC_BUCKET, MAX_LICENSE_DOC_BYTES, isAllowedLicenseDocType } from '@/lib/expertLicenseDoc';

// ログイン中の専門家が、登録証（画像/PDF）を再提出・差し替えするためのエンドポイント。
// 登録時のアップロードに失敗した場合のリカバリ、および内容更新の両方に使う。
// 差し替えた場合は、改めて運営の本人確認待ち（verified: false）に戻す。
export async function POST(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const form = await req.formData();
  const licenseDoc = form.get('license_doc');

  if (!(licenseDoc instanceof File) || licenseDoc.size === 0) {
    return NextResponse.json({ error: '登録証（画像またはPDF）を選択してください' }, { status: 400 });
  }
  if (!isAllowedLicenseDocType(licenseDoc.type)) {
    return NextResponse.json({ error: '登録証は画像（jpg/png）またはPDFで添付してください' }, { status: 400 });
  }
  if (licenseDoc.size > MAX_LICENSE_DOC_BYTES) {
    return NextResponse.json({ error: `登録証のファイルサイズは${MAX_LICENSE_DOC_BYTES / 1024 / 1024}MB以内にしてください` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const ext = licenseDoc.name.includes('.') ? licenseDoc.name.split('.').pop() : 'bin';
  const path = `${expert.id}/license.${ext}`;
  const buffer = Buffer.from(await licenseDoc.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(EXPERT_LICENSE_DOC_BUCKET)
    .upload(path, buffer, { contentType: licenseDoc.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: 'アップロードに失敗しました: ' + uploadError.message }, { status: 500 });
  }

  // 差し替え後の新しい登録証なので、保管期限の起点（verified_at）もリセットする。
  await supabase
    .from('experts')
    .update({ license_doc_path: path, verified: false, verified_at: null })
    .eq('id', expert.id);

  return NextResponse.json({ ok: true });
}
