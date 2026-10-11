import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentExpert } from '@/lib/expertAuth';
import { isStripeConfigured } from '@/lib/stripe';
import { ensureExpertStripeAccount, createOnboardingLink } from '@/lib/stripeConnect';

// ログイン中の専門家が、報酬振込用のStripeアカウント設定（本人確認・口座情報の入力）を
// 開始・再開するためのエンドポイント。Stripeのホスト型オンボーディング画面のURLを返す。
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: '現在、振込機能の準備中のためご利用いただけません' }, { status: 503 });
  }

  const expert = await getCurrentExpert();
  if (!expert) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const origin = req.nextUrl.origin;

  try {
    const accountId = await ensureExpertStripeAccount(expert.id, expert.email, expert.stripe_account_id);
    if (accountId !== expert.stripe_account_id) {
      await supabase.from('experts').update({ stripe_account_id: accountId }).eq('id', expert.id);
    }

    const url = await createOnboardingLink(
      accountId,
      `${origin}/expert/profile`, // refresh_url：リンク切れ時はプロフィール編集に戻し、ボタンから再度やり直してもらう
      `${origin}/api/expert/stripe-connect/return`
    );
    return NextResponse.json({ ok: true, url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: 'Stripeアカウントの準備に失敗しました: ' + message }, { status: 502 });
  }
}
