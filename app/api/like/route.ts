import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { id, uid, liked } = await req.json();
  if (!id || !uid) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('likes, liked_by')
    .eq('id', id)
    .single();
  if (fetchErr || !row) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const currentLikedBy: string[] = row.liked_by || [];
  const alreadyLiked = currentLikedBy.includes(uid);
  let nextLikedBy = currentLikedBy;
  let nextLikes = row.likes;

  if (liked && !alreadyLiked) {
    nextLikedBy = [...currentLikedBy, uid];
    nextLikes = row.likes + 1;
  } else if (!liked && alreadyLiked) {
    nextLikedBy = currentLikedBy.filter((u) => u !== uid);
    nextLikes = Math.max(0, row.likes - 1);
  }

  const { error: updateErr } = await supabase
    .from('consultations')
    .update({ likes: nextLikes, liked_by: nextLikedBy })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, likes: nextLikes });
}
