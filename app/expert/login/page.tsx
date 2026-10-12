'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpertLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/expert/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    router.push('/expert/dashboard');
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 360, gap: 14 }}>
        {/* 専門家ログイン周りのページには戻る手段が無かったため追加
            （2026-10-12）。login-wrapはHeaderを使わない単体レイアウトなので、
            カード内に明示的なリンクを置く。 */}
        <a className="btn-ghost" href="/" style={{ alignSelf: 'flex-start' }}>← トップへ</a>
        <div style={{ fontWeight: 700, fontSize: 18 }}>専門家ログイン</div>
        <input className="input" type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? '確認中…' : 'ログイン'}</button>
        <a className="btn-ghost" href="/expert/register" style={{ textAlign: 'center' }}>新規登録はこちら</a>
      </form>
    </div>
  );
}
