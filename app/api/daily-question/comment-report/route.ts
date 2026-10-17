import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 「みんなのデータ」の任意コメント専用の通報ボタン（2026-10-17追加）。
// /api/report（consultations用）と同じ構造・考え方だが、対象がdaily_answersの
// 1行（コメント）である点だけが違う。取り消し不可の一方向、自動非表示なし、
// 件数が増えるだけで運営が管理画面で内容を見て非表示にするかを判断する。
export async function POST(req: NextRequest) {
  const { id, uid } = await req.json();
  if (!id || !uid) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: row, error: fetchErr } = await supabase
    .from('daily_answers')
    .select('comment_reports, comment_reported_by')
    .eq('id', id)
    .single();
  if (fetchErr || !row) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const currentReportedBy: string[] = row.comment_reported_by || [];
  if (currentReportedBy.includes(uid)) {
    return NextResponse.json({ ok: true, reports: row.comment_reports, already: true });
  }

  const nextReportedBy = [...currentReportedBy, uid];
  const nextReports = row.comment_reports + 1;

  const { error: updateErr } = await supabase
    .from('daily_answers')
    .update({ comment_reports: nextReports, comment_reported_by: nextReportedBy })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reports: nextReports });
}
