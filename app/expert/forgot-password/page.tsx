'use client';

import { useState } from 'react';

// 専門家・経験者向け「パスワードを忘れた方」ページ（2026-11-21追加）。
// app/account/forgot-password と同じ考え方。
export default function ExpertForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/expert/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="login-wrap">
      <div className="card" style={{ width: '100%', maxWidth: 360, gap: 14 }}>
        <a className="btn-ghost" href="/" style={{ alignSelf: 'flex-start' }}>← トップへ</a>
        <div style={{ fontWeight: 700, fontSize: 18 }}>パスワードを忘れた方</div>
        {sent ? (
          <>
            <div className="qtext" style={{ fontSize: 13 }}>
              ご入力いただいたメールアドレス宛に、パスワード再設定用のメールをお送りしました（登録がない場合は届きません）。メール内のリンクから新しいパスワードを設定してください。
            </div>
            <a className="btn-ghost" href="/expert/login" style={{ textAlign: 'center' }}>
              ログインページへ戻る
            </a>
          </>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="qtext" style={{ fontSize: 13 }}>
              ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
            </div>
            <input
              className="input"
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? '送信中…' : '再設定メールを送る'}
            </button>
            <a className="btn-ghost" href="/expert/login" style={{ textAlign: 'center' }}>
              ログインページへ戻る
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
