import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { expertDisplayName, answererName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// 専門家・経験者への「回答待ちの質問があります」週次ダイジェスト（2026-11-03追加）。
//
// 【きっかけ】
// 質問への回答は、本人確認済みの専門家・経験者が任意で拾う完全なボランティア制の
// ため、「答えてもらえる保証」が無い。加えて、新しい質問が溜まったことを知らせる
// 通知が一切無く、本人が自発的にアカウントページを見に行かない限り、質問が
// 溜まっていることにすら気づけない状態だった。「会員からの質問に返事してくれるか
// わからない」という懸念を受けて、気づくきっかけを作るために追加。
//
// 【対象】
// 本人確認済み（verified: true）かつメールアドレスが分かる専門家・経験者**全員**。
// 回答待ちの質問は指名制ではなく共有キュー（誰でも拾える）のため、特定の誰かに
// 割り振らず、全員に同じ「いま◯件溜まっています」という内容を送る。
//
// 【頻度】
// 週1回（vercel.jsonでスケジュール）。日次だと頻度が高すぎて煩わしくなる可能性が
// あるための判断。溜まっている件数が0件の場合はメール自体を送らない（全員に
// 空振りの通知を送らないようにするため）。
//
// 【認証】
// 他のcronと同様、CRON_SECRETで認証する。
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // 共有キューの件数（指名制ではないため、誰が見ても同じ件数）。
  const { count: pendingCount } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('request_type', 'expert')
    .eq('paid', true)
    .eq('expert_status', 'pending');

  if (!pendingCount || pendingCount === 0) {
    return NextResponse.json({ ok: true, pendingCount: 0, sent: 0, skipped: 'no pending questions' });
  }

  const { data: experts } = await supabase
    .from('experts')
    .select('id, email, name, display_name, credential')
    .eq('verified', true);

  if (!experts || experts.length === 0) {
    return NextResponse.json({ ok: true, pendingCount, sent: 0, skipped: 'no verified experts' });
  }

  let sent = 0;
  for (const expert of experts) {
    if (!expert.email) continue;
    const role = answererName(expert.credential);
    const name = expertDisplayName(expert);
    const result = await sendEmail({
      to: expert.email,
      subject: `【${SITE_NAME}】回答待ちの相談が${pendingCount}件あります`,
      text: `${name}さん

${SITE_NAME}に、${role}からの回答を待っている相談が現在${pendingCount}件あります。

答えたい質問だけで構いません。アカウントページから内容を確認・回答できます：
${SITE_URL}/account

このメールは週に1回、回答待ちの相談がある場合のみお送りしています。

${SITE_NAME}
${SITE_URL}`,
    });
    if (result.ok) sent += 1;
  }

  return NextResponse.json({ ok: true, pendingCount, expertCount: experts.length, sent });
}
