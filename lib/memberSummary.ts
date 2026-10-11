import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildSummaryPrompt, SummaryConsultation } from '@/lib/prompt';

export type MemberSummary = {
  statusSummary: string;
  advice: string;
  consultationCount: number;
  generatedAt: string;
};

// マイページの「今のお子さんの状況」サマリーを取得する。
// 会員の相談件数が、キャッシュ生成時から増えていなければキャッシュをそのまま返し、
// 増えていれば（＝新しい相談が追加されていれば）そのときだけAIを呼び直して再生成する。
// 相談が1件もない会員には null を返す（呼び出し側で「まだ相談がありません」表示に使う）。
export async function getOrGenerateMemberSummary(memberId: string): Promise<MemberSummary | null> {
  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId);

  const consultationCount = count || 0;
  if (consultationCount === 0) return null;

  const { data: cached } = await supabase
    .from('member_summaries')
    .select('status_summary, advice, consultation_count, generated_at')
    .eq('member_id', memberId)
    .single();

  if (cached && cached.consultation_count === consultationCount) {
    return {
      statusSummary: cached.status_summary,
      advice: cached.advice,
      consultationCount,
      generatedAt: cached.generated_at,
    };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // APIキーが無い環境（ローカルビルド確認等）では、キャッシュが古くても
    // 古い内容のまま返す。キャッシュも無ければ生成を諦めて null を返す。
    if (cached) {
      return {
        statusSummary: cached.status_summary,
        advice: cached.advice,
        consultationCount: cached.consultation_count,
        generatedAt: cached.generated_at,
      };
    }
    return null;
  }

  const { data: rows } = await supabase
    .from('consultations')
    .select('category, question, answer, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!rows || rows.length === 0) return null;

  const history = rows as SummaryConsultation[];
  const prompt = buildSummaryPrompt(history);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let statusSummary = '';
  let advice = '';
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = msg.content.find(
      (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
    );
    const raw = textBlock ? textBlock.text.trim() : '';
    // AIがコードブロックで囲んで返す場合があるため、最初の { から最後の } までを抜き出す。
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('JSON形式の応答が得られませんでした');
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    statusSummary = typeof parsed.status_summary === 'string' ? parsed.status_summary.trim() : '';
    advice = typeof parsed.advice === 'string' ? parsed.advice.trim() : '';
    if (!statusSummary || !advice) throw new Error('サマリーが空でした');
  } catch {
    // 生成に失敗した場合、古いキャッシュがあればそれを返し、無ければ諦める
    // （マイページ全体を落とすほどの機能ではないため）。
    if (cached) {
      return {
        statusSummary: cached.status_summary,
        advice: cached.advice,
        consultationCount: cached.consultation_count,
        generatedAt: cached.generated_at,
      };
    }
    return null;
  }

  const generatedAt = new Date().toISOString();
  await supabase.from('member_summaries').upsert({
    member_id: memberId,
    status_summary: statusSummary,
    advice,
    consultation_count: consultationCount,
    generated_at: generatedAt,
  });

  return { statusSummary, advice, consultationCount, generatedAt };
}
