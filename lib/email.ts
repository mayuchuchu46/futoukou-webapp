import { Resend } from 'resend';

// メール送信（2026-11-02追加）。相談リクエスト（app/api/expert/consult-request/route.ts）
// など、今後メール通知が必要になる機能向けの共通ヘルパー。Resendの無料枠（月3,000通・
// 1日100通）で足りる想定のため、SendGridではなくResendを使う。
//
// 本番環境でRESEND_API_KEY（と、送信元ドメインを認証した上でのRESEND_FROM_EMAIL）が
// 未設定の間は、このサンドボックス・開発環境と同じく「送信せずコンソールに出すだけ」
// にフォールバックする（isStripeConfiguredと同じ考え方。設定が無いせいで相談機能
// 自体が壊れてしまわないようにするため）。
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

const DEFAULT_FROM = 'どうする先生 <notify@futoko-dosuru.com>';

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    // eslint-disable-next-line no-console
    console.log('[email] RESEND_API_KEY未設定のため送信をスキップしました', { to, subject });
    return { ok: false, error: 'not configured' };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to,
      subject,
      text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown error' };
  }
}
