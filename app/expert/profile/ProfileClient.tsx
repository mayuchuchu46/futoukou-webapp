'use client';

import { useState } from 'react';

type Expert = { id: string; name: string; credential: string; bio: string; photo_url: string | null };

export default function ProfileClient({ expert }: { expert: Expert }) {
  const [form, setForm] = useState({
    name: expert.name,
    credential: expert.credential,
    bio: expert.bio,
    photo_url: expert.photo_url || '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setError('');
    setSaved(false);
    const res = await fetch('/api/expert/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || '保存に失敗しました');
      return;
    }
    setSaved(true);
  }

  return (
    <div className="app-shell">
      <div className="header">
        <a className="btn-ghost" href="/expert/dashboard">← ダッシュボードへ</a>
        <div style={{ fontWeight: 700, fontSize: 16 }}>プロフィール編集</div>
      </div>
      <div className="main">
        <div className="card" style={{ gap: 12 }}>
          <div className="muted">お名前</div>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="muted">資格</div>
          <input className="input" value={form.credential} onChange={(e) => setForm({ ...form, credential: e.target.value })} />
          <div className="muted">自己紹介</div>
          <textarea className="input" rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <div className="muted">プロフィール画像URL（任意）</div>
          <input className="input" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
          {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
          {saved && <div style={{ color: 'var(--main)', fontSize: 13 }}>保存しました</div>}
          <button className="btn-primary" onClick={save}>保存する</button>
        </div>
      </div>
    </div>
  );
}
