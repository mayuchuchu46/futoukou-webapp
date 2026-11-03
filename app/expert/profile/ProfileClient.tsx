'use client';

import { useState } from 'react';
import ExpertAvatar from '@/components/ExpertAvatar';
import { CAREER_FIELD_OPTIONS, type CareerField } from '@/lib/careerFields';
import { CREDENTIAL_OPTIONS } from '@/lib/expertCredentials';
import { SENPAI_CREDENTIAL } from '@/lib/config';

type Expert = {
  id: string;
  name: string;
  display_name?: string | null;
  credential: string;
  bio: string;
  photo_url: string | null;
  link_url?: string | null;
  online_consult_url?: string | null;
  license_doc_path?: string | null;
  verification_method?: 'upload' | 'call';
  verified?: boolean;
  stripe_account_id?: string | null;
  stripe_payouts_enabled?: boolean;
  career_fields?: CareerField[] | null;
  other_credentials?: string[] | null;
};

export default function ProfileClient({ expert, stripeConfigured }: { expert: Expert; stripeConfigured: boolean }) {
  const [form, setForm] = useState({
    name: expert.name,
    display_name: expert.display_name || '',
    credential: expert.credential,
    bio: expert.bio,
    link_url: expert.link_url || '',
    online_consult_url: expert.online_consult_url || '',
  });
  // 経歴確認（2026-11-03追加）：field -> years のマップとして編集し、保存時に
  // [{field, years}]の配列へ変換する（登録フォーム/expert/register/page.tsxと同じ方式）。
  const [careerFields, setCareerFields] = useState<Record<string, string>>(
    Object.fromEntries((expert.career_fields || []).map((c) => [c.field, c.years]))
  );
  // 保有資格（その他・複数可、2026-11-03追加）。「兼任してる人も多そう」との指摘を
  // 受けて、主資格（上のform.credential）とは別に、追加で持っている資格を複数
  // 選べるようにした（登録フォーム/expert/register/page.tsxと同じ方式）。
  const [otherCredentials, setOtherCredentials] = useState<string[]>(expert.other_credentials || []);
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

  const [stripeStarting, setStripeStarting] = useState(false);
  const [stripeError, setStripeError] = useState('');

  async function startStripeOnboarding() {
    setStripeStarting(true);
    setStripeError('');
    try {
      const res = await fetch('/api/expert/stripe-connect/start', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || '失敗しました');
      window.location.href = data.url;
    } catch (e: unknown) {
      setStripeError(e instanceof Error ? e.message : 'エラーが発生しました');
      setStripeStarting(false);
    }
  }

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
    const career_fields: CareerField[] = Object.entries(careerFields).map(([field, years]) => ({ field, years }));
    const res = await fetch('/api/expert/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, career_fields, other_credentials: otherCredentials }),
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
        <a className="btn-ghost" href="/account">← アカウントへ</a>
        <div style={{ fontWeight: 700, fontSize: 16 }}>プロフィール編集</div>
      </div>
      <div className="main">
        <div className="card" style={{ gap: 12 }}>
          <div className="muted">お名前（本名・本人確認用。公開されません）</div>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="muted">表示名（相談者に公開される名前。未入力ならお名前が表示されます）</div>
          <input
            className="input"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            placeholder={form.name}
          />
          <div className="muted">主な資格</div>
          <input className="input" value={form.credential} onChange={(e) => setForm({ ...form, credential: e.target.value })} />

          {/* 保有資格（その他・複数可、2026-11-03追加）。「兼任してる人も多そう」との
              指摘を受けて追加。経験者には資格前提の一覧が合わないため、専門家のみ表示。 */}
          {expert.credential !== SENPAI_CREDENTIAL && (
            <>
              <div className="muted">保有資格（その他、複数選択可・任意）</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CREDENTIAL_OPTIONS.filter((c) => c !== 'その他' && c !== form.credential).map((c) => {
                  const checked = otherCredentials.includes(c);
                  return (
                    <label
                      key={c}
                      className="muted"
                      style={{
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        border: '1px solid var(--border)',
                        borderRadius: 999,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        background: checked ? 'var(--bg)' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setOtherCredentials((prev) =>
                            e.target.checked ? [...prev, c] : prev.filter((k) => k !== c)
                          );
                        }}
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
                主な資格以外にも保有している資格があれば選択してください。プロフィールページに併記されます。
              </div>
            </>
          )}

          {/* 経歴確認（2026-11-03追加、田村さんの提案）。登録時（/expert/register）と
              同じ分野・年数の自己申告欄を、あとから編集できるようにする。経験者
              （先輩保護者）には資格前提の分野選択肢が合わないため、専門家のみに表示する。 */}
          {expert.credential !== SENPAI_CREDENTIAL && (
            <>
              <div className="muted">経歴（実務分野・年数、複数選択可・任意）</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CAREER_FIELD_OPTIONS.map((field) => {
                  const checked = field in careerFields;
                  return (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setCareerFields((prev) => {
                              const next = { ...prev };
                              if (e.target.checked) next[field] = next[field] ?? '';
                              else delete next[field];
                              return next;
                            });
                          }}
                        />
                        {field}
                      </label>
                      {checked && (
                        <>
                          <input
                            className="input"
                            style={{ width: 64, flex: '0 0 auto', padding: '4px 8px' }}
                            placeholder="年数"
                            value={careerFields[field]}
                            onChange={(e) => setCareerFields((prev) => ({ ...prev, [field]: e.target.value }))}
                          />
                          <span className="muted" style={{ fontSize: 13 }}>年</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
                実務で携わってきた分野にチェックし、年数を入力してください。プロフィールページに経歴として表示されます。
              </div>
            </>
          )}

          <div className="muted">自己紹介</div>
          <textarea className="input" rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <div className="muted">ご自身のサイト・SNS（X、Instagramなど）へのリンク（任意）</div>
          <input
            className="input"
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            placeholder="https://..."
          />
          <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
            プロフィールページに公開表示されます。
          </div>
          <div className="muted">オンラインでの通話・チャット相談の予約ページURL（任意）</div>
          <input
            className="input"
            value={form.online_consult_url}
            onChange={(e) => setForm({ ...form, online_consult_url: e.target.value })}
            placeholder="https://mosh.jp/..."
          />
          <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
            MOSHやストアカなど、ご自身で予約・決済ページをお持ちの場合はそのURLを入れてください。プロフィールページに「ご本人のサービスを見てみる」ボタンが表示されます（顔出し・顔出しなし・チャットのみは当日の通話内で選べます）。未入力の場合、このボタンは表示されません。
            <br />
            どうする先生での質問回答は無料ですが、個別に有料で対応されたい場合（テキストでの個別相談も含む）は、このリンク先でご自身で料金・やり取りを設定してください。予約・決済・返信期限等はすべてそちらのサービス上で完結し、どうする先生は関与しません。
          </div>
          {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
          {saved && <div style={{ color: 'var(--main)', fontSize: 13 }}>保存しました</div>}
          <button className="btn-primary" onClick={save}>保存する</button>
        </div>

        <div className="card" style={{ gap: 12 }}>
          <div style={{ fontWeight: 700 }}>プロフィール写真（アイコン）</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ExpertAvatar photoUrl={photoUrl} />
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
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            報酬の振込先
            {!stripeConfigured && <span className="comingsoon-badge">準備中・近日公開</span>}
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            {!stripeConfigured
              ? '振込機能の準備中です。設定が整い次第、こちらから登録（本人確認・振込先口座の入力）をお願いします。それまでの間の報酬は、運営から直接銀行振込でお支払いします。'
              : expert.stripe_payouts_enabled
              ? '設定完了です。報酬は毎月まとめて、こちらの振込先へお振込みします。'
              : expert.stripe_account_id
              ? '振込先の設定が未完了です。本人確認・口座情報の入力を完了してください。'
              : '報酬の振込を受け取るには、振込先の登録（本人確認・振込先口座の入力）が必要です。'}
          </div>
          {stripeError && <div style={{ color: '#C0392B', fontSize: 13 }}>{stripeError}</div>}
          {stripeConfigured && (
            <button className="btn-secondary" onClick={startStripeOnboarding} disabled={stripeStarting}>
              {stripeStarting
                ? '移動中…'
                : expert.stripe_account_id
                ? (expert.stripe_payouts_enabled ? '登録内容を確認・変更する' : '設定を続ける')
                : '振込先を登録する'}
            </button>
          )}
        </div>

        {/* 本人確認方式が「オンライン通話で確認」（経験者は常にこちら）の場合、
            そもそも登録証（資格証明書の画像・PDF）をお預かりしない方式のため、
            このセクション自体を出さない（2026-10-31、経験者のプロフィール編集
            画面に登録証の提出欄が出てしまっていた不具合の指摘を受けて修正）。 */}
        {expert.verification_method !== 'call' && (
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
              差し替えると、改めて運営の本人確認待ちになります（確認が完了するまで相談への回答はできません）。
            </div>
            {docError && <div style={{ color: '#C0392B', fontSize: 13 }}>{docError}</div>}
            {docSaved && <div style={{ color: 'var(--main)', fontSize: 13 }}>提出しました。運営の確認をお待ちください。</div>}
            <button className="btn-secondary" onClick={uploadLicenseDoc} disabled={!licenseDoc || docUploading}>
              {docUploading ? 'アップロード中…' : docSubmitted ? '登録証を差し替える' : '登録証を提出する'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
