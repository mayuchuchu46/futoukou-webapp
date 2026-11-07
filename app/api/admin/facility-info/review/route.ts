import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

// 施設・学校の費用・特徴タグ提案（facility_info_submissions）の承認・却下・
// 優先掲載（featured）のON/OFF。app/api/admin/experts/verify/route.tsと
// 同じ考え方（2026-11-07追加。2026-11-07、学校側課金プランの土台として
// set_featured/unset_featuredを追加）。
type Action = 'approve' | 'reject' | 'set_featured' | 'unset_featured';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const body = await req.json();
  const { id, action } = body as { id?: string; action?: Action };
  const validActions: Action[] = ['approve', 'reject', 'set_featured', 'unset_featured'];
  if (!id || !action || !validActions.includes(action)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (action === 'approve' || action === 'reject') {
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

  // set_featured / unset_featured：承認済み（approved）の行にのみ適用する
  // （未承認のpending行に先にfeaturedを立てても表示側では使われないため、
  // 承認済みに限定して混乱を避ける）。
  const { error } = await supabase
    .from('facility_info_submissions')
    .update({ featured: action === 'set_featured' })
    .eq('id', id)
    .eq('status', 'approved');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
