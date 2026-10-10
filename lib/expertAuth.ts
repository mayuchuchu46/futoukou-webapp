import { cookies } from 'next/headers';
import { getSupabaseAdmin } from './supabase';

const COOKIE_NAME = 'dsk_expert_id';

export async function getCurrentExpert() {
  const cookieStore = await cookies();
  const expertId = cookieStore.get(COOKIE_NAME)?.value;
  if (!expertId) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('experts')
    .select('id, email, name, credential, bio, photo_url, license_number, verified, created_at')
    .eq('id', expertId)
    .single();
  return data || null;
}

export const EXPERT_COOKIE_NAME = COOKIE_NAME;
