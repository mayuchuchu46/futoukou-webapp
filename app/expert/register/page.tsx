'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATS } from '@/lib/categories';
import { CAREER_FIELD_OPTIONS } from '@/lib/careerFields';
import { CREDENTIAL_OPTIONS } from '@/lib/expertCredentials';

// お悩み辞典の既存カテゴリ（lib/categories.ts）から、対応できるものを専門家自身に
// 複数選んでもらう（2026-10-30追加）。資格種別と1対1対応ではなく、本人の判断に委ねる。
const CATEGORY_OPTIONS = Object.entries(CATS).map(([key, c]) => ({ key, label: c.label }));

const BIO_EXAMPLE =
  '例：公認心理師として、スクールカウンセラーや児童発達支援の現場で10年以上、不登校・行き渋りのお子さんとご家族の相談に携わってきました。無理に登校を促すのではなく、お子さんのペースに合わせた関わり方を一緒に考えます。';

// ファイル・パスワード以外の入力内容を下書きとして保存しておく（2026-10-13追加）。
// 「せっかく途中まで書いたのに消える」「戻ると消える」という指摘を受けて、入力のたびに
// localStorageへ保存し、次に開いたときに復元する。ファイル（登録証・写真）は
// localStorageに保存できないため対象外（再度選択してもらう必要がある）。
// パスワードは機微情報のため下書き保存の対象から外す。
const DRAFT_KEY = 'dsk_expert_register_draft';

type DraftForm = {
  email: string;
  name: string;
  display_name: string;
  credential: string;
  credentialOther: string;
  bio: string;
  license_number: string;
  link_url: string;
  online_consult_url: string;
  specialtyCategories: string[];
  otherCredentials: string[];
  verificationMethod: 'upload' | 'call';
  careerFields: Record<string, string>;
};

function loadDraft(): Partial<DraftForm> {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function ExpertRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    display_name: '',
    // 以前は'公認心理師'がデフォルトで選択された状態になっており、本人が資格欄を
    // 一度も触らなくても「公認心理師として」登録できてしまっていた（2026-11-03、
    // 指摘を受けて修正）。空文字＋プレースホルダー選択肢＋requiredにして、必ず
    // 本人が選んだ資格が入るようにする。
    credential: '',
    credentialOther: '',
    bio: '',
    license_number: '',
    link_url: '',
    online_consult_url: '',
    specialtyCategories: [] as string[],
    verificationMethod: 'upload' as 'upload' | 'call',
  });
  // 保有資格（その他・複数可、2026-11-03追加）。「兼任してる人も多そう」との指摘を
  // 受けて、上のcredential（主資格・単一選択、SENPAI_CREDENTIAL判定にも使われる
  // ため単一値のまま）とは別に、追加で持っている資格を複数選べるようにした。
  const [otherCredentials, setOtherCredentials] = useState<string[]>([]);
  const [careerFields, setCareerFields] = useState<Record<string, string>>({});
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (Object.keys(draft).length > 0) {
      setForm((f) => ({ ...f, ...draft }));
      if (draft.careerFields) setCareerFields(draft.careerFields);
      if (draft.otherCredentials) setOtherCredentials(draft.otherCredentials);
      setDraftRestored(true);
    }
  }, []);

  useEffect(() => {
    const draft: DraftForm = {
      email: form.email,
      name: form.name,
      display_name: form.display_name,
      credential: form.credential,
      credentialOther: form.credentialOther,
      bio: form.bio,
      license_number: form.license_number,
      link_url: form.link_url,
      online_consult_url: form.online_consult_url,
      specialtyCategories: form.specialtyCategories,
      otherCredentials,
      verificationMethod: form.verificationMethod,
      careerFields,
    };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // 保存に失敗しても入力自体は継続できるよう、ここでは無視する。
    }
  }, [form, careerFields, otherCredentials]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.credential) {
      setError('資格を選択してください');
      return;
    }
    if (form.verificationMethod === 'upload' && !licenseDoc) {
      setError('登録証（画像またはPDF）を添付してください');
      return;
    }
    setLoading(true);
    setError('');
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'specialtyCategories' || key === 'verificationMethod') return; // 下で個別に追加する
      body.set(key, String(value));
    });
    if (form.credential === 'その他') body.set('credential', form.credentialOther);
    body.set('verification_method', form.verificationMethod);
    form.specialtyCategories.forEach((cat) => body.append('specialty_categories', cat));
    otherCredentials.forEach((c) => body.append('other_credentials', c));
    if (form.verificationMethod === 'upload' && licenseDoc) body.set('license_doc', licenseDoc);
    // 経歴確認（2026-11-03追加）：選択した分野・年数を[{field, years}]のJSON文字列で送る。
    const careerFieldsArray = Object.entries(careerFields)
      .filter(([, years]) => years !== undefined)
      .map(([field, years]) => ({ field, years }));
    body.set('career_fields', JSON.stringify(careerFieldsArray));
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
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // 無視してよい（登録自体は完了している）。
    }
    if (data.warning) {
      alert(data.warning);
    }
    router.push('/account');
  }

  return (
    <div className="login-wrap" style={{ alignItems: 'flex-start', paddingTop: 32, paddingBottom: 32 }}>
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 560, gap: 14 }}>
        {/* 専門家ログイン周りのページには戻る手段が無かったため追加（2026-10-12）。
            直前の画面（募集ページ等）に戻れるよう、決め打ちのリンク先ではなく
            router.back()にしている（2026-10-13、「トップへ」から「戻る」に変更）。
            btn-ghostは実はCSSで定義されていないクラスで、aタグではグローバルなaのcolor:inherit
            リセットのおかげでたまたま素のテキストに見えていただけ。buttonタグだとブラウザ標準の
            枠付きボタン見た目がそのまま出てしまい他ページの「戻る」と見た目が揃わなかったため、
            Header.tsx・BottomNav.tsxと同じheader-backクラス（矢印アイコン付き）に統一した。 */}
        <button type="button" className="header-back" onClick={() => router.back()} aria-label="前のページに戻る" style={{ alignSelf: 'flex-start', fontSize: 13 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          戻る
        </button>
        <div style={{ fontWeight: 700, fontSize: 18 }}>専門家登録</div>
        <div className="muted">「どうする先生」で相談に回答する専門家としてのプロフィールを作成します。</div>
        {draftRestored && (
          <div className="muted" style={{ fontSize: 12, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
            前回入力中だった内容を復元しました。
          </div>
        )}

        <input className="input" placeholder="お名前（本名）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          登録証に記載の氏名と同じ本名でご登録ください。本人確認のみに使用し、相談者には公開されません。
        </div>
        <input
          className="input"
          placeholder="表示名（任意）"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          相談者に公開される名前です。未入力の場合は上のお名前（本名）がそのまま表示されます。
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>主な資格（該当するものを選択してください）</div>
        <select
          className="input"
          value={form.credential}
          onChange={(e) => {
            const next = e.target.value;
            setForm({ ...form, credential: next });
            // 主な資格と保有資格（その他）が重複しないよう、主な資格に選び直した
            // ものは保有資格側から外す。
            setOtherCredentials((prev) => prev.filter((c) => c !== next));
          }}
          required
        >
          <option value="" disabled>選択してください</option>
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

        {/* 保有資格（その他・複数可、2026-11-03追加）。「兼任してる人も多そう」との
            指摘を受けて追加。主な資格（上・バッジ表示やSENPAI_CREDENTIAL判定に使う
            単一値）とは別に、追加で持っている資格を複数選べるようにした。 */}
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>保有資格（その他、複数選択可・任意）</div>
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
        <div className="muted" style={{ fontSize: 12, marginTop: -4 }}>
          主な資格以外にも保有している資格があれば選択してください。プロフィールページに併記されます。
        </div>

        {/* 対応できる相談カテゴリ（2026-10-30追加）。資格種別を増やしていく前提で、
            「この資格ならこのカテゴリ」と決めつけず、本人に選んでもらう。 */}
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>対応できる相談カテゴリ（複数選択可・任意）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORY_OPTIONS.map((c) => {
            const checked = form.specialtyCategories.includes(c.key);
            return (
              <label
                key={c.key}
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
                    setForm((f) => ({
                      ...f,
                      specialtyCategories: e.target.checked
                        ? [...f.specialtyCategories, c.key]
                        : f.specialtyCategories.filter((k) => k !== c.key),
                    }));
                  }}
                />
                {c.label}
              </label>
            );
          })}
        </div>

        {/* 経歴確認（2026-11-03追加、田村さんの提案）。資格の本人確認（登録証）とは別に、
            実務で携わってきた分野・年数を低負担の自己申告で入力してもらい、公開
            プロフィールに経歴として表示する。運営による裏付け確認は行わない。 */}
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>経歴（実務分野・年数、複数選択可・任意）</div>
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
        <div className="muted" style={{ fontSize: 12, marginTop: -4 }}>
          実務で携わってきた分野にチェックし、年数を入力してください。プロフィールページに経歴として表示されます。
        </div>

        <textarea
          className="input"
          rows={4}
          placeholder={BIO_EXAMPLE}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <input
          className="input"
          placeholder="ご自身のサイト・SNS（X、Instagramなど）へのリンク（任意）"
          value={form.link_url}
          onChange={(e) => setForm({ ...form, link_url: e.target.value })}
        />
        <input
          className="input"
          placeholder="オンラインでの通話・チャット相談の予約ページURL（任意・MOSH等）"
          value={form.online_consult_url}
          onChange={(e) => setForm({ ...form, online_consult_url: e.target.value })}
        />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          MOSHやストアカなど、ご自身で予約・決済ページをお持ちの場合はそのURLを入れてください。プロフィールページに「直接相談する」ボタンが表示されます。未入力の場合、このボタンは表示されません（あとからプロフィール編集でも設定できます）。
          <br />
          どうする先生での質問回答は無料ですが、個別に有料で対応されたい場合（テキストでの個別相談も含む）は、このリンク先でご自身で料金・やり取りを設定してください。予約・決済・返信期限等はすべてそちらのサービス上で完結し、どうする先生は関与しません。
        </div>

        <div className="muted" style={{ marginTop: 6 }}>プロフィール写真（任意・あとから登録・変更もできます）</div>
        <input
          className="input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />

        <input
          className="input"
          placeholder="資格の登録番号（任意）"
          value={form.license_number}
          onChange={(e) => setForm({ ...form, license_number: e.target.value })}
        />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          公認心理師登録番号など。登録番号がない資格の場合は空欄でかまいません。
        </div>

        {/* 本人確認の方法（2026-10-30追加、2026-11-01に一度撤去したが、田村さんから
            「国家資格の写しを添付。専門家募集の敷居は高くなってしまいますが、ある程度
            回答の質は担保出来るかなと」との指摘を受けて2026-11-03に復活）。
            登録証の画像・PDFを個人運営のサイトに送ること自体を躊躇う方もいるため、
            オンライン通話で画面に見せてもらう方式も選べるようにした。通話方式では
            画像・PDFは一切お預かりしない。 */}
        <div className="muted" style={{ marginTop: 6 }}>本人確認の方法</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer' }}>
            <input
              type="radio"
              name="verification_method"
              checked={form.verificationMethod === 'upload'}
              onChange={() => setForm({ ...form, verificationMethod: 'upload' })}
              style={{ marginTop: 3 }}
            />
            <span>登録証（画像またはPDF）をアップロードする</span>
          </label>
          <label className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer' }}>
            <input
              type="radio"
              name="verification_method"
              checked={form.verificationMethod === 'call'}
              onChange={() => setForm({ ...form, verificationMethod: 'call' })}
              style={{ marginTop: 3 }}
            />
            <span>オンライン通話で画面に見せて確認してもらう（登録証の画像・PDFはお預かりしません。運営からご連絡し、日程を調整します）</span>
          </label>
        </div>

        {form.verificationMethod === 'upload' ? (
          <>
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
              有効期限内のもので、氏名・資格名（登録番号がある場合はそれも）がはっきり読み取れる状態でご提出ください（内容が確認できない場合、再提出をお願いすることがあります）。
              ご提出いただいた登録証は本人確認のみに使用し、第三者には提供しません。確認が完了するまで、相談への回答はできません。
              確認が完了すると、画像・PDFのファイルは30日以内に削除します（確認済みという記録のみ残します）。
            </div>
          </>
        ) : (
          <div className="muted" style={{ fontSize: 12, marginTop: -4, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
            ご登録いただいたメールアドレスに、運営から通話日程についてご連絡します。通話時に登録証（氏名・資格名・登録番号がわかるもの）を画面に見せていただき、運営が確認します。確認が完了するまで、相談への回答はできません。
          </div>
        )}
        <input className="input" type="email" placeholder="メールアドレス" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="パスワード（8文字以上）" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? '登録中…' : '登録する'}</button>
        <a className="btn-ghost" href="/expert/login" style={{ textAlign: 'center' }}>すでに登録済みの方はこちら</a>
      </form>
    </div>
  );
}
