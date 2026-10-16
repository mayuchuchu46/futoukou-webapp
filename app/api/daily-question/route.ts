import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { getTodaysQuestion, findQuestionBySlug } from '@/lib/dailyQuestions';

// 「みんなのデータ」機能のAPI（2026-10-16追加）。「気づいたときにメモしておく」という
// AIの回答アドバイスを、サービス内の選択式アンケートとして実際にできるようにしたもの。
// 個別の回答は本人専用で、他の人には見せない。公開するのは「今日はみんなどう
// 答えているか」という同日・同質問の集計のみ。
// 回答自体は、相談（/ask）と同じくブラウザ単位の匿名ID（lib/uid.ts、getUid()）があれば
// 会員登録なしでもできる。ただし集計グラフ（本物の数字）は、会員登録して初めて見られる
// （2026-10-16、「回答は会員じゃなくてもできるが、閲覧は会員じゃないと見れない」設計に
// 変更。それまでは回答・閲覧とも会員登録必須だった）。

async function buildAggregate(answerDate: string, questionSlug: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('daily_answers')
    .select('value')
    .eq('answer_date', answerDate)
    .eq('question_slug', questionSlug);

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.value] = (counts[row.value] || 0) + 1;
  }
  return { total: data?.length || 0, counts };
}

export async function GET(req: NextRequest) {
  const { date, question: todaysQuestion } = getTodaysQuestion();
  const member = await getCurrentMember();
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');

  const supabase = getSupabaseAdmin();

  if (!member) {
    // 未ログインでも、匿名IDで既に今日答えているかどうかは確認する（質問文の
    // 一貫性のため。下のfindQuestionBySlugの説明を参照）。ただし集計グラフは
    // 会員登録するまで見せない（本物の数字は渡さず、クライアント側でぼかし見本を
    // 出す）。
    let myAnswer: string | null = null;
    let question = todaysQuestion;
    if (uid) {
      const { data: existing } = await supabase
        .from('daily_answers')
        .select('value, question_slug')
        .eq('anon_uid', uid)
        .eq('answer_date', date)
        .maybeSingle();
      if (existing) {
        myAnswer = existing.value;
        question = findQuestionBySlug(existing.question_slug) || todaysQuestion;
      }
    }
    return NextResponse.json({ loggedIn: false, date, question, myAnswer, aggregate: null });
  }

  // 兄弟（複数の子どもプロフィール）がいる場合、子どもごとに1日1回答えられるように
  // する（2026-10-16、「1人分答えたらもう1人の分が答えられない」不具合の修正）。
  // どの子ども（または「全体」）についての回答かをchild_idクエリパラメータで切り替える。
  const childIdParam = url.searchParams.get('child_id');
  let scopeChildId: string | null = null;
  if (childIdParam) {
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', childIdParam)
      .eq('member_id', member.id)
      .single();
    if (child) scopeChildId = child.id;
  }

  let existingQuery = supabase
    .from('daily_answers')
    .select('value, question_slug')
    .eq('member_id', member.id)
    .eq('answer_date', date);
  existingQuery = scopeChildId ? existingQuery.eq('child_id', scopeChildId) : existingQuery.is('child_id', null);
  const { data: existing } = await existingQuery.maybeSingle();

  // 既にその日に回答済みの場合、表示する質問は「保存されている回答のquestion_slug」を
  // 使う（getTodaysQuestion()を使い回さない）。質問バンクの配列を増減させると、同じ
  // 日付でもローテーション計算（日数 % 配列長）の結果が変わってしまい、「回答した時点の
  // 質問」と「今計算し直した今日の質問」がズレて、回答が別の質問の選択肢として
  // 表示されてしまう不具合があったため（2026-10-16、質問バンクを7問→19問に拡充した
  // ときに実際に発生）。回答済みなら常に、保存された質問に対する結果として表示する。
  const question = existing ? findQuestionBySlug(existing.question_slug) || todaysQuestion : todaysQuestion;
  const myAnswer = existing?.value || null;
  const aggregate = myAnswer ? await buildAggregate(date, question.slug) : null;

  return NextResponse.json({ loggedIn: true, date, question, myAnswer, aggregate });
}

export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  const { value, child_id, uid } = await req.json();
  const { date, question } = getTodaysQuestion();

  if (!value || !question.choices.some((c) => c.value === value)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (!member) {
    // 未ログイン：ブラウザ単位の匿名ID（getUid()）で回答を記録する（会員登録不要）。
    // 集計グラフは会員登録しないと見せない設計のため、ここではaggregateを返さない。
    if (!uid) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 });
    }
    const { error } = await supabase
      .from('daily_answers')
      .upsert(
        { anon_uid: uid, answer_date: date, question_slug: question.slug, value },
        { onConflict: 'anon_uid,answer_date' }
      );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, myAnswer: value, aggregate: null });
  }

  // 子どもプロフィール（任意）。他人の子どもを指定できないよう、本人の子どもである
  // ことを確認する（/api/consultと同じ考え方）。
  let childId: string | null = null;
  if (child_id) {
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('member_id', member.id)
      .single();
    if (child) childId = child.id;
  }

  // 子どもごと（「全体」も含む）に1日1回。既にそのスコープで今日答えている場合は
  // 上書き（回答し直し）を許可する。onConflictの対象はmember_id・answer_dateに
  // child_key（child_idのNULLをダミーUUIDに正規化したgenerated column。
  // supabase_schema.sql参照）を加えた3列の一意制約（2026-10-16、兄弟それぞれが
  // 答えられるようにする修正で変更）。
  const { error } = await supabase
    .from('daily_answers')
    .upsert(
      {
        member_id: member.id,
        child_id: childId,
        answer_date: date,
        question_slug: question.slug,
        value,
      },
      { onConflict: 'member_id,answer_date,child_key' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const aggregate = await buildAggregate(date, question.slug);
  return NextResponse.json({ ok: true, myAnswer: value, aggregate });
}
