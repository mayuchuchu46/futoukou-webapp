import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { EXPERT_PRICE_JPY, EXPERT_VOLUNTEER_MODE, SENPAI_CREDENTIAL } from '@/lib/config';
import { checkExpertRequestRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';
import { resolveExpertFunding } from '@/lib/expertQuota';

// 専門家への質問は、読み放題会員（月¥800のサブスク）限定（2026-10-10 決定）。
// 財源は「月1回無料（会員特典）→チケット消費→都度¥600」の優先順位で決める
// （2026-10-11 価格体系見直し。lib/expertQuota.ts参照）。無料枠・チケット消費の場合は
// Stripe決済なしでその場で相談を確定させ、都度払いの場合だけ従来通りStripeへ進む。
//
// EXPERT_VOLUNTEER_MODE（lib/config.ts、2026-10-31追加）がtrueの間は、決済代行会社の
// 乗り換え作業中につき、会員登録・決済を一切要求せず、誰でも無料で質問できる
// （財源はexpert_funding: 'volunteer'として記録。専門家側の報酬記録は通常どおり残る）。
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!EXPERT_VOLUNTEER_MODE && (!member || !isSubscriptionActive(member))) {
    return NextResponse.json(
      { error: '専門家への質問は、読み放題会員の登録が必要です', needsMembership: true },
      { status: 403 }
    );
  }

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
  let requestedExpertId: string | null = null;
  if (requested_expert_id) {
    let expertQuery = supabase
      .from('experts')
      .select('id')
      .eq('id', requested_expert_id)
      .eq('verified', true);
    // 先輩保護者（経験者）は通常運用中はこの専門家向け質問（¥600・専門家報酬¥400
    // という価格体系／報酬記録）の対象外（2026-10-31追加。URLを直接編集して指名
    // されてしまうのを防ぐ）。EXPERT_VOLUNTEER_MODE中は金銭のやり取りが発生しない
    // ため、先輩保護者プロフィールページ（/senpai/[id]）からの指名を許可する。
    if (!EXPERT_VOLUNTEER_MODE) {
      expertQuery = expertQuery.neq('credential', SENPAI_CREDENTIAL);
    }
    const { data: expertRow } = await expertQuery.single();
    requestedExpertId = expertRow?.id || null;
  }

  // 子どもプロフィール（2026-10-16追加）。/api/consultと同じく、ログイン中の
  // 会員自身の子どもであることを確認してから紐付ける。EXPERT_VOLUNTEER_MODE中は
  // 会員登録なしでも質問できるため、memberがnullの場合はそもそも紐付けない。
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

  // ボランティア期間中は会員状態にかかわらず一律'volunteer'扱いにする
  // （既に会員の人が利用した場合も、通常の財源消費は行わない＝会員特典を減らさない）。
  const funding = EXPERT_VOLUNTEER_MODE ? 'volunteer' : resolveExpertFunding(member);

  if (funding === 'free_monthly' || funding === 'ticket' || funding === 'volunteer') {
    // Stripe決済を挟まず、その場で相談を確定させる（paid: true）。
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
        expert_funding: funding,
      })
      .select('id')
      .single();

    if (insertErr || !row) {
      return NextResponse.json({ error: insertErr?.message || '相談の登録に失敗しました' }, { status: 500 });
    }

    // 相談の登録が成功した後にだけ、無料枠／チケットを消費する
    // （先に消費すると、登録失敗時に枠だけ無駄に失われてしまうため）。
    // 'volunteer'（ボランティア期間中）は会員特典を一切消費しない。
    if (funding === 'free_monthly' && member) {
      await supabase
        .from('members')
        .update({ last_free_expert_question_period_end: member.subscription_current_period_end })
        .eq('id', member.id);
    } else if (funding === 'ticket' && member) {
      await supabase
        .from('members')
        .update({ expert_credits: Math.max(0, member.expert_credits - 1) })
        .eq('id', member.id);
    }

    return NextResponse.json({ ok: true, funded: true, funding, consultation_id: row.id });
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
      price_jpy: EXPERT_PRICE_JPY,
      paid: false,
      expert_status: 'pending',
      requested_expert_id: requestedExpertId,
      expert_funding: 'paid',
    })
    .select('id')
    .single();

  if (insertErr || !row) {
    return NextResponse.json({ error: insertErr?.message || '相談の登録に失敗しました' }, { status: 500 });
  }

  const origin = req.nextUrl.origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: { name: '専門家への相談（どうする先生）' },
            unit_amount: EXPERT_PRICE_JPY,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/result/${row.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ask`,
      metadata: { consultation_id: row.id },
    });

    await supabase.from('consultations').update({ stripe_session_id: session.id }).eq('id', row.id);

    return NextResponse.json({ ok: true, funded: false, url: session.url, consultation_id: row.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: '決済の準備に失敗しました: ' + message }, { status: 502 });
  }
}
