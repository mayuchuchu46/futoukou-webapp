import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { MAX_PHOTO_BYTES, isAllowedPhotoType, uploadExpertPhoto } from '@/lib/expertPhoto';

// ログイン中の専門家が、プロフィール写真（アイコン用）をアップロード・差し替えするためのエンドポイント。
export async function POST(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const form = await req.formData();
  const photo = form.get('photo');

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: '写真を選択してください' }, { status: 400 });
  }
  if (!isAllowedPhotoType(photo.type)) {
    return NextResponse.json({ error: '写真はjpg・png・webpのいずれかで添付してください' }, { status: 400 });
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: `写真のファイルサイズは${MAX_PHOTO_BYTES / 1024 / 1024}MB以内にしてください` }, { status: 400 });
  }

  try {
    const photoUrl = await uploadExpertPhoto(expert.id, photo);
    const supabase = getSupabaseAdmin();
    await supabase.from('experts').update({ photo_url: photoUrl }).eq('id', expert.id);
    return NextResponse.json({ ok: true, photo_url: photoUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'アップロードに失敗しました';
    return NextResponse.json({ error: 'アップロードに失敗しました: ' + message }, { status: 500 });
  }
}
