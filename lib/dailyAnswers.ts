import { getSupabaseAdmin } from '@/lib/supabase';

// 「みんなのデータ」機能（daily_answers）の集計・コメント関連の共通処理
// （2026-10-17追加）。元は/api/daily-question/route.ts内に直接書いていたが、
// 過去の質問一覧（/api/daily-question/history）側にもコメント機能を追加するに
// あたり、2つのAPIルートから同じロジックを使えるようにこちらへ切り出した。

export const MAX_COMMENT_CHARS = 150;

export async function buildAggregate(questionSlug: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('daily_answers')
    .select('value')
    .eq('question_slug', questionSlug);

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.value] = (counts[row.value] || 0) + 1;
  }
  return { total: data?.length || 0, counts };
}

export type DailyComment = { id: string; value: string; comment: string; label: string; createdAt: string };

// この質問に寄せられた、通報で非表示になっていないコメント一覧を新しい順に返す。
// 表示名は個人を特定できない範囲にとどめる：会員で子どもプロフィール（学年）が
// 紐づいていれば「◯年生の保護者」、紐づいていなければ「保護者」、匿名回答者は「匿名」。
export async function buildComments(questionSlug: string): Promise<DailyComment[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('daily_answers')
    .select('id, value, comment, created_at, member_id, children(grade)')
    .eq('question_slug', questionSlug)
    .eq('comment_hidden', false)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  return (data || [])
    .filter((row) => !!row.comment && row.comment.trim())
    .map((row) => {
      const childGrade = Array.isArray(row.children) ? row.children[0]?.grade : (row.children as { grade?: string } | null)?.grade;
      const label = !row.member_id ? '匿名' : childGrade ? `${childGrade}の保護者` : '保護者';
      return {
        id: row.id,
        value: row.value,
        comment: row.comment as string,
        label,
        createdAt: row.created_at,
      };
    });
}

// 任意コメントの正規化。空文字・未入力ならnull扱い。上限文字数を超える分は
// エラーにせず黙って切り詰める（他の軽量な入力項目と同じ扱い）。
export function normalizeComment(rawComment: unknown): string | null {
  return typeof rawComment === 'string' && rawComment.trim() ? rawComment.trim().slice(0, MAX_COMMENT_CHARS) : null;
}
