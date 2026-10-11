'use client';

import { useState } from 'react';

type Expert = {
  id: string;
  name: string;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url?: string | null;
  license_doc_path?: string | null;
  verified?: boolean;
};

export default function ProfileClient({ expert }: { expert: Expert }) {
  const [form, setForm] = useState({
    name: expert.name,
    credential: expert.credential,
    bio: expert.bio,
    link_url: expert.link_url || '',
  });
  const [photoUrl, setPhotoUrl] = useState(expert.photo_url || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [docSubmitted, setDocSubmitted] = useState(!!expert.license_doc_path);
  const [docVerified, setDocVerified] = useState(!!expert.verified);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docSaved, setDocSaved] = useState(false);

  async function uploadPhoto() {
    if (!photoFile) return;
    setPhotoUploading(true);
    setPhotoError('');
    const body = new FormData();
    body.set('photo', photoFile);
    const res = await fetch('/api/expert/photo', { method: 'POST', body });
    const data = await res.json();
    setPhotoUploading(false);
    if (!res.ok) {
      setPhotoError(data.error || 'アップロードに失敗しました');
      return;
    }
    setPhotoUrl(data.photo_url);
    setPhotoFile(null);
  }

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

  async function uploadLicenseDoc() {
    if (!licenseDoc) return;
    setDocUploading(true);
    setDocError('');
    setDocSaved(false);
    const body = new FormData();
    body.set('license_doc', licenseDoc);
    const res = await fetch('/api/expert/license-doc', { method: 'POST', body });
    const data = await res.json();
    setDocUploading(false);
    if (!res.ok) {
      setDocError(data.error || 'アップロードに失敗しました');
      return;
    }
    setDocSubmitted(true);
    setDocVerified(false);
    setLicenseDoc(null);
    setDocSaved(true);
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
          <div className="muted">ご自身のサービス・サイトなどへのリンク（任意）</div>
          <input
            className="input"
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            placeholder="https://..."
          />
          <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
            専門家一覧などに公開表示されます。
          </div>
          {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
          {saved && <div style={{ color: 'var(--main)', fontSize: 13 }}>保存しました</div>}
          <button className="btn-primary" onClick={save}>保存する</button>
        </div>

        <div className="card" style={{ gap: 12 }}>
          <div style={{ fontWeight: 700 }}>プロフィール写真（アイコン）</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={photoUrl || '/assets/sensei_logo.png'}
              alt=""
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <input
              className="input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
          </div>
          {photoError && <div style={{ color: '#C0392B', fontSize: 13 }}>{photoError}</div>}
          <button className="btn-secondary" onClick={uploadPhoto} disabled={!photoFile || photoUploading}>
            {photoUploading ? 'アップロード中…' : '写真をアップロードする'}
          </button>
        </div>

        <div className="card" style={{ gap: 12 }}>
          <div style={{ fontWeight: 700 }}>登録証（本人確認用）</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {docSubmitted
              ? docVerified
                ? '提出済み・運営確認済みです。'
                : '提出済みです。運営の確認をお待ちください。'
              : '未提出です。登録証（画像またはPDF）を提出してください。'}
          </div>
          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={(e) => setLicenseDoc(e.target.files?.[0] || null)}
          />
          <div className="muted" style={{ fontSize: 12 }}>
            差し替えると、改めて運営の本人確認待ちになります（確認が完了するまで有料相談への回答はできません）。
          </div>
          {docError && <div style={{ color: '#C0392B', fontSize: 13 }}>{docError}</div>}
          {docSaved && <div style={{ color: 'var(--main)', fontSize: 13 }}>提出しました。運営の確認をお待ちください。</div>}
          <button className="btn-secondary" onClick={uploadLicenseDoc} disabled={!licenseDoc || docUploading}>
            {docUploading ? 'アップロード中…' : docSubmitted ? '登録証を差し替える' : '登録証を提出する'}
          </button>
        </div>
      </div>
    </div>
  );
}
