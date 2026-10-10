import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { id, hidden } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('consultations').update({ hidden: !!hidden }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
