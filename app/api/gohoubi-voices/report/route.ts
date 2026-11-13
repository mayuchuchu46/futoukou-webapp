import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 「みんなのご褒美」投稿への通報API（2026-11-14追加）。app/api/report/route.ts
// （consultations向け）と同じ考え方をgohoubi_postsに対して行う、専用エンドポイント。
// 自動非表示はせず、件数を記録するのみ（運営がSupabase側で内容を見て判断する）。
export async function POST(req: NextRequest) {
  const { id, uid } = await req.json();
  if (!id || !uid) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: row, error: fetchErr } = await supabase
    .from('gohoubi_posts')
    .select('reports, reported_by')
    .eq('id', id)
    .single();
  if (fetchErr || !row) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const currentReportedBy: string[] = row.reported_by || [];
  if (currentReportedBy.includes(uid)) {
    return NextResponse.json({ ok: true, reports: row.reports, already: true });
  }

  const nextReportedBy = [...currentReportedBy, uid];
  const nextReports = row.reports + 1;

  const { error: updateErr } = await supabase
    .from('gohoubi_posts')
    .update({ reports: nextReports, reported_by: nextReportedBy })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reports: nextReports });
}
