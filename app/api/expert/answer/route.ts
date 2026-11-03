import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { expertPayout } from '@/lib/config';
import { sendEmail } from '@/lib/email';
import { expertDisplayName, answererName } from '@/lib/expertDisplay';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export async function POST(req: NextRequest) {
  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }
  if (!expert.verified) {
    return NextResponse.json({ error: '本人確認が完了していないため、回答できません' }, { status: 403 });
  }

  const { consultation_id, answer } = await req.json();
  if (!consultation_id || !answer || !answer.trim()) {
    return NextResponse.json({ error: '回答を入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from('consultations')
    .select('id, request_type, paid, expert_status, price_jpy, expert_funding, member_id, question')
    .eq('id', consultation_id)
    .single();

  if (!row || row.request_type !== 'expert' || !row.paid) {
    return NextResponse.json({ error: 'この相談には回答できません' }, { status: 400 });
  }
  if (row.expert_status === 'answered') {
    return NextResponse.json({ error: 'この相談には既に回答済みです' }, { status: 409 });
  }

  // ボランティア期間中（expert_funding: 'volunteer'）の相談は金銭のやり取りが
  // 発生しないため、報酬額は記録しない（2026-11-01、/expert/earningsに
  // 実際には支払われない¥400が「累計報酬額」として表示されてしまっていた不具合を修正）。
  const payout = row.expert_funding === 'volunteer' ? 0 : expertPayout(row.price_jpy || 0);

  // 2026-11-01、専門家への質問をAI回答つきの相談に統合したのに伴い、`answer`列は
  // 常にAIの回答を保持する列として扱うことにした。専門家・経験者の回答は
  // `expert_answer`列にだけ書き込む（以前はここで`answer`も同じ文面で上書きしていたが、
  // それだとAIの回答が専門家の回答で消えてしまう）。
  const { error } = await supabase
    .from('consultations')
    .update({
      expert_answer: answer.trim(),
      expert_status: 'answered',
      expert_id: expert.id,
      expert_payout_jpy: payout,
    })
    .eq('id', consultation_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 質問者への回答通知メール（2026-11-03追加）。「回答がついたことに気づかれず、
  // 会員登録（ロック解除）につながらない」との指摘を受けて追加。投稿時にログイン
  // していた会員（member_id）にのみ送れる。匿名投稿の場合は宛先が無いため送れない。
  // 送信に失敗しても、回答自体は保存済みなのでAPIとしては成功を返す。
  if (row.member_id) {
    const { data: member } = await supabase
      .from('members')
      .select('email')
      .eq('id', row.member_id)
      .single();
    if (member?.email) {
      const role = answererName(expert.credential);
      const name = expertDisplayName(expert);
      await sendEmail({
        to: member.email,
        subject: `【${SITE_NAME}】あなたの相談に${role}から回答が届きました`,
        text: `${SITE_NAME}に投稿いただいた相談に、${name}さん（${role}）から回答が届きました。

相談内容：
${row.question.length > 60 ? `${row.question.slice(0, 60)}…` : row.question}

回答を読む（読み放題会員登録が必要です）：
${SITE_URL}/result/${row.id}

${SITE_NAME}
${SITE_URL}`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
