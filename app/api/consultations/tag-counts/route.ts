import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SEARCH_TAG_CANDIDATES, matchesThemeText } from '@/lib/searchTags';

// 「探す」ページ用：候補ワード（lib/searchTags.ts）のうち、実際に投稿（question/answer）に
// 含まれているものだけを件数付きで返す。既存の /api/consultations?q= と同じ対象（question, answer）
// に対して判定するので、タグをクリックしたときの検索結果件数と一致する
// （?q=の方もlib/consultations.tsでTHEME_SYNONYMSを使って同じ語を対象にしている）。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('consultations')
    .select('question, answer')
    .eq('hidden', false)
    // AIの回答への返信（ラリー）として作られた続きの相談は、一覧に出さない方針
    // （lib/consultations.ts参照）に合わせ、件数にも含めない（2026-10-16追加）。
    .is('parent_id', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data || [];
  const tags = SEARCH_TAG_CANDIDATES.map((word) => {
    const count = rows.filter(
      (r) => matchesThemeText(r.question, word) || matchesThemeText(r.answer, word)
    ).length;
    return { word, count };
  })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ tags });
}
