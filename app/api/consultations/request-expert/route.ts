import { NextRequest, NextResponse, after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { checkExpertRequestRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';
import { notifyExpertsOfNewPending } from '@/lib/expertNotify';

// 「専門家・経験者にこの質問を見てもらう」ボタン用（2026-11-07追加）。
// 以前は、既にAIの回答を見た後で専門家・経験者にも見てもらいたくなった場合、
// 新しい質問として/askにもう一度書き直す必要しかなかった（「また相談しないと
// いけないの？という印象を与えそう」との指摘を受けて追加）。
// /api/consult（新規相談の作成時にwant_expertを付ける）と同じ扱いに
// なるよう、既存のconsultation行をワンクリックでrequest_type='expert'・
// expert_status='pending'に更新するだけのエンドポイント。
export async function POST(req: NextRequest) {
  const { id, author_id } = await req.json();
  if (!id || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error: fetchErr } = await supabase
    .from('consultations')
    .select('id, question, author_id, member_id, request_type, crisis_detected, refunded')
    .eq('id', id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: '見つかりませんでした' }, { status: 404 });
  }

  const member = await getCurrentMember();
  const isOwnerByAuthor = row.author_id === author_id;
  const isOwnerByMember = !!member && row.member_id === member.id;
  if (!isOwnerByAuthor && !isOwnerByMember) {
    return NextResponse.json({ error: 'この相談を専門家・経験者に送る権限がありません' }, { status: 403 });
  }

  if (row.refunded) {
    return NextResponse.json({ error: 'この相談は現在ご利用いただけません' }, { status: 400 });
  }
  if (row.request_type === 'expert') {
    // 既に送信済み。二重送信はエラーにせず、成功として扱う（ボタン連打対策）。
    return NextResponse.json({ ok: true, alreadyRequested: true });
  }
  // 希死念慮・自傷等の安全上書きが出た相談は、/api/consultと同じ理由で
  // 専門家・経験者向けの回答待ちキューには乗せない。
  if (row.crisis_detected) {
    return NextResponse.json({ error: 'この相談は専門家・経験者への送信対象ではありません' }, { status: 400 });
  }

  const ip = getClientIp(req);
  const limit = await checkExpertRequestRateLimit(author_id, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const { error: updateErr } = await supabase
    .from('consultations')
    .update({
      request_type: 'expert',
      expert_status: 'pending',
      paid: true,
      price_jpy: 0,
      expert_funding: 'volunteer',
    })
    .eq('id', id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  after(() => notifyExpertsOfNewPending(row.question));

  return NextResponse.json({ ok: true });
}
