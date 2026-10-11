import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

// 専門家への報酬の一括振込（半自動）。
// 未振込（payout_status: 'unpaid'）の回答を専門家ごとに集計し、Stripeの振込先
// アカウント設定（stripe_account_id・stripe_payouts_enabled）が完了している専門家にだけ
// Stripe Connect経由で送金（Transfer）する。未設定の専門家の分はスキップし、結果に表示する
// （設定が完了すれば次回の一括振込で自動的に対象になる）。
// 運営がこのボタンを押した時だけ実行される（スケジューラ等による完全自動実行ではない）。
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '管理者ログインが必要です' }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: '決済機能が未設定です（STRIPE_SECRET_KEY）' }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();

  const { data: rows, error: fetchError } = await supabase
    .from('consultations')
    .select('id, expert_id, expert_payout_jpy, experts!expert_id(id, name, credential, stripe_account_id, stripe_payouts_enabled)')
    .eq('payout_status', 'unpaid')
    .eq('expert_status', 'answered')
    .not('expert_id', 'is', null)
    .gt('expert_payout_jpy', 0);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: true, paid: [], skipped: [], errors: [] });
  }

  type Row = {
    id: string;
    expert_id: string;
    expert_payout_jpy: number;
    experts: { id: string; name: string; credential: string; stripe_account_id: string | null; stripe_payouts_enabled: boolean } | { id: string; name: string; credential: string; stripe_account_id: string | null; stripe_payouts_enabled: boolean }[] | null;
  };

  // 専門家ごとにグループ化する。
  const groups = new Map<string, { expertName: string; accountId: string | null; payoutsEnabled: boolean; ids: string[]; total: number }>();
  for (const raw of rows as Row[]) {
    const expertInfo = Array.isArray(raw.experts) ? raw.experts[0] || null : raw.experts;
    if (!expertInfo) continue;
    const key = raw.expert_id;
    const g = groups.get(key) || {
      expertName: `${expertInfo.credential}・${expertInfo.name}`,
      accountId: expertInfo.stripe_account_id,
      payoutsEnabled: expertInfo.stripe_payouts_enabled,
      ids: [],
      total: 0,
    };
    g.ids.push(raw.id);
    g.total += raw.expert_payout_jpy || 0;
    groups.set(key, g);
  }

  const stripe = getStripe();
  const today = new Date().toISOString().slice(0, 10);
  const paid: { expertName: string; amount: number; count: number }[] = [];
  const skipped: { expertName: string; amount: number; count: number; reason: string }[] = [];
  const errors: { expertName: string; message: string }[] = [];

  for (const [expertId, g] of groups) {
    if (!g.accountId || !g.payoutsEnabled) {
      skipped.push({
        expertName: g.expertName,
        amount: g.total,
        count: g.ids.length,
        reason: g.accountId ? 'Stripeアカウントの設定が未完了' : 'Stripeアカウント未登録',
      });
      continue;
    }

    try {
      // JPYはStripeでは最小単位がそのまま円（小数点なし）。
      const transfer = await stripe.transfers.create(
        {
          amount: g.total,
          currency: 'jpy',
          destination: g.accountId,
          description: `どうする先生 報酬振込（${g.ids.length}件・${today}）`,
        },
        { idempotencyKey: `payout-${expertId}-${today}` }
      );

      // 送金に成功した対象だけを確実にpaidへ更新する（まだunpaidのままの行のみ対象にし、
      // 二重クリック等で既に別経路でpaidになっていた行を誤って上書きしないようにする）。
      await supabase
        .from('consultations')
        .update({ payout_status: 'paid', stripe_transfer_id: transfer.id, paid_at: new Date().toISOString() })
        .in('id', g.ids)
        .eq('payout_status', 'unpaid');

      paid.push({ expertName: g.expertName, amount: g.total, count: g.ids.length });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown error';
      errors.push({ expertName: g.expertName, message });
    }
  }

  return NextResponse.json({ ok: true, paid, skipped, errors });
}
