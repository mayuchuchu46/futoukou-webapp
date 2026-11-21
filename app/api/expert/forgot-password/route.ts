import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { generateResetToken, resetTokenExpiresAt } from '@/lib/passwordReset';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// 専門家・経験者向けパスワード再設定の1通目。app/api/account/forgot-password と
// 同じ考え方（2026-11-21追加）。メールアドレスの存在有無に関わらず常に同じ
// 成功レスポンスを返す。
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'メールアドレスを入力してください' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: expert } = await supabase
    .from('experts')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  if (expert) {
    const token = generateResetToken();
    const expiresAt = resetTokenExpiresAt();
    await supabase
      .from('experts')
      .update({ reset_token: token, reset_token_expires_at: expiresAt })
      .eq('id', expert.id);

    await sendEmail({
      to: expert.email,
      subject: `【${SITE_NAME}】パスワード再設定のご案内`,
      text: `${SITE_NAME}（専門家・経験者アカウント）のパスワード再設定のリクエストを受け付けました。

以下のリンクから新しいパスワードを設定してください（1時間だけ有効です）。
${SITE_URL}/expert/reset-password?token=${token}

このメールにお心当たりがない場合は、何もせずこのメールを破棄してください。パスワードは変更されません。

${SITE_NAME}
${SITE_URL}`,
    });
  }

  return NextResponse.json({ ok: true });
}
