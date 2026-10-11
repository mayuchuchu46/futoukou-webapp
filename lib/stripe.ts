import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY が設定されていません');
  return new Stripe(key);
}

// Stripeの本番キーがまだ設定されていない間、決済が絡む画面（会員登録・チケット購入・
// 専門家への都度払い相談）はボタンを押せない「準備中」表示にする。キーを設定すれば、
// ここの判定が自動的にtrueになり、各画面の表示も切り替わる（個別のコード変更は不要）。
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
