import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const { author_id } = await req.json();
  if (!author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('consents').insert({ author_id, client_ip: getClientIp(req) });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
