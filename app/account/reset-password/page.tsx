'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// 会員向けパスワード再設定ページ（2026-11-21追加）。メール内のリンク
// （/account/reset-password?token=...）から開く。
// useSearchParams()はレンダリング時点でしか値が確定しないため、
// app/ask/page.tsxと同じ理由でSuspenseで囲む（ヘッダー等の外枠は外側に出す）。
export default function AccountResetPasswordPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <BottomNav />
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('パスワードが一致しません');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/account/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    router.push('/account');
    router.refresh();
  }

  if (!token) {
    return (
      <div className="card">
        <div className="qtext">
          リンクが正しくないか、有効期限が切れています。もう一度パスワード再設定をお申し込みください。
        </div>
        <a className="btn-ghost" href="/account/forgot-password" style={{ alignSelf: 'flex-start' }}>
          パスワードを忘れた方はこちら
        </a>
        <a
          href="mailto:mail.manapri@gmail.com?subject=%E3%81%A9%E3%81%86%E3%81%99%E3%82%8B%E5%85%88%E7%94%9F%EF%BC%9A%E4%B8%8D%E5%85%B7%E5%90%88%E3%83%BB%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B"
          className="muted"
          style={{ fontSize: 12, textDecoration: 'underline' }}
        >
          うまくいかない場合はこちら
        </a>
      </div>
    );
  }

  return (
    <>
      <h1 className="pagetitle">新しいパスワードを設定</h1>
      <form onSubmit={submit} className="card" style={{ gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            placeholder="新しいパスワード（8文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', paddingRight: 56 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 4,
            }}
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showPassword ? '隠す' : '表示'}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            placeholder="新しいパスワード（確認）"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            style={{ width: '100%', paddingRight: 56 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 4,
            }}
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showPassword ? '隠す' : '表示'}
          </button>
        </div>
        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? '設定中…' : 'パスワードを設定する'}
        </button>
      </form>
    </>
  );
}
