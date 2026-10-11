import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { EXPERT_LICENSE_DOC_BUCKET } from '@/lib/expertLicenseDoc';

// 専門家が提出した登録証（非公開バケット）を、管理画面から確認するための
// 短時間だけ有効な署名付きURLを発行する。管理者ログインが必須。
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { expert_id } = await req.json();
  if (!expert_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: expert } = await supabase
    .from('experts')
    .select('license_doc_path')
    .eq('id', expert_id)
    .single();

  if (!expert?.license_doc_path) {
    return NextResponse.json({ error: '登録証が提出されていません' }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(EXPERT_LICENSE_DOC_BUCKET)
    .createSignedUrl(expert.license_doc_path, 60 * 5); // 5分間だけ有効

  if (error || !data) {
    return NextResponse.json({ error: error?.message || '発行に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: data.signedUrl });
}
