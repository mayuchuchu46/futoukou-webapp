import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { expertDisplayName } from '@/lib/expertDisplay';
import { SENPAI_CREDENTIAL, EXPERT_VOLUNTEER_MODE } from '@/lib/config';

// 専門家一覧の「この専門家に相談する」ボタン、および先輩保護者プロフィール
// ページ（/senpai/[id]）の「この先輩保護者に相談する」ボタン（volunteer期間中
// のみ機能する）から渡されたIDをもとに、質問フォーム（/ask）側で表示名を出す
// ための公開情報のみ返す（本人確認済みのみ）。本名（name）は本人確認用のため
// 公開APIでは返さず、表示名のみnameとして返す（2026-10-13、本名と表示名を分離）。
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ expert: null });

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('experts')
    .select('id, name, display_name, credential')
    .eq('id', id)
    .eq('verified', true);
  // 先輩保護者（経験者）は通常運用中はこの専門家向けAPIの対象外（2026-10-31追加）。
  // EXPERT_VOLUNTEER_MODE中は金銭のやり取りが発生しないため含める。
  if (!EXPERT_VOLUNTEER_MODE) {
    query = query.neq('credential', SENPAI_CREDENTIAL);
  }
  const { data } = await query.single();

  return NextResponse.json({ expert: data ? { id: data.id, name: expertDisplayName(data), credential: data.credential } : null });
}
