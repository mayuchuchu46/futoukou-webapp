import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

// ホーム画面サイドバーの広告・アフィリエイトバナー枠の編集（管理画面専用）。
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { enabled, image_url, link_url, alt_text } = await req.json();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('sidebar_banners').upsert({
    id: 'default',
    enabled: !!enabled,
    image_url: typeof image_url === 'string' ? image_url.trim() : '',
    link_url: typeof link_url === 'string' ? link_url.trim() : '',
    alt_text: typeof alt_text === 'string' ? alt_text.trim() : '',
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
