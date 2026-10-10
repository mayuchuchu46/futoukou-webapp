import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('views')
    .eq('id', id)
    .single();
  if (fetchErr || !row) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const nextViews = (row.views || 0) + 1;

  const { error: updateErr } = await supabase
    .from('consultations')
    .update({ views: nextViews })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, views: nextViews });
}
