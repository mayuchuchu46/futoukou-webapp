import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('consultation_id');
  if (!id) return NextResponse.json({ error: 'consultation_id required' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('consultation_id', id)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

export async function POST(req: NextRequest) {
  const { consultation_id, author_id, body } = await req.json();
  if (!consultation_id || !author_id || !body || !body.trim()) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: comment, error: insertErr } = await supabase
    .from('comments')
    .insert({ consultation_id, author_id, body: body.trim() })
    .select()
    .single();
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  const { data: row } = await supabase
    .from('consultations')
    .select('comment_count')
    .eq('id', consultation_id)
    .single();
  if (row) {
    await supabase
      .from('consultations')
      .update({ comment_count: (row.comment_count || 0) + 1 })
      .eq('id', consultation_id);
  }

  return NextResponse.json({ ok: true, comment });
}
