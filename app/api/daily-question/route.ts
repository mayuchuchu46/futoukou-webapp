import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { getTodaysQuestion } from '@/lib/dailyQuestions';

// 「今日の質問」機能のAPI（2026-10-16追加）。「気づいたときにメモしておく」という
// AIの回答アドバイスを、サービス内の選択式アンケートとして実際にできるようにしたもの。
// 個別の回答は本人専用（他の会員には見せない）で、公開するのは「今日はみんなどう
// 答えているか」という同日・同質問の集計のみ。かつ、その集計も「自分がまだ今日答えて
// いない」場合は見せない（回答してはじめて結果が見える、という設計。会員登録必須の
// 機能であるのと同じ考え方で、タダ見だけの参加を避ける）。

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

export async function GET() {
  const { date, question } = getTodaysQuestion();
  const member = await getCurrentMember();

  if (!member) {
    return NextResponse.json({ loggedIn: false, date, question, myAnswer: null, aggregate: null });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('daily_answers')
    .select('value')
    .eq('member_id', member.id)
    .eq('answer_date', date)
    .maybeSingle();

  const myAnswer = existing?.value || null;
  const aggregate = myAnswer ? await buildAggregate(date, question.slug) : null;

  return NextResponse.json({ loggedIn: true, date, question, myAnswer, aggregate });
}

export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { value, child_id } = await req.json();
  const { date, question } = getTodaysQuestion();

  if (!value || !question.choices.some((c) => c.value === value)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

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

  // 1日1回。既に今日答えている場合は上書き（回答し直し）を許可する。
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
      { onConflict: 'member_id,answer_date' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const aggregate = await buildAggregate(date, question.slug);
  return NextResponse.json({ ok: true, myAnswer: value, aggregate });
}
