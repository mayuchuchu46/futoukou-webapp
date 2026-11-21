'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// 会員向け「パスワードを忘れた方」ページ（2026-11-21追加）。送信後は、
// 入力されたメールアドレスが実際に登録されているかどうかに関わらず同じ
// メッセージを出す（app/api/account/forgot-password側の設計と合わせて、
// 登録済みメールアドレスの有無が外から分からないようにするため）。
export default function AccountForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/account/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h1 className="pagetitle">パスワードを忘れた方</h1>
        {sent ? (
          <div className="card" style={{ gap: 10 }}>
            <div className="qtext">
              ご入力いただいたメールアドレス宛に、パスワード再設定用のメールをお送りしました（登録がない場合は届きません）。メール内のリンクから新しいパスワードを設定してください。
            </div>
            <a className="btn-ghost" href="/account/login" style={{ textAlign: 'center' }}>
              ログインページへ戻る
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="card" style={{ gap: 14 }}>
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
            <a className="btn-ghost" href="/account/login" style={{ textAlign: 'center' }}>
              ログインページへ戻る
            </a>
          </form>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
