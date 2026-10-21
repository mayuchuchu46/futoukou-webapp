import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildSummaryPrompt, SummaryConsultation } from '@/lib/prompt';
import { findQuestionBySlug } from '@/lib/dailyQuestions';

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
  // 「みんなのデータ」（daily_answers）の回答件数（2026-10-16追加）。古いキャッシュ行には
  // 無いためundefined/nullになり、その場合は0扱いにする（下記fromCachedRow参照）。
  daily_answer_count?: number | null;
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
  // daily_answersテーブルもconsultationsと同じくmember_id/child_idの両列を持つため、
  // 絞り込みに使う列名はconsultationColumnと共通（dailyAnswerColumnという別名でも
  // 同じ値を指すだけ）。
  if (scope.kind === 'member') {
    return {
      table: 'member_summaries',
      idColumn: 'member_id',
      consultationColumn: 'member_id' as const,
      dailyAnswerColumn: 'member_id' as const,
    };
  }
  return {
    table: 'child_summaries',
    idColumn: 'child_id',
    consultationColumn: 'child_id' as const,
    dailyAnswerColumn: 'child_id' as const,
  };
}

// daily_answersの1行を、AIサマリー用の読みやすい1行テキストに変換する。
// 質問文そのものだと長くなりがちなため、選択肢のラベル（回答内容）を日付と並べる形にする。
function formatDailyAnswerLine(row: { answer_date: string; question_slug: string; value: string }): string | null {
  const question = findQuestionBySlug(row.question_slug);
  if (!question) return null;
  const choice = question.choices.find((c) => c.value === row.value);
  const label = choice ? choice.label : row.value;
  return `- ${row.answer_date}：${question.text}→${label}`;
}

async function getOrGenerateSummary(scope: SummaryScope): Promise<MemberSummary | null> {
  const supabase = getSupabaseAdmin();
  const { table, idColumn, consultationColumn, dailyAnswerColumn } = scopeConfig(scope);

  // キャッシュ取得・daily_answers取得・crisis判定用直近クエリを並列で投げる
  // （以前は4本直列だったが、互いに依存がないため Promise.all で同時発行して
  //   合計待ち時間を短縮した。2026-10-22）。
  // consultationCountが0件なら即returnするが、その場合でも他のクエリが無駄に
  // 走るだけで副作用はない。
  const DAILY_ANSWER_LIMIT = 20;
  const RECENT_CRISIS_WINDOW = 3;

  const [
    { count },
    { data: cached },
    { data: dailyAnswerRows, count: dailyAnswerTotal },
    { data: recentRows },
  ] = await Promise.all([
    supabase
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq(consultationColumn, scope.id),
    // 列名を明示して select すると、その列がDB側にまだ存在しない場合（マイグレーション
    // 未実行のタイミング）にクエリ全体がエラーになり、既存のキャッシュ内容ごと読めなく
    // なってしまう（2026-10-16、daily_answer_count列追加時に実際に発生した不具合）。
    // select('*') なら実際に存在する列だけが返るため、未知の列が増えても古いDBのままでも
    // 安全に動く。
    supabase.from(table).select('*').eq(idColumn, scope.id).single(),
    // 「みんなのデータ」（daily_answers）の回答も伴走ノートに取り込む（2026-10-16追加。
    // 「メモするほど伴走ノートが充実する」という要望）。直近20件を新しい順で取得し、
    // 件数をキャッシュ再生成の判定にも使う（相談件数が変わらなくても、新しい日々の
    // 回答が増えていれば再生成する）。
    supabase
      .from('daily_answers')
      .select('answer_date, question_slug, value', { count: 'exact' })
      .eq(dailyAnswerColumn, scope.id)
      .order('answer_date', { ascending: false })
      .limit(DAILY_ANSWER_LIMIT),
    // 「一度希死念慮系の相談をしたら、ずっと同じ内容（専門窓口案内だけ）が表示されて
    // 更新されない」との指摘を受けて追加（2026-10-16）。直近（新しい順で先頭）3件の中に
    // crisis_detectedがあるかどうかだけで判定する。古い相談（4件目以降）にcrisis_detectedが
    // 残っていても、直近が落ち着いていれば通常の内容に戻る（詳細はlib/prompt.ts
    // buildSummaryPromptのコメント参照）。件数が変わっていなくても、このフラグが前回
    // キャッシュ時と変わっていれば再生成の対象にする（例：crisis_detectedな相談が直近
    // 3件から外れた＝新しい相談を増やさずページを開き直しただけでも、古い専門窓口案内の
    // ままにしない）。
    supabase
      .from('consultations')
      .select('crisis_detected')
      .eq(consultationColumn, scope.id)
      .order('created_at', { ascending: false })
      .limit(RECENT_CRISIS_WINDOW),
  ]);

  const consultationCount = count || 0;
  if (consultationCount === 0) return null;

  const dailyAnswerCount = dailyAnswerTotal || 0;
  const dailyAnswerLines = (dailyAnswerRows || [])
    .map(formatDailyAnswerLine)
    .filter((l): l is string => !!l);
  const forceCrisisOverride = (recentRows || []).some((r) => r.crisis_detected);

  if (
    cached &&
    cached.consultation_count === consultationCount &&
    !!(cached as CachedRow).crisis_override === forceCrisisOverride &&
    ((cached as CachedRow).daily_answer_count || 0) === dailyAnswerCount
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
  const prompt = buildSummaryPrompt(history, forceCrisisOverride, dailyAnswerLines);
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
    daily_answer_count: dailyAnswerCount,
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
