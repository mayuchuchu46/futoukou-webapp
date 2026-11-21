import crypto from 'crypto';

// パスワード再設定トークンまわりの共通処理（2026-11-21追加）。
// members・experts両方のforgot-password/reset-password APIで使う。

// 1時間だけ有効なトークンにする（長すぎるとメールを他人に見られた場合のリスクが
// 増え、短すぎるとメールを確認するまでに切れてしまうため、よくある折衷値）。
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function resetTokenExpiresAt(): string {
  return new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
}
