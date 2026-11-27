'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ExpertLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    router.push('/account');
  }

  return (
    <div className="login-wrap">
      {/* どのページか分かりづらいとの指摘を受けて、login-wrap系ページ共通で
          ワードマークロゴを追加（2026-11-28）。 */}
      <Image
        src="/assets/wordmark_logo.png"
        alt="どうする先生"
        width={220}
        height={58}
        style={{ height: 32, width: 'auto', alignSelf: 'center', marginBottom: -4 }}
      />
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 360, gap: 14 }}>
        {/* 専門家ログイン周りのページには戻る手段が無かったため追加
            （2026-10-12）。login-wrapはHeaderを使わない単体レイアウトなので、
            カード内に明示的なリンクを置く。 */}
        <a className="btn-ghost" href="/" style={{ alignSelf: 'flex-start' }}>← トップへ</a>
        <div style={{ fontWeight: 700, fontSize: 18 }}>専門家ログイン</div>
        <input className="input" type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="muted"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {showPassword ? '隠す' : '表示'}
          </button>
        </div>
        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? '確認中…' : 'ログイン'}</button>
        {/* パスワード再設定フローが一切なかったため追加（2026-11-21、
            「パスワード忘れた場合どうするんだっけ？」との指摘を受けて）。 */}
        <a href="/expert/forgot-password" className="muted" style={{ fontSize: 13, textAlign: 'center', textDecoration: 'underline' }}>
          パスワードを忘れた方はこちら
        </a>
        <a className="btn-ghost" href="/expert/register" style={{ textAlign: 'center' }}>新規登録はこちら</a>
      </form>
    </div>
  );
}
