import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SENPAI_CREDENTIAL, EXPERT_VOLUNTEER_MODE } from '@/lib/config';

// 専門家への有料相談を今すぐ受け付けてよいかどうか。
// 本人確認済み（verified）の専門家が1人もいない間は、支払っても誰も回答できないため、
// この相談メニュー自体を「準備中」として隠す。
// 先輩保護者（経験者）は資格を前提としないこの専門家向け有料相談（¥600・専門家報酬¥400という
// 価格体系）の対象ではないため、通常運用中はカウントから除外する（2026-10-31、先輩保護者の
// 本人確認が完了しただけで専門家向け有料相談が誤って有効化されてしまう不具合を防ぐため）。
// ただし、EXPERT_VOLUNTEER_MODE（無償ボランティア期間）中は金銭のやり取りが発生しないため、
// 先輩保護者もこのカウントに含める（2026-10-31、「ボランティア期間として無償で回答はできる
// ようにする」との方針確認を受けて変更。通常運用再開時は自動的に元の除外に戻る）。
export async function GET() {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('experts')
    .select('id', { count: 'exact', head: true })
    .eq('verified', true);
  if (!EXPERT_VOLUNTEER_MODE) {
    query = query.neq('credential', SENPAI_CREDENTIAL);
  }
  const { count, error } = await query;

  if (error) return NextResponse.json({ available: false, count: 0 });
  return NextResponse.json({ available: (count || 0) > 0, count: count || 0 });
}
