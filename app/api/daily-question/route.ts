import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentMember } from '@/lib/memberAuth';
import { getTodaysQuestion, findQuestionBySlug } from '@/lib/dailyQuestions';
import { buildAggregate, buildComments, normalizeComment } from '@/lib/dailyAnswers';

// 「みんなのデータ」機能のAPI（2026-10-16追加）。「気づいたときにメモしておく」という
// AIの回答アドバイスを、サービス内の選択式アンケートとして実際にできるようにしたもの。
// 個別の回答は本人専用で、他の人には見せない。公開するのは「みんなどう答えているか」
// という同じ質問の集計のみ。
// 集計グラフは「今日の回答」だけでなく、同じ質問（19問ローテーションなので約19日に
// 1回しか出ない）がこれまでに出た分も全部合わせた累計にしている（2026-10-17、
// 「今日だけだと全然データが取れない」との指摘を受けて、日付を絞らない累計集計に
// 変更。buildAggregate参照）。
// 回答自体は、相談（/ask）と同じくブラウザ単位の匿名ID（lib/uid.ts、getUid()）があれば
// 会員登録なしでもできる。集計グラフ（本物の数字）・コメント一覧を見られる条件は
// 「その質問に回答済みであること」で、会員登録は問わない（2026-10-17、「ログインしな
// くても回答したら見れるようになるといい」との指摘を受けて変更。この機能の狙いである
// 「同じように悩んでいる人がいると実感できる」ことと、閲覧に会員登録を必須にすることが
// 矛盾していたため。なお2026-10-16時点では一度「会員登録しないと見れない」設計に
// していたが、今回これを「回答済みであること」に緩和した）。
// POSTはslugを渡すと「今日の質問」以外（過去の質問一覧、/api/daily-question/history）
// にも回答できる（2026-10-17、「過去の質問にも同じように回答を促したい」との要望を
// 受けて対応。slug省略時は従来通り今日の質問に回答する）。これにあわせて、回答の
// 一意制約も「1日1回」からquestion_slugベース（同じ質問には1人1回まで）に変更した
// （supabase_schema.sql参照）。
// 回答に任意のコメントを添えられるようにした（2026-10-17追加。「同じように悩んでいる
// 人がいるんだと実感できるように」との要望）。コメントは集計グラフと同じく会員登録後
// にしか見えない。自由記述はモデレーション手段が無いとリスクが高い（過去にconsultations
// のコメント機能を同じ理由で一度削除した経緯がある）ため、通報・非表示の仕組み
// （comment_reports/comment_hidden、supabase_schema.sql参照）を最初から用意している。
// 今回の対応範囲は「今日の質問」カードのみで、過去の質問一覧（/api/daily-question/
// history）側にはまだコメント機能を付けていない。
// コメント入力欄は、最初に回答するときだけでなく、すでに回答済みの質問に対しても
// 後からコメントを追加・編集できるようにしている（2026-10-17追加。「コメント入れ
// られないよー」との指摘を受けて対応。すでに回答している質問の方が大半になるため、
// 最初の回答時しか入力できない設計では実質コメントが使えない状態になっていた）。
// そのため、自分自身の既存コメント（myComment）もレスポンスに含める。
// 過去の質問一覧（/api/daily-question/history）にも同じコメント機能を追加した
// （2026-10-17追加）。集計・コメント関連の処理はlib/dailyAnswers.tsに共通化して
// 両方のAPIルートから使っている。

export async function GET(req: NextRequest) {
  const { date, question: todaysQuestion } = getTodaysQuestion();
  const member = await getCurrentMember();
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');

  const supabase = getSupabaseAdmin();

  if (!member) {
    // 未ログインでも、匿名IDで今日の質問に既に答えているかどうかは確認する
    // （質問文の一貫性のため。下のfindQuestionBySlugの説明を参照）。「今日の質問」に
    // 答えたかどうかはquestion_slugで判定する（一意制約をanswer_dateからslugベースに
    // 変更したのにあわせた、2026-10-17）。集計グラフ・コメントは、会員登録の有無では
    // なく「回答済みかどうか」で見せる（2026-10-17、上のコメント参照）。
    let myAnswer: string | null = null;
    let myComment: string | null = null;
    const question = todaysQuestion;
    if (uid) {
      const { data: existing } = await supabase
        .from('daily_answers')
        .select('value, comment')
        .eq('anon_uid', uid)
        .eq('question_slug', todaysQuestion.slug)
        .maybeSingle();
      if (existing) {
        myAnswer = existing.value;
        myComment = existing.comment || null;
      }
    }
    const aggregate = myAnswer ? await buildAggregate(question.slug) : null;
    const comments = myAnswer ? await buildComments(question.slug) : [];
    return NextResponse.json({ loggedIn: false, date, question, myAnswer, myComment, aggregate, comments });
  }

  // 兄弟（複数の子どもプロフィール）がいる場合、子どもごとに別々に答えられるように
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

  // 「今日の質問」に、このスコープ（会員・子ども）が既に答えているかどうかを
  // question_slugで判定する（2026-10-17、一意制約をslugベースに変更したのにあわせた
  // 変更。同じ質問は次にローテーションで出たときも「既に回答済み」として扱われる）。
  let existingQuery = supabase
    .from('daily_answers')
    .select('value, comment')
    .eq('member_id', member.id)
    .eq('question_slug', todaysQuestion.slug);
  existingQuery = scopeChildId ? existingQuery.eq('child_id', scopeChildId) : existingQuery.is('child_id', null);
  const { data: existing } = await existingQuery.maybeSingle();

  const question = todaysQuestion;
  const myAnswer = existing?.value || null;
  const myComment = existing?.comment || null;
  const aggregate = myAnswer ? await buildAggregate(question.slug) : null;
  const comments = myAnswer ? await buildComments(question.slug) : [];

  return NextResponse.json({ loggedIn: true, date, question, myAnswer, myComment, aggregate, comments });
}

export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  const { value, child_id, uid, slug, comment: rawComment } = await req.json();
  const { date, question: todaysQuestion } = getTodaysQuestion();

  // slugが渡された場合は過去の質問一覧からの回答（/api/daily-question/history参照）。
  // 実在する質問かを確認し、無ければ今日の質問にフォールバックするのではなくエラーにする
  // （存在しないslugで不正なデータが作られるのを防ぐ）。
  const question = slug ? findQuestionBySlug(slug) : todaysQuestion;
  if (!question) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  if (!value || !question.choices.some((c) => c.value === value)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const comment = normalizeComment(rawComment);

  const supabase = getSupabaseAdmin();

  if (!member) {
    // 未ログイン：ブラウザ単位の匿名ID（getUid()）で回答を記録する（会員登録不要）。
    // 回答済みになった時点で、集計グラフ・コメント一覧も会員と同じように返す
    // （2026-10-17、閲覧条件を「会員登録」から「回答済みであること」に変更）。
    if (!uid) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 });
    }
    const { error } = await supabase
      .from('daily_answers')
      .upsert(
        { anon_uid: uid, answer_date: date, question_slug: question.slug, value, comment },
        { onConflict: 'anon_uid,question_slug' }
      );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const aggregate = await buildAggregate(question.slug);
    const comments = await buildComments(question.slug);
    return NextResponse.json({ ok: true, myAnswer: value, myComment: comment, aggregate, comments });
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

  // 子どもごと（「全体」も含む）に、同じ質問には1回まで。既にそのスコープでこの質問に
  // 答えている場合は上書き（回答し直し）を許可する。onConflictの対象はmember_id・
  // question_slugにchild_key（child_idのNULLをダミーUUIDに正規化したgenerated column。
  // supabase_schema.sql参照）を加えた3列の一意制約（2026-10-17、過去の質問一覧からも
  // 回答できるようにするため、answer_dateベースからquestion_slugベースに変更）。
  const { error } = await supabase
    .from('daily_answers')
    .upsert(
      {
        member_id: member.id,
        child_id: childId,
        answer_date: date,
        question_slug: question.slug,
        value,
        comment,
      },
      { onConflict: 'member_id,question_slug,child_key' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const aggregate = await buildAggregate(question.slug);
  const comments = await buildComments(question.slug);
  return NextResponse.json({ ok: true, myAnswer: value, myComment: comment, aggregate, comments });
}
