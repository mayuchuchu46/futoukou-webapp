'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, next: params.get('next') || '/' }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    router.push(data.next);
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 360, gap: 16 }}>
        <img src="/assets/wordmark_logo.png" alt="どうする先生" style={{ height: 32, width: 'auto', alignSelf: 'center' }} />
        <div className="muted" style={{ textAlign: 'center', fontSize: 13 }}>
          このアプリは関係者限定の試験公開中です。<br />パスワードを入力してください。
        </div>
        <input
          className="input"
          type="password"
          placeholder="パスワード"
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
