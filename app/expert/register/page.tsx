'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 想定する資格の候補。「その他」を選んだ場合のみ自由入力欄を出す（2026-10-13追加、
// それまでは資格欄が自由入力のみでブレが出やすかったため）。
const CREDENTIAL_OPTIONS = [
  '公認心理師',
  '臨床心理士',
  '精神科医',
  '小児科医',
  '学校心理士',
  'スクールカウンセラー',
  '社会福祉士',
  '精神保健福祉士',
  'キャリアコンサルタント',
  'その他',
];

export default function ExpertRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', name: '', credential: '公認心理師', credentialOther: '', bio: '', license_number: '', link_url: '' });
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!licenseDoc) {
      setError('登録証（画像またはPDF）を添付してください');
      return;
    }
    setLoading(true);
    setError('');
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.set(key, value));
    if (form.credential === 'その他') body.set('credential', form.credentialOther);
    body.set('license_doc', licenseDoc);
    if (photo) body.set('photo', photo);
    const res = await fetch('/api/expert/register', {
      method: 'POST',
      body,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    if (data.warning) {
      alert(data.warning);
    }
    router.push('/expert/dashboard');
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 420, gap: 14 }}>
        {/* 専門家ログイン周りのページには戻る手段が無かったため追加（2026-10-12）。
            直前の画面（募集ページ等）に戻れるよう、決め打ちのリンク先ではなく
            router.back()にしている（2026-10-13、「トップへ」から「戻る」に変更）。 */}
        <button type="button" className="btn-ghost" onClick={() => router.back()} style={{ alignSelf: 'flex-start' }}>← 戻る</button>
        <div style={{ fontWeight: 700, fontSize: 18 }}>専門家登録</div>
        <div className="muted">「どうする先生」で有料相談に回答する専門家としてのプロフィールを作成します。</div>

        <input className="input" placeholder="お名前（本名）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          登録証に記載の氏名と同じ本名でご登録ください。相談者にはこのお名前が表示されます。
        </div>
        <select className="input" value={form.credential} onChange={(e) => setForm({ ...form, credential: e.target.value })}>
          {CREDENTIAL_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {form.credential === 'その他' && (
          <input
            className="input"
            placeholder="資格名を入力してください"
            value={form.credentialOther}
            onChange={(e) => setForm({ ...form, credentialOther: e.target.value })}
            required
          />
        )}
        <textarea className="input" rows={4} placeholder="自己紹介（経歴・専門分野など）" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <input
          className="input"
          placeholder="ご自身のサービス・サイトなどへのリンク（任意）"
          value={form.link_url}
          onChange={(e) => setForm({ ...form, link_url: e.target.value })}
        />

        <div className="muted" style={{ marginTop: 6 }}>プロフィール写真（任意・あとから登録・変更もできます）</div>
        <input
          className="input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />

        <input
          className="input"
          placeholder="資格の登録番号（公認心理師登録番号など。登録番号がない資格の場合は空欄でかまいません）"
          value={form.license_number}
          onChange={(e) => setForm({ ...form, license_number: e.target.value })}
        />

        <div className="muted" style={{ marginTop: 6 }}>登録証（画像またはPDF）</div>
        <input
          className="input"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => setLicenseDoc(e.target.files?.[0] || null)}
          required
        />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          登録番号の自己申告だけでは本人確認ができないため、登録証の画像またはPDFを添付してください。
          {/* 2026-10-13: 差し戻し（不備・期限切れによる再提出）の大半を占める2点を、
              申請前にあらかじめ明記しておくことで、差し戻しの件数自体を減らす狙いで追加。 */}
          有効期限内のもので、氏名・資格名（登録番号がある場合はそれも）がはっきり読み取れる状態でご提出ください（内容が確認できない場合、再提出をお願いすることがあります）。
          ご提出いただいた登録証は本人確認のみに使用し、第三者には提供しません。確認が完了するまで、有料相談への回答はできません。
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
