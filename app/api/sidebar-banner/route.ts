import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// ホーム画面サイドバーの広告・アフィリエイトバナー枠（公開用の読み取りのみ）。
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('sidebar_banners')
    .select('enabled, image_url, link_url, alt_text')
    .eq('id', 'default')
    .single();
  return NextResponse.json({ banner: data || null });
}
