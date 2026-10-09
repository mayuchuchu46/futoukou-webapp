import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  const q = req.nextUrl.searchParams.get('q');
  const supabase = getSupabaseAdmin();

  let query = supabase.from('consultations').select('*').order('created_at', { ascending: false }).limit(50);
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (q && q.trim()) {
    query = query.or(`question.ilike.%${q.trim()}%,answer.ilike.%${q.trim()}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ consultations: data });
}
