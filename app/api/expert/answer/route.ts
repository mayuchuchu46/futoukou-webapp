import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { expertPayout } from '@/lib/config';

const MIN_ANSWER_LENGTH = 150;

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
    .select('id, request_type, paid, expert_status, price_jpy')
    .eq('id', consultation_id)
    .single();

  if (!row || row.request_type !== 'expert' || !row.paid) {
    return NextResponse.json({ error: 'この相談には回答できません' }, { status: 400 });
  }
  if (row.expert_status === 'answered') {
    return NextResponse.json({ error: 'この相談には既に回答済みです' }, { status: 409 });
  }

  const payout = expertPayout(row.price_jpy || 0);

  const { error } = await supabase
    .from('consultations')
    .update({
      answer: answer.trim(),
      expert_answer: answer.trim(),
      expert_status: 'answered',
      expert_id: expert.id,
      expert_payout_jpy: payout,
    })
    .eq('id', consultation_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
