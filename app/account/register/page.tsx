'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 相談ページ（/result/[id]）からの「無料で登録する」経由で来た場合、
  // 登録完了後にそのページへ戻す。next は相対パス（"/"始まり）の場合のみ使う
  // （外部URLへのオープンリダイレクトを避けるため）。
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/account';
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">アカウント登録</h2>
        <div className="muted" style={{ marginBottom: 4 }}>
          メールアドレスとパスワードでアカウントを作成します。
        </div>
        <form onSubmit={submit} className="card" style={{ gap: 14 }}>
          <input
            className="input"
            placeholder="お名前（任意）"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
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
            placeholder="パスワード（8文字以上）"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? '登録中…' : '登録する'}
          </button>
          <a className="btn-ghost" href="/account/login" style={{ textAlign: 'center' }}>
            すでにアカウントをお持ちの方はこちら
          </a>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}

export default function AccountRegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
