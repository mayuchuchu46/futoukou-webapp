import { getSupabaseAdmin } from '@/lib/supabase';
import { isMembershipActive } from '@/lib/membership';
import { Consultation } from '@/lib/types';

// 相談一覧の取得＋ロック判定（API route とホーム画面のSSRで共通利用）。
// 専門家の回答は、本人（投稿者）か、読み放題特典が有効な人にだけ見せる。
// それ以外には回答本文を伏せ、locked フラグだけ立てて返す（一覧でのぼかし表示用）。
export async function getConsultationsList({
  category,
  q,
  viewerId,
  authorId,
  expertAnswered,
  limit = 50,
}: {
  category?: string | null;
  q?: string | null;
  viewerId?: string | null;
  authorId?: string | null;
  expertAnswered?: boolean;
  limit?: number;
}): Promise<Consultation[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('consultations')
    .select('*, experts(name, credential)')
    .eq('hidden', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (q && q.trim()) {
    query = query.or(`question.ilike.%${q.trim()}%,answer.ilike.%${q.trim()}%`);
  }
  if (authorId) {
    query = query.eq('author_id', authorId);
  }
  if (expertAnswered) {
    query = query.eq('request_type', 'expert').eq('expert_status', 'answered');
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const member = await isMembershipActive(supabase, viewerId || null);
  return data.map((item) => {
    const isExpertAnswered = item.request_type === 'expert' && item.expert_status === 'answered';
    const isOwner = viewerId && item.author_id === viewerId;
    if (isExpertAnswered && !isOwner && !member) {
      return { ...item, answer: '', expert_answer: null, locked: true };
    }
    return { ...item, locked: false };
  }) as Consultation[];
}
