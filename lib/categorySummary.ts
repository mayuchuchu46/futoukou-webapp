import { cache } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildCategoryDictionaryPrompt, PastConsultation } from '@/lib/prompt';
import { CATS, Category } from '@/lib/categories';

// カテゴリ別「お悩み辞典」ページ（/dictionary/[category]）用のデータ取得・AI解説文キャッシュ。
// lib/memberSummary.ts（会員の相談履歴からマイページのサマリーを作る仕組み）と同じ考え方：
// そのカテゴリの投稿件数が、キャッシュ生成時点から増えていなければキャッシュをそのまま返し、
// 増えていればAIを呼び直して再生成する。
//
// 投稿が少ないカテゴリのページを検索エンジンにそのまま見せると「内容が薄いページ」として
// 評価を落とすリスクがあるため、呼び出し側（app/dictionary/[category]/page.tsx）はこの
// DICTIONARY_INDEX_THRESHOLD件を超えるまでnoindexにする（2026-10-15、「SEO的にいい？」
// 「公開と同時にやりたい」との相談を受けて、作る・公開するを分離せず、件数に応じて
// 自動でindex/noindexが切り替わる形にした）。
export const DICTIONARY_INDEX_THRESHOLD = 20;

export type DictionaryConsultation = PastConsultation & { id: string };

export type CategoryDictionaryData = {
  overview: string | null;
  count: number;
  consultations: DictionaryConsultation[];
};

type CachedRow = {
  overview: string;
  consultation_count: number;
};

// ページ本体に出す「実際の相談」一覧（抜粋）の最大件数。
const SAMPLE_LIMIT = 20;

// generateMetadata と ページ本体の両方から呼ぶため、React cache() でリクエスト単位に
// メモ化する（メモ化しないと、同じカテゴリのデータ取得・AI要約の再生成呼び出しが
// 1回のアクセスで2回走ってしまう。member_summaries等のキャッシュと別に、ここでも
// 二重の重い処理を防ぐ必要があるため明示的に対応した。2026-10-15）。
export const getCategoryDictionaryData = cache(async function getCategoryDictionaryDataImpl(
  category: Category
): Promise<CategoryDictionaryData> {
  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('hidden', false)
    .eq('category', category);

  const consultationCount = count || 0;

  const { data: rows } = await supabase
    .from('consultations')
    .select('id, category, question, created_at')
    .eq('hidden', false)
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(SAMPLE_LIMIT);

  const consultations = (rows || []) as unknown as DictionaryConsultation[];

  if (consultationCount === 0) {
    return { overview: null, count: 0, consultations: [] };
  }

  const overview = await getOrGenerateOverview(category, consultationCount, consultations);
  return { overview, count: consultationCount, consultations };
});

async function getOrGenerateOverview(
  category: Category,
  consultationCount: number,
  consultations: PastConsultation[]
): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  const { data: cached } = await supabase
    .from('category_summaries')
    .select('overview, consultation_count')
    .eq('category', category)
    .single();

  if (cached && (cached as CachedRow).consultation_count === consultationCount && (cached as CachedRow).overview) {
    return (cached as CachedRow).overview;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // APIキーが無い環境（ローカルビルド確認等）では、古いキャッシュがあればそれを返す。
    if (cached) return (cached as CachedRow).overview || null;
    return null;
  }

  const categoryLabel = CATS[category]?.label || category;
  const prompt = buildCategoryDictionaryPrompt(categoryLabel, consultations);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let overview = '';
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = msg.content.find(
      (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
    );
    const raw = textBlock ? textBlock.text.trim() : '';
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('JSON形式の応答が得られませんでした');
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    overview = typeof parsed.overview === 'string' ? parsed.overview.trim() : '';
    if (!overview) throw new Error('overviewが空でした');
  } catch {
    // 生成に失敗した場合、古いキャッシュがあればそれを返し、無ければ諦める
    // （ページ自体は実際の相談一覧だけでも成立するため、解説文なしでも表示する）。
    if (cached) return (cached as CachedRow).overview || null;
    return null;
  }

  await supabase.from('category_summaries').upsert({
    category,
    overview,
    consultation_count: consultationCount,
    generated_at: new Date().toISOString(),
  });

  return overview;
}
