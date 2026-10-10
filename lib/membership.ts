import { SupabaseClient } from '@supabase/supabase-js';

// 専門家への有料相談（¥500）を一度行うと、その日から30日間、他の人の専門家回答も
// 読み放題になる特典。同じ author_id（匿名ブラウザID）で再度支払うと、既存の有効期限
// から30日延長される（有効期限が切れていれば、支払い時点から30日）。
export const MEMBERSHIP_DAYS = 30;

export async function grantMembership(supabase: SupabaseClient, authorId: string) {
  const now = new Date();
  const { data: existing } = await supabase
    .from('expert_memberships')
    .select('expires_at')
    .eq('author_id', authorId)
    .single();

  const base = existing && new Date(existing.expires_at) > now ? new Date(existing.expires_at) : now;
  const newExpiry = new Date(base.getTime() + MEMBERSHIP_DAYS * 24 * 60 * 60 * 1000);

  await supabase
    .from('expert_memberships')
    .upsert({ author_id: authorId, expires_at: newExpiry.toISOString(), updated_at: now.toISOString() });

  return newExpiry;
}

export async function isMembershipActive(supabase: SupabaseClient, authorId: string | null): Promise<boolean> {
  if (!authorId) return false;
  const { data } = await supabase
    .from('expert_memberships')
    .select('expires_at')
    .eq('author_id', authorId)
    .single();
  if (!data) return false;
  return new Date(data.expires_at) > new Date();
}

export async function getMembershipExpiry(supabase: SupabaseClient, authorId: string | null): Promise<string | null> {
  if (!authorId) return null;
  const { data } = await supabase
    .from('expert_memberships')
    .select('expires_at')
    .eq('author_id', authorId)
    .single();
  if (!data) return null;
  return new Date(data.expires_at) > new Date() ? data.expires_at : null;
}
