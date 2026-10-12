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
    .select('id, email, name, display_name, credential, bio, photo_url, link_url, license_number, license_doc_path, verified, review_status, review_note, created_at, stripe_account_id, stripe_payouts_enabled')
    .eq('id', expertId)
    .single();
  return data || null;
}

export const EXPERT_COOKIE_NAME = COOKIE_NAME;
