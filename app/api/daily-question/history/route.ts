import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { DAILY_QUESTIONS } from '@/lib/dailyQuestions';

// 「みんなのデータ」の過去の質問一覧API（2026-10-17追加）。「過去の質問データも
// 見れるといい」との要望を受けて、/api/daily-question（今日の1問だけ）とは別に、
// 質問バンク（DAILY_QUESTIONS）全19問それぞれの累計集計をまとめて返す。
// 集計グラフは会員登録しないと見られない設計（/api/daily-questionと同じ）なので、
// 未ログインの場合は質問文・選択肢だけを返し、aggregateは付けない（クライアント側で
// ぼかし表示にする）。
//
// daily_answersを1回だけ全件取得し（question_slug, valueの2列のみ）、JS側で
// 質問ごとに集計する。質問ごとに19回クエリを投げるより、こちらの方が速い。
export async function GET() {
  const member = await getCurrentMember();

  if (!member) {
    return NextResponse.json({
      loggedIn: false,
      questions: DAILY_QUESTIONS.map((q) => ({ slug: q.slug, text: q.text, choices: q.choices, aggregate: null })),
    });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('daily_answers').select('question_slug, value');

  const countsBySlug: Record<string, Record<string, number>> = {};
  for (const row of data || []) {
    if (!countsBySlug[row.question_slug]) countsBySlug[row.question_slug] = {};
    countsBySlug[row.question_slug][row.value] = (countsBySlug[row.question_slug][row.value] || 0) + 1;
  }

  const questions = DAILY_QUESTIONS.map((q) => {
    const counts = countsBySlug[q.slug] || {};
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { slug: q.slug, text: q.text, choices: q.choices, aggregate: { total, counts } };
  });

  return NextResponse.json({ loggedIn: true, questions });
}
