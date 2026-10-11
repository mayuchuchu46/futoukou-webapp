import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';

// 専門家の回答を読んだ利用者（投稿者本人）が「参考になったか」を記録する。
// 運営が専門家の回答の質を事後的に把握するための、ごく簡単なフィードバック。
export async function POST(req: NextRequest) {
  const { id, author_id, helpful } = await req.json();
  if (!id || typeof helpful !== 'boolean') {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('id, author_id, member_id, request_type, expert_status, paid, refunded')
    .eq('id', id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: '見つかりませんでした' }, { status: 404 });
  }

  const member = await getCurrentMember();
  const isOwnerByAuthor = !!author_id && row.author_id === author_id;
  const isOwnerByMember = !!member && row.member_id === member.id;
  if (!isOwnerByAuthor && !isOwnerByMember) {
    return NextResponse.json({ error: 'この相談にフィードバックする権限がありません' }, { status: 403 });
  }

  if (row.request_type !== 'expert' || row.expert_status !== 'answered' || !row.paid || row.refunded) {
    return NextResponse.json({ error: 'この相談にはフィードバックできません' }, { status: 400 });
  }

  const { error } = await supabase
    .from('consultations')
    .update({ expert_answer_helpful: helpful })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
