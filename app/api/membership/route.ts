import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getMembershipExpiry } from '@/lib/membership';

export async function GET(req: NextRequest) {
  const authorId = req.nextUrl.searchParams.get('author_id');
  const supabase = getSupabaseAdmin();
  const expiresAt = await getMembershipExpiry(supabase, authorId);
  return NextResponse.json({ active: !!expiresAt, expiresAt });
}
