import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';

export async function POST(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  // photo_urlはここでは扱わない（/api/expert/photo でのアップロード時にのみ更新する。
  // ここで一緒に受け取ってしまうと、写真未選択時に空文字で上書き＝消してしまう事故につながるため）。
  const { name, display_name, credential, bio, link_url } = await req.json();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('experts')
    .update({ name, display_name: (display_name || '').trim() || null, credential, bio, link_url: link_url || '' })
    .eq('id', expert.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
