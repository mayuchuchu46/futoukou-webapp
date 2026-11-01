import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 専門家への相談を今すぐ受け付けてよいかどうか。
// 本人確認済み（verified）の専門家が1人もいない間は、質問しても誰も回答できないため、
// この相談メニュー自体を「準備中」として隠す。
// 2026-11-01、専門家への質問を恒久的に無料化したのに伴い、先輩保護者をこのカウントから
// 除外する理由（価格体系・報酬の違い）自体がなくなったため、常に含める。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from('experts')
    .select('id', { count: 'exact', head: true })
    .eq('verified', true);

  if (error) return NextResponse.json({ available: false, count: 0 });
  return NextResponse.json({ available: (count || 0) > 0, count: count || 0 });
}
