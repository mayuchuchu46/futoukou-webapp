import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildPrompt } from '@/lib/prompt';
import { CATS, Category, CATEGORY_EXAMPLES } from '@/lib/categories';
import { GRADE_OPTIONS, GENDER_OPTIONS } from '@/lib/types';
import { buildAutoSeedQuestionPrompt } from '@/lib/autoSeedConsultation';

// サンプル相談の自動投稿（1日5件、vercel.jsonのcron設定でランダムに見える
// バラバラの時刻に実行）。2026-10-14追加。
//
// 「ユーザーの実投稿が少ない状態でもホームが空に見えない」ことが目的。
// supabase_schema.sqlの初期サンプル4件（author_id='seed'）と同じ考え方の延長だが、
// 継続的に増え続けるため区別できるようauthor_idは'auto-seed'にしている。
//
// Vercelのcronは誰でもURLを叩けば呼び出せてしまうため、CRON_SECRET環境変数を
// 設定し、Authorization: Bearer <CRON_SECRET> ヘッダーで照合する
// （Vercel公式ドキュメント推奨の方式。cron設定からの呼び出しにはVercelが自動で
// このヘッダーを付与する）。CRON_SECRET未設定の場合は安全側に倒して常に拒否する。
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const categoryKeys = Object.keys(CATS) as Category[];
  const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
  const catLabel = CATS[category].label;

  // 学年・性別は実際の投稿と同じく任意項目。毎回必ず埋めると機械的に見えるため、
  // 一定確率でのみ設定する。
  const grade = Math.random() < 0.6 ? GRADE_OPTIONS[Math.floor(Math.random() * (GRADE_OPTIONS.length - 1))] : null;
  const genderPool = GENDER_OPTIONS.filter((g) => g !== '回答しない');
  const gender = Math.random() < 0.6 ? genderPool[Math.floor(Math.random() * genderPool.length)] : null;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // 「投稿される質問の言い回しが毎回似ていて、いかにもAIっぽい」との指摘を受けた対応
  // （2026-10-14、2026-10-17に追加対応）。原因は2つあった。
  // 1. CATEGORY_EXAMPLES（カテゴリごとに固定1文）を毎回そのまま参考文として渡していたため、
  //    同じカテゴリが当たるたびにAIが同じ書き出し・同じ文末表現（「〜ようになりました」等）に
  //    寄ってしまっていた。
  // 2. cron実行は毎回独立した呼び出しで、直前までにどんな言い回しを使ったかをAIが
  //    知らないため、回を重ねても自然にばらける仕組みが無かった。
  // 3.（2026-10-17追加）トーン（話し方）だけをランダム化しても、文章の長さ・整い方・
  //    構成の順番が毎回同じだと、結局「同じ人が書いている」ように見える、との指摘。
  // 対応として、(a) 直近の自動投稿の質問文を取得してAIに見せ、同じ書き出し・言い回しを
  // 避けるよう明示し、(b) 文体・話し方のトーンに加えて「執筆シチュエーション（文の長さ・
  // 整い方）」「書き出し・構成の順番」もランダムに指定して、呼び出しごとに違う「人」が
  // 書いたように見えるバリエーションを持たせた（lib/autoSeedConsultation.ts参照。
  // 管理画面からの既存投稿の作り直し＝/api/admin/consultations/regenerate-auto-seed
  // と同じロジックを共有している）。
  const supabase = getSupabaseAdmin();
  const { data: recentAutoRows } = await supabase
    .from('consultations')
    .select('question')
    .eq('author_id', 'auto-seed')
    .order('created_at', { ascending: false })
    .limit(8);
  const recentQuestions = (recentAutoRows || []).map((r) => r.question).filter(Boolean);

  const questionPrompt = buildAutoSeedQuestionPrompt(catLabel, CATEGORY_EXAMPLES[category], grade, gender, recentQuestions);

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
  const guideCat = guidelines?.categories?.[category];

  // 質問文と同じく、回答文も「毎回似たような出だし・長さでAIっぽい」との指摘を
  // 受けて、直近の自動投稿の回答を見せて書き出し・言い回しをばらけさせる
  // （2026-10-16追加）。
  const { data: recentAutoAnswerRows } = await supabase
    .from('consultations')
    .select('answer')
    .eq('author_id', 'auto-seed')
    .order('created_at', { ascending: false })
    .limit(8);
  const recentAnswers = (recentAutoAnswerRows || []).map((r) => r.answer).filter(Boolean);

  const answerPrompt = buildPrompt(
    category,
    question,
    guideCat,
    grade,
    gender,
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

  // 本来の相談フロー（app/api/consult/route.ts）と同じ安全上書き判定をここでも記録する
  // （2026-10-14追加）。自動投稿のサンプル文で発動することは想定していないが、
  // 万一発動した場合に結果ページの専用UIが正しく出るようにするため。
  const crisisDetected = answer.includes('0120-0-78310');

  const { data: row, error: insertErr } = await supabase
    .from('consultations')
    .insert({
      category,
      question,
      answer,
      grade,
      gender,
      author_id: 'auto-seed',
      likes: 0,
      liked_by: [],
      views: 0,
      crisis_detected: crisisDetected,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, consultation: { id: row.id, category } });
}
