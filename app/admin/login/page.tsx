'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 360, gap: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, textAlign: 'center' }}>管理画面ログイン</div>
        <div className="muted" style={{ textAlign: 'center', fontSize: 13 }}>
          一般のテスター用パスワードとは別の、管理者専用パスワードです。
        </div>
        <input
          className="input"
          type="password"
          placeholder="管理者パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? '確認中…' : '入る'}
        </button>
      </form>
    </div>
  );
}
