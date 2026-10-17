import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { DAILY_QUESTIONS } from '@/lib/dailyQuestions';
import { buildComments, type DailyComment } from '@/lib/dailyAnswers';

// 「みんなのデータ」の過去の質問一覧API（2026-10-17追加）。「過去の質問データも
// 見れるといい」との要望を受けて、/api/daily-question（今日の1問だけ）とは別に、
// 質問バンク（DAILY_QUESTIONS）のうち、実際にこれまで回答が付いた質問（＝これまでに
// 出たことがある質問）だけを、それぞれの累計集計つきで返す。まだ1度もローテーションに
// 出ていない質問（daily_answersに1件も無い質問）は一覧に含めない（2026-10-17、
// 「すでに出た質問だけにしたら？」との指摘を受けて絞り込みを追加）。
//
// 「過去の質問にも同じように回答を促したい」との要望を受けて（2026-10-17）、
// 今日の質問カードと同じ見せ方（未回答なら選択肢ボタン、回答済みなら結果）にする
// ため、各質問について「このビューア（会員＋子ども、または匿名ID）がすでに回答
// しているか（myAnswer）」も一緒に返す。回答自体は/api/daily-questionと同じく
// 会員登録なしでもできる。集計の実数（aggregate）を見せる条件も/api/daily-question
// と同じく「会員登録」ではなく「その質問に回答済みであること」にしている
// （2026-10-17、「ログインしなくても回答したら見れるようになるといい」との指摘を
// 受けて変更）。
// 過去の質問にも後からコメントを追加できるようにした（2026-10-17追加。「過去の質問も
// 後からコメント入れられるようにしておきたい」との要望）。今日の質問カードと同じく、
// 自分の既存コメント（myComment）とみんなのコメント一覧（comments）を、回答済みの
// 質問についてだけ返す。コメントの投稿・編集自体は/api/daily-question（slug指定）を
// そのまま使う。
export async function GET(req: NextRequest) {
  const member = await getCurrentMember();
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');
  const childIdParam = url.searchParams.get('child_id');

  const { data } = await supabase.from('daily_answers').select('question_slug, value');

  const countsBySlug: Record<string, Record<string, number>> = {};
  for (const row of data || []) {
    if (!countsBySlug[row.question_slug]) countsBySlug[row.question_slug] = {};
    countsBySlug[row.question_slug][row.value] = (countsBySlug[row.question_slug][row.value] || 0) + 1;
  }

  // すでに出た質問（＝1件でも回答が付いている質問）だけに絞る。DAILY_QUESTIONSの
  // 定義順を保ったまま絞り込む。
  const appearedQuestions = DAILY_QUESTIONS.filter((q) => !!countsBySlug[q.slug]);

  // このビューアがどのslugに既に回答しているか（value・自分のコメント）を調べる。
  const myAnswersBySlug: Record<string, string> = {};
  const myCommentsBySlug: Record<string, string | null> = {};
  if (member) {
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
    let myQuery = supabase.from('daily_answers').select('question_slug, value, comment').eq('member_id', member.id);
    myQuery = scopeChildId ? myQuery.eq('child_id', scopeChildId) : myQuery.is('child_id', null);
    const { data: mine } = await myQuery;
    for (const row of mine || []) {
      myAnswersBySlug[row.question_slug] = row.value;
      myCommentsBySlug[row.question_slug] = row.comment || null;
    }
  } else if (uid) {
    const { data: mine } = await supabase
      .from('daily_answers')
      .select('question_slug, value, comment')
      .eq('anon_uid', uid);
    for (const row of mine || []) {
      myAnswersBySlug[row.question_slug] = row.value;
      myCommentsBySlug[row.question_slug] = row.comment || null;
    }
  }

  // 質問ごとに、このビューアが回答済みの場合だけ集計の実数・コメントを見せる
  // （会員かどうかは問わない。上のコメント参照）。コメント一覧の取得は回答済みの
  // 質問の分だけ並行して行う（通常は19問のローテーションなので最大19件程度）。
  const answeredSlugs = appearedQuestions.filter((q) => !!myAnswersBySlug[q.slug]).map((q) => q.slug);
  const commentsEntries = await Promise.all(
    answeredSlugs.map(async (slug) => [slug, await buildComments(slug)] as [string, DailyComment[]])
  );
  const commentsBySlug: Record<string, DailyComment[]> = Object.fromEntries(commentsEntries);

  const questions = appearedQuestions.map((q) => {
    const myAnswer = myAnswersBySlug[q.slug] || null;
    if (!myAnswer) {
      return { slug: q.slug, text: q.text, choices: q.choices, myAnswer: null, myComment: null, aggregate: null, comments: [] };
    }
    const counts = countsBySlug[q.slug] || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      slug: q.slug,
      text: q.text,
      choices: q.choices,
      myAnswer,
      myComment: myCommentsBySlug[q.slug] || null,
      aggregate: { total, counts },
      comments: commentsBySlug[q.slug] || [],
    };
  });

  return NextResponse.json({ loggedIn: !!member, questions });
}
