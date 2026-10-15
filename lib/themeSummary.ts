import { cache } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildCategoryDictionaryPrompt, PastConsultation } from '@/lib/prompt';
import { SEARCH_TAG_CANDIDATES, buildThemeOrFilter } from '@/lib/searchTags';
import { DICTIONARY_INDEX_THRESHOLD } from '@/lib/categorySummary';

// カテゴリ別の「お悩み辞典」（lib/categorySummary.ts）に続き、「カテゴリだけじゃなく、
// テーマも対象にして」との指摘を受けて追加（2026-10-15）。ここでの「テーマ」は、
// ホーム画面の「気になるテーマから探す」チップ・/api/consultations/tag-counts と
// 同じ、lib/searchTags.ts の候補ワード（ADHD・起立性調節障害・いじめ…等）単位。
// カテゴリ（body/social/…の9分類）より一段具体的な語で、投稿本文（question/answer）に
// その語を含むかどうかで判定する。
//
// 仕組みはlib/categorySummary.tsと同じ：投稿件数が変わらなければAI解説文のキャッシュを
// そのまま返し、増えていれば再生成する。「薄いページ」判定を避けるnoindex閾値も
// カテゴリ辞典と同じDICTIONARY_INDEX_THRESHOLDを共有する。

export function isDictionaryTheme(word: string): boolean {
  return SEARCH_TAG_CANDIDATES.includes(word);
}

export type ThemeDictionaryConsultation = PastConsultation & { id: string };

export type ThemeDictionaryData = {
  overview: string | null;
  count: number;
  consultations: ThemeDictionaryConsultation[];
};

type CachedRow = {
  overview: string;
  consultation_count: number;
};

const SAMPLE_LIMIT = 20;

// generateMetadataとページ本体の両方から呼ぶため、カテゴリ辞典と同様にReact cache()で
// リクエスト単位にメモ化する（AI呼び出しの二重発生を防ぐため）。
export const getThemeDictionaryData = cache(async function getThemeDictionaryDataImpl(
  word: string
): Promise<ThemeDictionaryData> {
  const supabase = getSupabaseAdmin();

  // tag-counts APIは全件をJS側でfilter(.includes())しているが、辞典ページでは
  // 件数チェックとサンプル取得の両方をDB側のilikeで行い、全行をメモリに載せずに済むように
  // している（ホーム検索の.or(question.ilike...,answer.ilike...)と同じパターン）。
  // 同義語（lib/searchTags.ts THEME_SYNONYMS）も対象に含める（2026-10-16追加、
  // 「テーマの該当数を増やしたい」との要望を受けて）。
  const orFilter = buildThemeOrFilter(word);

  const { count } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('hidden', false)
    .or(orFilter);

  const consultationCount = count || 0;

  const { data: rows } = await supabase
    .from('consultations')
    .select('id, category, question, created_at')
    .eq('hidden', false)
    .or(orFilter)
    .order('created_at', { ascending: false })
    .limit(SAMPLE_LIMIT);

  const consultations = (rows || []) as unknown as ThemeDictionaryConsultation[];

  if (consultationCount === 0) {
    return { overview: null, count: 0, consultations: [] };
  }

  const overview = await getOrGenerateOverview(word, consultationCount, consultations);
  return { overview, count: consultationCount, consultations };
});

async function getOrGenerateOverview(
  word: string,
  consultationCount: number,
  consultations: PastConsultation[]
): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  const { data: cached } = await supabase
    .from('theme_summaries')
    .select('overview, consultation_count')
    .eq('word', word)
    .single();

  if (cached && (cached as CachedRow).consultation_count === consultationCount && (cached as CachedRow).overview) {
    return (cached as CachedRow).overview;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    if (cached) return (cached as CachedRow).overview || null;
    return null;
  }

  // buildCategoryDictionaryPromptはカテゴリ名に限らず「○○というテーマの相談」という
  // 汎用的な文面になっているため、テーマ（タグ）の単語をそのまま渡して流用できる。
  const prompt = buildCategoryDictionaryPrompt(word, consultations);
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
    if (cached) return (cached as CachedRow).overview || null;
    return null;
  }

  await supabase.from('theme_summaries').upsert({
    word,
    overview,
    consultation_count: consultationCount,
    generated_at: new Date().toISOString(),
  });

  return overview;
}

export { DICTIONARY_INDEX_THRESHOLD };
