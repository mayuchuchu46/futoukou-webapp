import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { DAILY_QUESTIONS } from '@/lib/dailyQuestions';

// 「みんなのデータ」の過去の質問一覧API（2026-10-17追加）。「過去の質問データも
// 見れるといい」との要望を受けて、/api/daily-question（今日の1問だけ）とは別に、
// 質問バンク（DAILY_QUESTIONS）のうち、実際にこれまで回答が付いた質問（＝これまでに
// 出たことがある質問）だけを、それぞれの累計集計つきで返す。まだ1度もローテーションに
// 出ていない質問（daily_answersに1件も無い質問）は一覧に含めない（2026-10-17、
// 「すでに出た質問だけにしたら？」との指摘を受けて絞り込みを追加。日付の計算で
// 「出たはず」を推測するのではなく、実際に回答が付いているかどうかで判定する。
// これまでにも質問バンクのサイズ変更でローテーション計算がズレる不具合があったため、
// 日付から逆算する方式は避けている）。
//
// 「どの質問が出たことがあるか」自体は非公開情報ではないため、未ログインでも判定には
// 使う。ただし集計グラフ（本物の件数）は会員登録しないと見られない設計
// （/api/daily-questionと同じ）なので、未ログインの場合はaggregateを付けず、質問文・
// 選択肢のみ返す（クライアント側でぼかし表示にする）。
//
// daily_answersを1回だけ全件取得し（question_slug, valueの2列のみ）、JS側で
// 質問ごとに集計する。質問ごとに19回クエリを投げるより、こちらの方が速い。
export async function GET() {
  const member = await getCurrentMember();
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('daily_answers').select('question_slug, value');

  const countsBySlug: Record<string, Record<string, number>> = {};
  for (const row of data || []) {
    if (!countsBySlug[row.question_slug]) countsBySlug[row.question_slug] = {};
    countsBySlug[row.question_slug][row.value] = (countsBySlug[row.question_slug][row.value] || 0) + 1;
  }

  // すでに出た質問（＝1件でも回答が付いている質問）だけに絞る。DAILY_QUESTIONSの
  // 定義順を保ったまま絞り込む。
  const appearedQuestions = DAILY_QUESTIONS.filter((q) => !!countsBySlug[q.slug]);

  if (!member) {
    return NextResponse.json({
      loggedIn: false,
      questions: appearedQuestions.map((q) => ({ slug: q.slug, text: q.text, choices: q.choices, aggregate: null })),
    });
  }

  const questions = appearedQuestions.map((q) => {
    const counts = countsBySlug[q.slug] || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { slug: q.slug, text: q.text, choices: q.choices, aggregate: { total, counts } };
  });

  return NextResponse.json({ loggedIn: true, questions });
}
