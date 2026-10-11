import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// PCサイドバーなど、トップ以外のページからも「専門家一覧」導線を出すための
// 公開読み取り専用エンドポイント。本人確認済みの専門家を3件まで返す
// （app/page.tsxのgetVerifiedExperts()と同じ条件）。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, name, credential, bio, photo_url')
    .eq('verified', true)
    .order('created_at', { ascending: true })
    .limit(3);

  return NextResponse.json({ experts: data || [] });
}
