import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SENPAI_CREDENTIAL } from '@/lib/config';

// 専門家への有料相談を今すぐ受け付けてよいかどうか。
// 本人確認済み（verified）の専門家が1人もいない間は、支払っても誰も回答できないため、
// この相談メニュー自体を「準備中」として隠す。
// 先輩保護者（経験者）は資格を前提としないこの専門家向け有料相談（¥600・専門家報酬¥400という
// 価格体系）の対象ではないため、カウントから除外する（2026-10-31、先輩保護者の本人確認が
// 完了しただけで専門家向け有料相談が誤って有効化されてしまう不具合を防ぐため）。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from('experts')
    .select('id', { count: 'exact', head: true })
    .eq('verified', true)
    .neq('credential', SENPAI_CREDENTIAL);

  if (error) return NextResponse.json({ available: false, count: 0 });
  return NextResponse.json({ available: (count || 0) > 0, count: count || 0 });
}
