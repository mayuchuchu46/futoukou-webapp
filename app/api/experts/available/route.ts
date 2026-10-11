import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 専門家への有料相談を今すぐ受け付けてよいかどうか。
// 本人確認済み（verified）の専門家が1人もいない間は、支払っても誰も回答できないため、
// この相談メニュー自体を「準備中」として隠す。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from('experts')
    .select('id', { count: 'exact', head: true })
    .eq('verified', true);

  if (error) return NextResponse.json({ available: false, count: 0 });
  return NextResponse.json({ available: (count || 0) > 0, count: count || 0 });
}
