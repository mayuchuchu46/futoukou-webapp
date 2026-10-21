'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getUid } from '@/lib/uid';
import { pushLocalFavoritesToServer } from '@/lib/favoritesSync';

export default function AccountLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, uid: getUid() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    // 未ログイン時代にこの端末で保存していたお気に入り（lib/favorites.ts）を
    // 会員アカウントへ引き継ぐ（2026-10-22追加）。失敗してもログイン自体は進める。
    pushLocalFavoritesToServer();
    router.push('/account');
    router.refresh();
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">ログイン</h2>
        <form onSubmit={submit} className="card" style={{ gap: 14 }}>
          <input
            className="input"
            type="email"
            placeholder="メールアドレス"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="パスワード"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'ログイン中…' : 'ログインする'}
          </button>
          <a className="btn-ghost" href="/account/register" style={{ textAlign: 'center' }}>
            アカウントをお持ちでない方はこちら
          </a>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
