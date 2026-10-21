import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildSchoolFitPrompt, SummaryConsultation } from '@/lib/prompt';
import { buildSchoolFactsLines } from '@/lib/schoolFacts';
import { ManabiTayoukaGakko } from '@/lib/data/manabiTayoukaGakko';

// 学校ごとの「相性メモ」（2026-10-22追加）。「この学校がうちの子に合うか合わないかって、
// 相談するごとにわかってくると良くない？」との要望を受けて追加。lib/memberSummary.tsの
// 伴走ノート（member_summaries/child_summaries）と全く同じキャッシュ方式で、会員単位・
// 子ども単位の相談履歴の蓄積から、見ている学校ごとに「今分かっている範囲の相性メモ」を
// 生成・キャッシュする。
//
// 会員登録済みの人のみ対象（匿名利用者には出さない。/notebookの伴走ノートと同じ方針）。
// キャッシュの再生成判定は、学校ごとの相談件数ではなく、その会員／子どもの相談件数全体の
// 変化を見る（lib/memberSummary.tsと同じ考え方。学校名を直接出していない相談でも、
// お子さんの状況理解の材料になるため）。
//
// 呼び出し側（Route Handler）がCookieから会員情報を読む前提で、サーバーコンポーネント
// から直接このファイルを呼ばないこと（lib/consultations.tsのコメント参照。Cookieベースの
// 会員判定をSuspense配下でないサーバーコンポーネントで行うと、CDNの共有キャッシュに
// 特定ユーザー向けの表示が乗ってしまう危険があるため、/api/school-fitのようなRoute
// Handler経由でのみ使う）。

export type SchoolFitNote = {
  fitNote: string;
  consultationCount: number;
  generatedAt: string;
};

type CachedRow = {
  fit_note: string;
  consultation_count: number;
  generated_at: string;
};

type FitScope = { kind: 'member'; id: string } | { kind: 'child'; id: string };

function scopeConfig(scope: FitScope) {
  if (scope.kind === 'member') {
    return { table: 'member_school_fit_notes', idColumn: 'member_id' as const, consultationColumn: 'member_id' as const };
  }
  return { table: 'child_school_fit_notes', idColumn: 'child_id' as const, consultationColumn: 'child_id' as const };
}

async function getOrGenerateFitNote(scope: FitScope, school: ManabiTayoukaGakko): Promise<SchoolFitNote | null> {
  const supabase = getSupabaseAdmin();
  const { table, idColumn, consultationColumn } = scopeConfig(scope);

  const { count } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq(consultationColumn, scope.id);

  const consultationCount = count || 0;
  // まだ相談が1件も無ければ、材料が無いので生成しない（呼び出し側で「まだ相談がありません」
  // 等の案内に使う）。
  if (consultationCount === 0) return null;

  const { data: cached } = await supabase
    .from(table)
    .select('*')
    .eq(idColumn, scope.id)
    .eq('school_no', school.no)
    .maybeSingle();

  if (cached && (cached as CachedRow).consultation_count === consultationCount) {
    const row = cached as CachedRow;
    return { fitNote: row.fit_note, consultationCount: row.consultation_count, generatedAt: row.generated_at };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // APIキーが無い環境では、古いキャッシュがあればそれを返し、無ければ諦める
    // （lib/memberSummary.tsと同じ方針）。
    if (cached) {
      const row = cached as CachedRow;
      return { fitNote: row.fit_note, consultationCount, generatedAt: row.generated_at };
    }
    return null;
  }

  const { data: rows } = await supabase
    .from('consultations')
    .select('category, question, answer, created_at')
    .eq(consultationColumn, scope.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!rows || rows.length === 0) return null;

  const history = rows as SummaryConsultation[];
  const prompt = buildSchoolFitPrompt(buildSchoolFactsLines(school), history);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let fitNote = '';
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = msg.content.find(
      (b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text'
    );
    fitNote = textBlock ? textBlock.text.trim() : '';
    if (!fitNote) throw new Error('相性メモが空でした');
  } catch {
    if (cached) {
      const row = cached as CachedRow;
      return { fitNote: row.fit_note, consultationCount, generatedAt: row.generated_at };
    }
    return null;
  }

  const generatedAt = new Date().toISOString();
  await supabase.from(table).upsert({
    [idColumn]: scope.id,
    school_no: school.no,
    fit_note: fitNote,
    consultation_count: consultationCount,
    generated_at: generatedAt,
  });

  return { fitNote, consultationCount, generatedAt };
}

export async function getOrGenerateMemberSchoolFit(memberId: string, school: ManabiTayoukaGakko): Promise<SchoolFitNote | null> {
  return getOrGenerateFitNote({ kind: 'member', id: memberId }, school);
}

export async function getOrGenerateChildSchoolFit(childId: string, school: ManabiTayoukaGakko): Promise<SchoolFitNote | null> {
  return getOrGenerateFitNote({ kind: 'child', id: childId }, school);
}

// 画面側の「簡単な目安」表示用（例：相談○件分のデータ、だんだん分かってきました）。
// 会員登録・ログイン必須の機能のため、相談0件の時点（null）は呼び出し側で別の案内に
// 分岐させる前提で、ここでは1件以上の場合の目安だけを返す。
export function fitProgressLabel(consultationCount: number): string {
  if (consultationCount <= 2) return 'まだ判断材料が少ないです';
  if (consultationCount <= 5) return '少しずつ分かってきました';
  return 'だんだん分かってきました';
}
