import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 専門家一覧の「この専門家に相談する」ボタンから渡された専門家IDをもとに、
// 質問フォーム（/ask）側で表示名を出すための公開情報のみ返す（本人確認済みのみ）。
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ expert: null });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, credential')
    .eq('id', id)
    .eq('verified', true)
    .single();

  return NextResponse.json({ expert: data || null });
}
