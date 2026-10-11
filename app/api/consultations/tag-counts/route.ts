import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SEARCH_TAG_CANDIDATES } from '@/lib/searchTags';

// 「探す」ページ用：候補ワード（lib/searchTags.ts）のうち、実際に投稿（question/answer）に
// 含まれているものだけを件数付きで返す。既存の /api/consultations?q= と同じ対象（question, answer）
// に対して判定するので、タグをクリックしたときの検索結果件数と一致する。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('consultations')
    .select('question, answer')
    .eq('hidden', false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];
  const tags = SEARCH_TAG_CANDIDATES.map((word) => {
    const count = rows.filter(
      (r) => (r.question && r.question.includes(word)) || (r.answer && r.answer.includes(word))
    ).length;
    return { word, count };
  })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ tags });
}
