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
        <h1 className="pagetitle">ログイン</h1>
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
          {/* パスワード再設定フローが一切なかったため追加（2026-11-21、
              「パスワード忘れた場合どうするんだっけ？」との指摘を受けて）。 */}
          <a href="/account/forgot-password" className="muted" style={{ fontSize: 13, textAlign: 'center', textDecoration: 'underline' }}>
            パスワードを忘れた方はこちら
          </a>
          <a className="btn-ghost" href="/account/register" style={{ textAlign: 'center' }}>
            アカウントをお持ちでない方はこちら
          </a>
          {/* ログインでつまずいている人がマイページの問い合わせ導線に辿り着けない
              問題への対応（2026-11-28）。ログイン画面は未ログインでも必ず開けるため、
              ここに小さく問い合わせ先を置く。 */}
          <a
            href="mailto:mail.manapri@gmail.com?subject=%E3%81%A9%E3%81%86%E3%81%99%E3%82%8B%E5%85%88%E7%94%9F%EF%BC%9A%E4%B8%8D%E5%85%B7%E5%90%88%E3%83%BB%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B"
            className="muted"
            style={{ fontSize: 12, textAlign: 'center', textDecoration: 'underline' }}
          >
            うまくいかない場合はこちら
          </a>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
