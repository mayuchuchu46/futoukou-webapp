'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATS } from '@/lib/categories';

// 先輩保護者（経験者）専用の登録フォーム。
// 専門家向け（/expert/register）と入り口・ページを分けることにした（2026-10-30、
// 「保護者と、専門家の入り口とページは別にしたい」との方針を受けて）。
// このフォームは資格を前提としないため、資格選択・資格の登録番号・登録証
// アップロードの項目は出さない。本人確認は常に「call」（verification_method）
// 固定で送るが、「気軽に登録できる流れがいいな」との指摘を受けて（2026-10-31）、
// 必ずオンライン通話をするという案内はやめ、基本は登録内容（自己紹介文）を
// 運営が確認して承認する、通話なしの流れに変更した。確認したい点がある場合
// のみ、登録時のメールアドレスへ個別に連絡する運用（app/admin/AdminClient.tsx
// 参照）。verification_method='call'という値自体は「資格証の提出がない登録」
// を示すフラグとして内部的に維持している。
// 送信先のAPI（/api/expert/register）・保存先のテーブル（experts）は専門家と
// 共通のまま。credentialは固定で「先輩保護者（経験者）」を送る。

const CREDENTIAL = '先輩保護者（経験者）';

// お悩み辞典の既存カテゴリ（lib/categories.ts）から、対応できるものを複数選んでもらう。
const CATEGORY_OPTIONS = Object.entries(CATS).map(([key, c]) => ({ key, label: c.label }));

// 「先輩保護者からこの学校の話を聞く」機能（2026-10-30追加、app/gakko内の各学校ページ）
// がこの自己紹介文（bio）を学校名で検索するため、学校の正式名称を書いてもらうよう
// 例文で促す。
const BIO_EXAMPLE =
  '例：中2の息子が小5の時に不登校になり、現在は〇〇学園中等部に転校して元気に通っています。学校探しで悩んだ経験や、学校との付き合い方についてお話しできます。';

// ファイル・パスワード以外の入力内容を下書きとして保存しておく
// （/expert/register と同じ仕組み。2026-10-13の指摘を踏まえて最初から対応）。
const DRAFT_KEY = 'dsk_senpai_register_draft';

type DraftForm = {
  email: string;
  name: string;
  display_name: string;
  bio: string;
  link_url: string;
  specialtyCategories: string[];
  schoolNames: string[];
};

function loadDraft(): Partial<DraftForm> {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// useSearchParams()はプリレンダー時点では値が確定しないため、/ask・/account/registerと
// 同様にSuspenseで囲む（2026-10-31追加。学校ページの「この学校について話せる先輩保護者を
// 募集しています」からの?school=学校名を受け取るために追加）。
export default function SenpaiRegisterPage() {
  return (
    <Suspense fallback={null}>
      <SenpaiRegisterForm />
    </Suspense>
  );
}

function SenpaiRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get('school');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    display_name: '',
    bio: '',
    link_url: '',
    specialtyCategories: [] as string[],
    schoolNames: [] as string[],
  });
  // 「保護者視点で話せる学校名」の入力中テキスト（1件ずつ追加する方式、2026-10-31、
  // 「コンマより一個一個入力がいいかと」との指摘を受けて、カンマ区切り入力から変更）。
  const [schoolNameInput, setSchoolNameInput] = useState('');
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

  // 学校ページの「この学校について話せる先輩保護者を募集しています」から来た場合
  // （?school=学校名）、学校名欄に自動で追加する（2026-10-31追加）。
  useEffect(() => {
    if (!schoolParam) return;
    setForm((f) => (f.schoolNames.includes(schoolParam) ? f : { ...f, schoolNames: [...f.schoolNames, schoolParam] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolParam]);

  useEffect(() => {
    const draft: DraftForm = {
      email: form.email,
      name: form.name,
      display_name: form.display_name,
      bio: form.bio,
      link_url: form.link_url,
      specialtyCategories: form.specialtyCategories,
      schoolNames: form.schoolNames,
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
    body.set('email', form.email);
    body.set('password', form.password);
    body.set('name', form.name);
    body.set('display_name', form.display_name);
    body.set('bio', form.bio);
    body.set('link_url', form.link_url);
    body.set('credential', CREDENTIAL);
    body.set('verification_method', 'call'); // 資格証が無いため常に通話確認
    form.specialtyCategories.forEach((cat) => body.append('specialty_categories', cat));
    form.schoolNames.forEach((n) => body.append('experienced_school_names', n));
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
    router.push('/expert/dashboard');
  }

  return (
    <div className="login-wrap" style={{ alignItems: 'flex-start', paddingTop: 32, paddingBottom: 32 }}>
      <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 560, gap: 14 }}>
        <button type="button" className="header-back" onClick={() => router.back()} aria-label="前のページに戻る" style={{ alignSelf: 'flex-start', fontSize: 13 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          戻る
        </button>
        <div style={{ fontWeight: 700, fontSize: 18 }}>先輩保護者（経験者）登録</div>
        <div className="muted">
          不登校を経験されたご家庭ご自身として、「どうする先生」で有料相談に回答するプロフィールを作成します。資格は不要です。
        </div>
        {draftRestored && (
          <div className="muted" style={{ fontSize: 12, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
            前回入力中だった内容を復元しました。
          </div>
        )}

        {/* 「気軽に登録できる流れがいいな」「先輩保護者は本名じゃなくていいかも」との
            指摘を受けて（2026-10-31）、本名必須をやめ、ニックネーム等でも登録できる
            ようにした。報酬の振込を開始する段階で、振込先口座名義と一致する本名を
            改めて確認する運用とする（今はボランティア協力期間のため実害はない）。
            display_name（任意の表示名）と役割が重なるが、入力の手間を増やしたく
            ないため項目自体は維持し、案内文のみ変更。 */}
        <input className="input" placeholder="お名前（ニックネーム可）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          本名でなくても構いません。相談者には公開されません（報酬のお支払いを始める段階で、振込先口座名義と合わせて改めて本名を確認させていただきます）。
        </div>
        <input
          className="input"
          placeholder="表示名（任意）"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />
        <div className="muted" style={{ fontSize: 12, marginTop: -8 }}>
          相談者に公開される名前です。未入力の場合は上のお名前がそのまま表示されます。
        </div>

        {/* 対応できる相談カテゴリ（任意）。 */}
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>お話できる相談カテゴリ（複数選択可・任意）</div>
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

        {/* 「保護者視点で話せる学校名」専用欄（2026-10-31追加）。以前はbioの自己紹介文に
            学校名を書いてもらう方式のみだったが、専用の入力欄が欲しいとの要望を受けて
            追加した。bioへの記載も引き続き有効（lib/expertSchoolMatch.ts参照）。
            当初はカンマ・読点区切りの1つのテキスト欄だったが、「コンマより一個一個
            入力がいいかと」との指摘を受け、1件ずつ入力して追加するチップ形式に変更。 */}
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          保護者視点で話せる学校名（任意・複数可）
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="例：〇〇学園中等部"
            value={schoolNameInput}
            onChange={(e) => setSchoolNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const name = schoolNameInput.trim();
              if (name && !form.schoolNames.includes(name)) {
                setForm((f) => ({ ...f, schoolNames: [...f.schoolNames, name] }));
              }
              setSchoolNameInput('');
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: '0 0 auto' }}
            onClick={() => {
              const name = schoolNameInput.trim();
              if (name && !form.schoolNames.includes(name)) {
                setForm((f) => ({ ...f, schoolNames: [...f.schoolNames, name] }));
              }
              setSchoolNameInput('');
            }}
          >
            追加
          </button>
        </div>
        {form.schoolNames.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.schoolNames.map((n) => (
              <span
                key={n}
                className="muted"
                style={{
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  padding: '4px 6px 4px 10px',
                  background: 'var(--bg)',
                }}
              >
                {n}
                <button
                  type="button"
                  aria-label={`${n}を削除`}
                  onClick={() => setForm((f) => ({ ...f, schoolNames: f.schoolNames.filter((x) => x !== n) }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="muted" style={{ fontSize: 12, marginTop: -4 }}>
          お子さんが通われていた（通われている）学校の正式名称を1件ずつ入力して「追加」を押してください（Enterキーでも追加できます）。入力すると、その学校の紹介ページにも「先輩保護者からこの学校の話を聞く」として表示されます。
        </div>

        <input
          className="input"
          placeholder="ご自身のブログ・SNSなどへのリンク（任意）"
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

        {/* 資格証が無いため本人確認が必要だが、「気軽に登録できる流れがいいな」との
            指摘を受けて（2026-10-31）、オンライン通話を必須とする案内から、基本は
            登録内容を運営が確認して承認する案内に変更。確認したい点がある場合のみ
            個別に連絡する。 */}
        <div className="muted" style={{ marginTop: 6 }}>本人確認について</div>
        <div className="muted" style={{ fontSize: 12, marginTop: -4, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
          記入いただいた内容を運営が確認し、問題がなければそのまま承認します。内容について確認したいことがある場合のみ、ご登録のメールアドレスへ個別にご連絡します。確認が完了するまで、有料相談への回答はできません。
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
