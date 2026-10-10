import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';

export async function POST(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });

  const { name, credential, bio, photo_url } = await req.json();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('experts')
    .update({ name, credential, bio, photo_url: photo_url || null })
    .eq('id', expert.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
