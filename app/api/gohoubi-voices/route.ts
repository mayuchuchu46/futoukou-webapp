import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 「みんなのご褒美」一覧取得API（2026-11-14追加）。gohoubi_postsから、運営が
// 非表示にしていない（hidden=false）投稿を新しい順に返す。件数は多すぎると
// 重くなる・流し読みされにくくなるため、直近30件に絞る。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('gohoubi_posts')
    .select('id, text, encouragement, suggestions, reactions, reacted_by, created_at')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data || [] });
}
