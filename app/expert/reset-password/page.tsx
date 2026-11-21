'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 専門家・経験者向けパスワード再設定ページ（2026-11-21追加）。メール内のリンク
// （/expert/reset-password?token=...）から開く。useSearchParams()を使うため
// Suspenseで囲む（app/account/reset-password/page.tsxと同じ理由）。
export default function ExpertResetPasswordPage() {
  return (
    <div className="login-wrap">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('パスワードが一致しません');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/expert/reset-password', {
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
      <div className="card" style={{ width: '100%', maxWidth: 360, gap: 14 }}>
        <div className="qtext" style={{ fontSize: 13 }}>
          リンクが正しくないか、有効期限が切れています。もう一度パスワード再設定をお申し込みください。
        </div>
        <a className="btn-ghost" href="/expert/forgot-password" style={{ alignSelf: 'flex-start' }}>
          パスワードを忘れた方はこちら
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 360, gap: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>新しいパスワードを設定</div>
      <input
        className="input"
        type="password"
        placeholder="新しいパスワード（8文字以上）"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        className="input"
        type="password"
        placeholder="新しいパスワード（確認）"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        required
      />
      {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? '設定中…' : 'パスワードを設定する'}
      </button>
    </form>
  );
}
