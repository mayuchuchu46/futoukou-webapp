import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt } from '@/lib/prompt';
import { CATS, Category, CATEGORY_EXAMPLES } from '@/lib/categories';
import { buildAutoSeedQuestionPrompt } from '@/lib/autoSeedConsultation';

// 自動投稿（サンプル相談、author_id='auto-seed'）の質問文を含めて作り直すための
// 管理者向けエンドポイント（2026-10-17追加）。
//
// 既存の/api/admin/consultations/regenerate-answerは「回答のみ」の再生成で、実ユーザーの
// 相談（request_type='ai'）も対象に含む。一方こちらは「質問文（相談文そのもの）」も
// 書き直す点が異なるため、実ユーザー本人が書いた相談文を誤って上書きしてしまう事故を
// 防ぐ目的で、対象をauthor_id='auto-seed'（自動投稿分）に限定している
// （実ユーザーの相談本文を書き換えることは絶対に無いようにする）。
//
// きっかけ：「自動投稿の質問文がAIっぽく、同じ人が書いたように見える。過去の分も
// 直したい」との指摘。cron側（app/api/cron/auto-post/route.ts）の生成ロジックを改善
// しただけでは、公開済みの過去の投稿には反映されないため、既存行を新しいロジックで
// 作り直すための専用エンドポイントを用意した。
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY が設定されていません' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('id, category, grade, gender, author_id, request_type')
    .eq('id', id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: '相談が見つかりません' }, { status: 404 });
  }
  // 実ユーザーが書いた相談文を誤って書き換える事故を防ぐため、自動投稿分のみを対象にする。
  if (row.author_id !== 'auto-seed') {
    return NextResponse.json({ error: '自動投稿（サンプル）以外は対象にできません' }, { status: 400 });
  }

  const catLabel = CATS[row.category as Category]?.label || row.category;

  // 直近の他の自動投稿（このidを除く）を参考に、書き出し・言い回し・長さが
  // 似ないようにする（cron側と同じ考え方。lib/autoSeedConsultation.ts参照）。
  const { data: recentAutoRows } = await supabase
    .from('consultations')
    .select('question')
    .eq('author_id', 'auto-seed')
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(8);
  const recentQuestions = (recentAutoRows || []).map((r) => r.question).filter(Boolean);

  const questionPrompt = buildAutoSeedQuestionPrompt(
    catLabel,
    CATEGORY_EXAMPLES[row.category as Category],
    row.grade || null,
    row.gender || null,
    recentQuestions
  );

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let question: string;
  try {
    const qMsg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: questionPrompt }],
    });
    const qBlock = qMsg.content.find((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text');
    question = qBlock ? qBlock.text.trim() : '';
    if (!question) throw new Error('empty question');
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '相談文の生成に失敗しました: ' + message }, { status: 502 });
  }

  const { data: guidelines } = await supabase.from('guidelines').select('*').eq('id', 'default').single();
  const guideCat = guidelines?.categories?.[row.category];

  const { data: recentAutoAnswerRows } = await supabase
    .from('consultations')
    .select('answer')
    .eq('author_id', 'auto-seed')
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(8);
  const recentAnswers = (recentAutoAnswerRows || []).map((r) => r.answer).filter(Boolean);

  const answerPrompt = buildPrompt(
    row.category,
    question,
    guideCat,
    row.grade || null,
    row.gender || null,
    !!guidelines?.supervised,
    undefined,
    recentAnswers
  );

  let answer: string;
  try {
    const aMsg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: answerPrompt }],
    });
    const aBlock = aMsg.content.find((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text');
    answer = aBlock ? aBlock.text.trim() : '';
    if (!answer) throw new Error('empty answer');
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '回答の生成に失敗しました: ' + message }, { status: 502 });
  }

  // 本来のcron投稿（app/api/cron/auto-post/route.ts）と同じ安全上書き判定を再計算する。
  const crisisDetected = answer.includes('0120-0-78310');

  const { error: updateErr } = await supabase
    .from('consultations')
    .update({ question, answer, crisis_detected: crisisDetected })
    .eq('id', id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, question, answer });
}
