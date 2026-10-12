import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { EXPERT_COOKIE_NAME } from '@/lib/expertAuth';
import { EXPERT_LICENSE_DOC_BUCKET, MAX_LICENSE_DOC_BYTES, isAllowedLicenseDocType } from '@/lib/expertLicenseDoc';
import { MAX_PHOTO_BYTES, isAllowedPhotoType, uploadExpertPhoto } from '@/lib/expertPhoto';

// 専門家登録。資格の登録番号は自己申告の文字列だけでは真偽の確認ができないため
// （公的な番号照会システムが見当たらないことを確認済み）、登録証（画像/PDF）の
// 提出を必須にし、運営が目視で本人確認する。ファイルを含むため multipart/form-data。
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');
  const name = String(form.get('name') || '');
  const display_name = String(form.get('display_name') || '');
  const credential = String(form.get('credential') || '');
  const bio = String(form.get('bio') || '');
  const license_number = String(form.get('license_number') || '');
  const link_url = String(form.get('link_url') || '');
  const licenseDoc = form.get('license_doc');
  const photo = form.get('photo');

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'メールアドレス・パスワード・名前は必須です' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 });
  }
  // 資格によっては登録番号制度自体が無いものもあるため、登録番号は任意項目にしている
  // （本人確認は登録証の提出・運営による目視確認で行う。2026-10-13、必須から変更）。
  if (!(licenseDoc instanceof File) || licenseDoc.size === 0) {
    return NextResponse.json({ error: '登録証（画像またはPDF）を添付してください' }, { status: 400 });
  }
  if (!isAllowedLicenseDocType(licenseDoc.type)) {
    return NextResponse.json({ error: '登録証は画像（jpg/png）またはPDFで添付してください' }, { status: 400 });
  }
  if (licenseDoc.size > MAX_LICENSE_DOC_BYTES) {
    return NextResponse.json({ error: `登録証のファイルサイズは${MAX_LICENSE_DOC_BYTES / 1024 / 1024}MB以内にしてください` }, { status: 400 });
  }
  // プロフィール写真は任意項目（登録後にプロフィール編集からでも追加・変更できる）。
  if (photo instanceof File && photo.size > 0) {
    if (!isAllowedPhotoType(photo.type)) {
      return NextResponse.json({ error: '写真はjpg・png・webpのいずれかで添付してください' }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: `写真のファイルサイズは${MAX_PHOTO_BYTES / 1024 / 1024}MB以内にしてください` }, { status: 400 });
    }
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('experts').select('id').eq('email', email).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data: expert, error } = await supabase
    .from('experts')
    .insert({
      email,
      password_hash,
      name,
      display_name: display_name.trim() || null,
      credential: credential || '公認心理師',
      bio: bio || '',
      license_number: license_number.trim(),
      link_url: link_url.trim(),
      verified: false,
    })
    .select('id')
    .single();

  if (error || !expert) {
    return NextResponse.json({ error: error?.message || '登録に失敗しました' }, { status: 500 });
  }

  // プロフィール写真（任意）：失敗しても登録自体は継続する（あとからプロフィール編集で再アップロードできる）。
  if (photo instanceof File && photo.size > 0) {
    try {
      const photoUrl = await uploadExpertPhoto(expert.id, photo);
      await supabase.from('experts').update({ photo_url: photoUrl }).eq('id', expert.id);
    } catch {
      // ここでは無視し、登録証アップロードの処理に進む（登録自体は完了させる）。
    }
  }

  const ext = licenseDoc.name.includes('.') ? licenseDoc.name.split('.').pop() : 'bin';
  const path = `${expert.id}/license.${ext}`;
  const buffer = Buffer.from(await licenseDoc.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(EXPERT_LICENSE_DOC_BUCKET)
    .upload(path, buffer, { contentType: licenseDoc.type, upsert: true });

  if (uploadError) {
    // アカウント自体は作成済みなので、ここで失敗してもログインして
    // ダッシュボードから登録証を再アップロードできる（/api/expert/license-doc）。
    const res = NextResponse.json({
      ok: true,
      warning: '登録は完了しましたが、登録証のアップロードに失敗しました。ダッシュボードから再度お試しください：' + uploadError.message,
    });
    res.cookies.set(EXPERT_COOKIE_NAME, expert.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 90,
    });
    return res;
  }

  await supabase.from('experts').update({ license_doc_path: path }).eq('id', expert.id);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(EXPERT_COOKIE_NAME, expert.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
