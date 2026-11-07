import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

// 施設・学校の費用・特徴タグ提案（facility_info_submissions）の承認・却下。
// app/api/admin/experts/verify/route.tsと同じ考え方（2026-11-07追加）。
type Action = 'approve' | 'reject';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const body = await req.json();
  const { id, action } = body as { id?: string; action?: Action };
  if (!id || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('facility_info_submissions')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
