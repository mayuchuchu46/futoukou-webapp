import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 「通報する」機能。/api/likeと同じ構造だが、likeと違ってトグル（取り消し）は無く、
// 一度通報したらそのまま（同じ人が同じ相談を何度押しても1件としてしか数えない）。
// 自動非表示は一切行わない。悪意のある通報連打で荒らされるリスクを避けるため、
// 件数が増えるだけで、運営が管理画面（/admin）で内容を確認して判断する前提
// （2026-10-12、「通報ボタンっていらない？」との指摘を受けて追加）。
export async function POST(req: NextRequest) {
  const { id, uid } = await req.json();
  if (!id || !uid) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('reports, reported_by')
    .eq('id', id)
    .single();
  if (fetchErr || !row) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const currentReportedBy: string[] = row.reported_by || [];
  if (currentReportedBy.includes(uid)) {
    // 既に通報済み。重複して加算しないが、エラーにもしない（ボタン側は成功扱いでよい）。
    return NextResponse.json({ ok: true, reports: row.reports, already: true });
  }

  const nextReportedBy = [...currentReportedBy, uid];
  const nextReports = row.reports + 1;

  const { error: updateErr } = await supabase
    .from('consultations')
    .update({ reports: nextReports, reported_by: nextReportedBy })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reports: nextReports });
}
