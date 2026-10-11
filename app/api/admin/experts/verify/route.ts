import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { expert_id, verified } = await req.json();
  if (!expert_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  // verified_atは登録証（本人確認書類）の保管期限の起点（lib/expertLicenseDoc.ts）。
  // trueにした時刻を記録し、falseに戻す（再確認待ちに戻す）場合は一旦クリアする。
  const { error } = await supabase
    .from('experts')
    .update({ verified: !!verified, verified_at: verified ? new Date().toISOString() : null })
    .eq('id', expert_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
