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
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // パスワード欄の表示・非表示の切り替え（デフォルトは非表示＝●●●●）。
  // 確認欄を追加したぶん入力ミスに気づきにくくなるので、見えるようにする手段も
  // 合わせて用意した（2026-10-12）。
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    setLoading(true);
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="パスワード（8文字以上）"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="パスワード（確認）"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          {/* メルマガ同意は、登録フォームに並べると「あえてチェックしない＝断る」という
              構図を登録のその場で作ってしまう。積極的な同意を求める特定電子メール法の
              趣旨からは、ここで聞かずアカウントページ（NewsletterPanel）でいつでも
              任意に設定できる形の方が適切という判断で、登録フォームからは削除した
              （2026-10-12）。 */}
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
