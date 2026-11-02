'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATS } from '@/lib/categories';

// 想定する資格の候補。「その他」を選んだ場合のみ自由入力欄を出す（2026-10-13追加、
// それまでは資格欄が自由入力のみでブレが出やすかったため）。
// 保健師を追加（2026-10-30、田村さんの発案で心理分野以外の専門家も募ることにしたため）。
// 「経験者」は、専門家とは入り口・ページを分けることにしたため
// （2026-10-30）、この専門家向けフォームの選択肢からは外し、/senpai/register に
// 専用フォームを新設した。
const CREDENTIAL_OPTIONS = [
  '公認心理師',
  '臨床心理士',
  '精神科医',
  '小児科医',
  '保健師',
  '学校心理士',
  'スクールカウンセラー',
  '社会福祉士',
  '精神保健福祉士',
  'キャリアコンサルタント',
  'その他',
];

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
    credential: '公認心理師',
    credentialOther: '',
    bio: '',
    license_number: '',
    link_url: '',
    online_consult_url: '',
    specialtyCategories: [] as string[],
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (Object.keys(draft).length > 0) {
      setForm((f) => ({ ...f, ...draft }));
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
    };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // 保存に失敗しても入力自体は継続できるよう、ここでは無視する。
    }
  }, [form]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'specialtyCategories') return; // 下で個別に追加する
      body.set(key, String(value));
    });
    if (form.credential === 'その他') body.set('credential', form.credentialOther);
    // 登録証アップロード・オンライン通話による本人確認は撤去したため、常に'call'
    // （登録証の提出なし）を送る（DBのcheck制約・既存データとの整合のため）。
    body.set('verification_method', 'call');
    form.specialtyCategories.forEach((cat) => body.append('specialty_categories', cat));
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
          本名でご登録ください。相談者には公開されません。
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
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>資格（該当するものを選択してください）</div>
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
          MOSHやストアカなど、ご自身で予約・決済ページをお持ちの場合はそのURLを入れてください。プロフィールページに「オンラインで相談する」ボタンが表示されます。未入力の場合、このボタンは表示されません（あとからプロフィール編集でも設定できます）。
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

        {/* 2026-11-01、登録証アップロード・オンライン通話による本人確認を撤去し、
            経験者（/senpai/register）と同じ、内容（プロフィール・資格・URL等）を
            運営が見て判断する自己申告ベースの流れに統一した。「ユーアルエルとか
            プロフィールとか書いてくれるからある程度こっちで判断もできそう」との
            判断を受けた変更。verification_methodは引き続き'call'（登録証の提出なし）
            を送る（DBのcheck制約・既存データとの整合のため）。 */}
        <div className="muted" style={{ marginTop: 6 }}>本人確認について</div>
        <div className="muted" style={{ fontSize: 12, marginTop: -4, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
          記入いただいた内容（資格・自己紹介・ご自身のサイト等へのリンク）を運営が確認し、問題がなければそのまま承認します。内容について確認したいことがある場合のみ、ご登録のメールアドレスへ個別にご連絡します。確認が完了するまで、相談への回答はできません。
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
