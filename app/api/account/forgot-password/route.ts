import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { generateResetToken, resetTokenExpiresAt } from '@/lib/passwordReset';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// 会員（保護者）向けパスワード再設定の1通目：メールアドレスを受け取り、
// 該当する会員がいれば再設定リンクをメール送信する（2026-11-21追加）。
// メールアドレスの存在有無で応答を変えると「このメールは登録されていない」
// ことが分かってしまう（登録メールアドレスの総当たり調査に使われうる）ため、
// 該当有無に関わらず常に同じ成功レスポンスを返す。
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'メールアドレスを入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: member } = await supabase
    .from('members')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  if (member) {
    const token = generateResetToken();
    const expiresAt = resetTokenExpiresAt();
    await supabase
      .from('members')
      .update({ reset_token: token, reset_token_expires_at: expiresAt })
      .eq('id', member.id);

    await sendEmail({
      to: member.email,
      subject: `【${SITE_NAME}】パスワード再設定のご案内`,
      text: `${SITE_NAME}のパスワード再設定のリクエストを受け付けました。

以下のリンクから新しいパスワードを設定してください（1時間だけ有効です）。
${SITE_URL}/account/reset-password?token=${token}

このメールにお心当たりがない場合は、何もせずこのメールを破棄してください。パスワードは変更されません。

${SITE_NAME}
${SITE_URL}`,
    });
  }

  return NextResponse.json({ ok: true });
}
