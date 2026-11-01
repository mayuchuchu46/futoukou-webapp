import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { checkExpertRequestRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';

// 2026-11-01、専門家・先輩保護者への質問を恒久的に無料化した（従来の「読み放題会員限定・
// 月1回無料→チケット→都度¥600」という価格体系、および専門家側への¥400報酬は廃止）。
// 新しいモデル：
//   質問する　→　誰でも無料（会員登録・決済不要）
//   専門家・先輩保護者が回答する　→　報酬なし（自分のプロフィールへの誘導＝宣伝が対価）
//   回答を見る　→　会員登録が必要（読み放題会員。将来的に有料化）
// つまりこのエンドポイントは「質問を無料で登録するだけ」になり、Stripe決済・
// チケット消費・無料枠消費のロジックは不要になった（旧ロジックはlib/expertQuota.ts、
// 旧チケット購入はapp/account/TicketsPanel.tsx等に残っているが、どこからも呼ばれない）。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();

  const { category, text, author_id, grade, gender, requested_expert_id, child_id } = await req.json();
  if (!category || !text || !text.trim() || !author_id) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const ip = getClientIp(req);
  const limit = await checkExpertRequestRateLimit(author_id, ip);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();

  // 専門家一覧から指名された場合、なりすましの指名（本人確認未完了の専門家IDを
  // 渡す等）を避けるため、本人確認済みの専門家であることをここで確認してから保存する。
  // 質問・回答が恒久的に無料になったことで、専門家・先輩保護者を区別する必要はなくなった
  // （以前は先輩保護者を専門家向け有料キューの対象外にしていたが、その価格差自体がない）。
  let requestedExpertId: string | null = null;
  if (requested_expert_id) {
    const { data: expertRow } = await supabase
      .from('experts')
      .select('id')
      .eq('id', requested_expert_id)
      .eq('verified', true)
      .single();
    requestedExpertId = expertRow?.id || null;
  }

  // 子どもプロフィール（2026-10-16追加）。/api/consultと同じく、ログイン中の
  // 会員自身の子どもであることを確認してから紐付ける。質問は会員登録なしでもできるため、
  // memberがnullの場合はそもそも紐付けない。
  let childId: string | null = null;
  if (child_id && member) {
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('member_id', member.id)
      .single();
    if (child) childId = child.id;
  }

  const { data: row, error: insertErr } = await supabase
    .from('consultations')
    .insert({
      category,
      question: text.trim(),
      answer: '',
      grade: grade || null,
      gender: gender || null,
      author_id,
      child_id: childId,
      client_ip: ip,
      request_type: 'expert',
      price_jpy: 0,
      paid: true,
      expert_status: 'pending',
      requested_expert_id: requestedExpertId,
      expert_funding: 'volunteer',
    })
    .select('id')
    .single();

  if (insertErr || !row) {
    return NextResponse.json({ error: insertErr?.message || '相談の登録に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, funded: true, funding: 'volunteer', consultation_id: row.id });
}
