import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { REACTION_TYPES, ReactionType } from '@/lib/reactions';

// 定型リアクション（lib/reactions.ts）のトグルAPI。/api/likeと同じ
// 「現在値を読んで差分を計算し、更新する」方式だが、タイプが複数あるため
// reactions/reacted_byはjsonbの1列にまとめて持つ（2026-10-16追加）。
export async function POST(req: NextRequest) {
  const { id, uid, type, reacted } = await req.json();
  if (!id || !uid || !type) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!REACTION_TYPES.some((t) => t.key === type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }
  const reactionType = type as ReactionType;

  const supabase = getSupabaseAdmin();

  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('reactions, reacted_by')
    .eq('id', id)
    .single();
  if (fetchErr || !row) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const reactions: Record<string, number> = { ...(row.reactions || {}) };
  const reactedBy: Record<string, string[]> = { ...(row.reacted_by || {}) };
  const currentList: string[] = reactedBy[reactionType] || [];
  const alreadyReacted = currentList.includes(uid);

  if (reacted && !alreadyReacted) {
    reactedBy[reactionType] = [...currentList, uid];
    reactions[reactionType] = (reactions[reactionType] || 0) + 1;
  } else if (!reacted && alreadyReacted) {
    reactedBy[reactionType] = currentList.filter((u) => u !== uid);
    reactions[reactionType] = Math.max(0, (reactions[reactionType] || 0) - 1);
  }

  const { error: updateErr } = await supabase
    .from('consultations')
    .update({ reactions, reacted_by: reactedBy })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reactions });
}
