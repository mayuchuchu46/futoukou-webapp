import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildSummaryPrompt, SummaryConsultation } from '@/lib/prompt';

export type MemberSummary = {
  statusSummary: string;
  advice: string;
  phrasingSuggestion: string;
  environmentSuggestion: string;
  schoolFitPoints: string;
  consultationCount: number;
  generatedAt: string;
};

type CachedRow = {
  status_summary: string;
  advice: string;
  phrasing_suggestion: string | null;
  environment_suggestion: string | null;
  school_fit_points: string | null;
  consultation_count: number;
  generated_at: string;
  // crisis_override列が無い古いキャッシュ行（本修正より前に生成されたもの）は
  // undefined/nullになる。その場合はfalse扱いにせず「不明」として安全側＝
  // 強制再生成（キャッシュ不一致）に倒す（下記の比較処理を参照）。
  crisis_override?: boolean | null;
};

function fromCachedRow(cached: CachedRow, consultationCount?: number): MemberSummary {
  return {
    statusSummary: cached.status_summary,
    advice: cached.advice,
    // phrasing_suggestion/environment_suggestion/school_fit_pointsは後から追加した列のため、
    // 追加前に生成された古いキャッシュ行ではnullのことがある。
    phrasingSuggestion: cached.phrasing_suggestion || '',
    environmentSuggestion: cached.environment_suggestion || '',
    schoolFitPoints: cached.school_fit_points || '',
    consultationCount: consultationCount ?? cached.consultation_count,
    generatedAt: cached.generated_at,
  };
}

// 「今のお子さんの状況」サマリー生成の本体（2026-10-16、子どもプロフィール機能の追加に
// あわせて汎用化）。もともとは会員（member_id）単位の1種類だけだったが、子どもプロフィール
// （children）を作っている会員は、子ども単位（child_id）でも同じ仕組みのノートを持てる
// ようにした。scopeで対象のテーブル・列を切り替えるだけで、キャッシュ比較・安全上書き
// 判定・AI生成のロジック自体は共通。
type SummaryScope =
  | { kind: 'member'; id: string }
  | { kind: 'child'; id: string };

function scopeConfig(scope: SummaryScope) {
  if (scope.kind === 'member') {
    return { table: 'member_summaries', idColumn: 'member_id', consultationColumn: 'member_id' as const };
  }
  return { table: 'child_summaries', idColumn: 'child_id', consultationColumn: 'child_id' as const };
}

async function getOrGenerateSummary(scope: SummaryScope): Promise<MemberSummary | null> {
  const supabase = getSupabaseAdmin();
  const { table, idColumn, consultationColumn } = scopeConfig(scope);

  const { count } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq(consultationColumn, scope.id);

  const consultationCount = count || 0;
  if (consultationCount === 0) return null;

  const { data: cached } = await supabase
    .from(table)
    .select(
      'status_summary, advice, phrasing_suggestion, environment_suggestion, school_fit_points, consultation_count, generated_at, crisis_override'
    )
    .eq(idColumn, scope.id)
    .single();

  // 「一度希死念慮系の相談をしたら、ずっと同じ内容（専門窓口案内だけ）が表示されて
  // 更新されない」との指摘を受けて追加（2026-10-16）。直近（新しい順で先頭）3件の中に
  // crisis_detectedがあるかどうかだけで判定する。古い相談（4件目以降）にcrisis_detectedが
  // 残っていても、直近が落ち着いていれば通常の内容に戻る（詳細はlib/prompt.ts
  // buildSummaryPromptのコメント参照）。件数が変わっていなくても、このフラグが前回
  // キャッシュ時と変わっていれば再生成の対象にする（例：crisis_detectedな相談が直近
  // 3件から外れた＝新しい相談を増やさずページを開き直しただけでも、古い専門窓口案内の
  // ままにしない）。
  const RECENT_CRISIS_WINDOW = 3;
  const { data: recentRows } = await supabase
    .from('consultations')
    .select('crisis_detected')
    .eq(consultationColumn, scope.id)
    .order('created_at', { ascending: false })
    .limit(RECENT_CRISIS_WINDOW);
  const forceCrisisOverride = (recentRows || []).some((r) => r.crisis_detected);

  if (
    cached &&
    cached.consultation_count === consultationCount &&
    !!(cached as CachedRow).crisis_override === forceCrisisOverride
  ) {
    return fromCachedRow(cached as CachedRow, consultationCount);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // APIキーが無い環境（ローカルビルド確認等）では、キャッシュが古くても
    // 古い内容のまま返す。キャッシュも無ければ生成を諦めて null を返す。
    if (cached) return fromCachedRow(cached as CachedRow);
    return null;
  }

  const { data: rows } = await supabase
    .from('consultations')
    .select('category, question, answer, created_at, crisis_detected')
    .eq(consultationColumn, scope.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!rows || rows.length === 0) return null;

  const history = rows as SummaryConsultation[];
  const prompt = buildSummaryPrompt(history, forceCrisisOverride);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let statusSummary = '';
  let advice = '';
  let phrasingSuggestion = '';
  let environmentSuggestion = '';
  let schoolFitPoints = '';
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 700,
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
    phrasingSuggestion = typeof parsed.phrasing_suggestion === 'string' ? parsed.phrasing_suggestion.trim() : '';
    environmentSuggestion =
      typeof parsed.environment_suggestion === 'string' ? parsed.environment_suggestion.trim() : '';
    schoolFitPoints = typeof parsed.school_fit_points === 'string' ? parsed.school_fit_points.trim() : '';
    if (!statusSummary || !advice) throw new Error('サマリーが空でした');
  } catch {
    // 生成に失敗した場合、古いキャッシュがあればそれを返し、無ければ諦める
    // （マイページ全体を落とすほどの機能ではないため）。
    if (cached) return fromCachedRow(cached as CachedRow);
    return null;
  }

  const generatedAt = new Date().toISOString();
  await supabase.from(table).upsert({
    [idColumn]: scope.id,
    status_summary: statusSummary,
    advice,
    phrasing_suggestion: phrasingSuggestion,
    environment_suggestion: environmentSuggestion,
    school_fit_points: schoolFitPoints,
    consultation_count: consultationCount,
    crisis_override: forceCrisisOverride,
    generated_at: generatedAt,
  });

  return {
    statusSummary,
    advice,
    phrasingSuggestion,
    environmentSuggestion,
    schoolFitPoints,
    consultationCount,
    generatedAt,
  };
}

// マイページ（アカウント全体）の「今のお子さんの状況」サマリーを取得する。
// 会員の相談件数が、キャッシュ生成時から増えていなければキャッシュをそのまま返し、
// 増えていれば（＝新しい相談が追加されていれば）そのときだけAIを呼び直して再生成する。
// 相談が1件もない会員には null を返す（呼び出し側で「まだ相談がありません」表示に使う）。
// 子どもプロフィールを使っている会員でも、ここでの集計対象は「その会員が投稿した
// 全ての相談」（child_idの有無を問わない）のまま変わらない。子ども単位のノートは
// getOrGenerateChildSummaryを使う。
export async function getOrGenerateMemberSummary(memberId: string): Promise<MemberSummary | null> {
  return getOrGenerateSummary({ kind: 'member', id: memberId });
}

// 子どもプロフィール単位の「今の状況」サマリーを取得する（2026-10-16追加）。
// 「相談する」画面でその子どもが選ばれていた相談（consultations.child_id）だけを
// 対象に集計する。仕組み自体はgetOrGenerateMemberSummaryと全く同じ。
export async function getOrGenerateChildSummary(childId: string): Promise<MemberSummary | null> {
  return getOrGenerateSummary({ kind: 'child', id: childId });
}
