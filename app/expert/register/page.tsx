'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpertRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', name: '', credential: '公認心理師', bio: '', license_number: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/expert/register', {
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
    router.push('/expert/dashboard');
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 420, gap: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>専門家登録</div>
        <div className="muted">「どうする先生」で有料相談に回答する専門家としてのプロフィールを作成します。</div>

        <input className="input" placeholder="お名前" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="資格（例：公認心理師、臨床心理士など）" value={form.credential} onChange={(e) => setForm({ ...form, credential: e.target.value })} />
        <textarea className="input" rows={4} placeholder="自己紹介（経歴・専門分野など）" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <input
          className="input"
          placeholder="資格の登録番号（公認心理師登録番号など）"
          value={form.license_number}
          onChange={(e) => setForm({ ...form, license_number: e.target.value })}
          required
        />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          本人確認のため運営が確認します。確認が完了するまで、有料相談への回答はできません。
        </div>
        <input className="input" type="email" placeholder="メールアドレス" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="パスワード（8文字以上）" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? '登録中…' : '登録する'}</button>
        <a className="btn-ghost" href="/expert/login" style={{ textAlign: 'center' }}>すでに登録済みの方はこちら</a>
      </form>
    </div>
  );
}
