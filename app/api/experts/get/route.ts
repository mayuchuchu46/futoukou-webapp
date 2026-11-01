import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';

// 専門家一覧の「この専門家に相談する」ボタン、および先輩保護者プロフィール
// ページ（/senpai/[id]）の「この先輩保護者に相談する」ボタンから渡されたIDをもとに、
// 質問フォーム（/ask）側で表示名を出すための公開情報のみ返す（本人確認済みのみ）。
// 本名（name）は本人確認用のため公開APIでは返さず、表示名のみnameとして返す
// （2026-10-13、本名と表示名を分離）。
// 2026-11-01、専門家への質問を恒久的に無料化したのに伴い、先輩保護者をこのAPIの
// 対象外にする理由（価格体系の違い）自体がなくなったため、常に含める。
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ expert: null });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, display_name, credential')
    .eq('id', id)
    .eq('verified', true)
    .single();

  return NextResponse.json({ expert: data ? { id: data.id, name: expertDisplayName(data), credential: data.credential } : null });
}
