import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { expertPayout } from '@/lib/config';

const MIN_ANSWER_LENGTH = 200;

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
  if (answer.trim().length < MIN_ANSWER_LENGTH) {
    return NextResponse.json(
      { error: `回答は${MIN_ANSWER_LENGTH}文字以上でお願いします。具体的な「次の一手」を含めてください。` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from('consultations')
    .select('id, request_type, paid, expert_status, price_jpy, expert_funding')
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
  // 常にAIの回答を保持する列として扱うことにした。専門家・先輩保護者の回答は
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
  return NextResponse.json({ ok: true });
}
