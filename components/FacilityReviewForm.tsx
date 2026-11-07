'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 学校・施設の詳細ページで、口コミをその場で書ける入力フォーム（2026-11-07追加）。
// app/result/[id]/PublicAnswerInvite.tsxと同じ考え方：未登録でもその場で書けるが、
// 送信後は運営の本人確認（verified化）が完了するまで非公開（/api/expert/public-review
// 参照）。下書きはlocalStorageに保存するため、「専門家として登録したい（資格提出が
// 必要）」を選んでそちらに移動しても内容は消えない。
export default function FacilityReviewForm({
  facilityType,
  facilityNo,
  facilityName,
}: {
  facilityType: string;
  facilityNo: string;
  facilityName: string;
}) {
  const draftKey = `dsk_review_draft_${facilityType}_${facilityNo}`;

  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [loggedIn, setLoggedIn] = useState(false);
  const [verified, setVerified] = useState(false);

  const [body, setBody] = useState('');
  // この口コミに表示する名前（2026-11-08追加）。専門家・経験者プロフィールの
  // 名前（reg.name/display_name）とは別の、口コミ専用のニックネーム欄。
  // 「学校名＋プロフィールの実名の組み合わせで子どもが特定される」との懸念を
  // 受けて、投稿の入り口の時点から別の名前を選べるようにする。
  const [authorLabel, setAuthorLabel] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [reg, setReg] = useState({ email: '', password: '', name: '', display_name: '', bio: '' });

  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [publishedNow, setPublishedNow] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftKey);
      if (saved) setBody(saved);
    } catch {
      // localStorageが使えない環境でも入力自体は問題なく行えるため無視する。
    }

    fetch('/api/expert/me')
      .then((r) => r.json())
      .then((data) => {
        setLoggedIn(!!data.loggedIn);
        setVerified(!!data.verified);
        setStatus('ready');
      })
      .catch(() => setStatus('ready'));
  }, [draftKey]);

  function updateBody(value: string) {
    setBody(value);
    try {
      if (value) window.localStorage.setItem(draftKey, value);
      else window.localStorage.removeItem(draftKey);
    } catch {
      // 無視。
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // 無視。
    }
  }

  async function submitDirect() {
    setSubmitState('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/expert/public-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility_type: facilityType, facility_no: facilityNo, facility_name: facilityName, body, author_label: authorLabel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '送信に失敗しました。時間をおいて再度お試しください。');
        setSubmitState('error');
        return;
      }
      clearDraft();
      setPublishedNow(!!data.published);
      setSubmitState('done');
    } catch {
      setErrorMessage('送信に失敗しました。時間をおいて再度お試しください。');
      setSubmitState('error');
    }
  }

  async function submitWithRegistration() {
    if (!reg.email || !reg.password || !reg.name) {
      setErrorMessage('メールアドレス・パスワード・お名前は必須です');
      setSubmitState('error');
      return;
    }
    setSubmitState('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/expert/public-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_type: facilityType,
          facility_no: facilityNo,
          facility_name: facilityName,
          body,
          author_label: authorLabel,
          registration: reg,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '送信に失敗しました。時間をおいて再度お試しください。');
        setSubmitState('error');
        return;
      }
      clearDraft();
      setPublishedNow(false);
      setSubmitState('done');
    } catch {
      setErrorMessage('送信に失敗しました。時間をおいて再度お試しください。');
      setSubmitState('error');
    }
  }

  if (status === 'loading') return null;

  if (submitState === 'done') {
    return (
      <div className="qtext" style={{ fontSize: 13 }}>
        {publishedNow
          ? '口コミを公開しました。ご協力ありがとうございます。'
          : '口コミを受け付けました。運営による本人確認が完了すると、このページに公開されます。'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <textarea
        className="input"
        rows={3}
        placeholder={`「${facilityName}」について、通われた（通われている）感想を書いてみてください`}
        value={body}
        onChange={(e) => updateBody(e.target.value)}
      />

      {/* 口コミに表示する名前（2026-11-08追加）。プロフィールの名前（お名前・表示名）
          とは別に、口コミごとに名乗れるようにする。学校ページ＝特定の学校という
          文脈の強いページなので、プロフィールと同じ名前だと「どこの子か」が
          特定されやすいという懸念への対応。空欄のままでもよい（その場合は
          プロフィールの表示名が使われる）。 */}
      <input
        className="input"
        placeholder="この口コミに表示する名前（空ならプロフィールの表示名を使用）"
        value={authorLabel}
        onChange={(e) => setAuthorLabel(e.target.value)}
      />
      <div className="muted" style={{ fontSize: 12, marginTop: -4 }}>
        プロフィールの表示名と変えておくと、学校名と組み合わせてもご本人・お子さんが特定されにくくなります。
      </div>

      {errorMessage && (
        <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>
          {errorMessage}
        </div>
      )}

      {loggedIn ? (
        <button
          type="button"
          className="btn-secondary"
          style={{ fontSize: 13, padding: '6px 14px', alignSelf: 'flex-start' }}
          disabled={!body.trim() || submitState === 'sending'}
          onClick={submitDirect}
        >
          {submitState === 'sending' ? '送信中…' : verified ? 'この内容を公開する' : 'この内容を送る'}
        </button>
      ) : !showRegisterForm ? (
        <>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: 13, padding: '6px 14px', alignSelf: 'flex-start' }}
            disabled={!body.trim()}
            onClick={() => setShowRegisterForm(true)}
          >
            経験者として登録して送る
          </button>
          <div className="muted" style={{ fontSize: 12 }}>
            すでに登録済みの方は
            <Link href="/expert/login" style={{ fontWeight: 700 }}>
              ログイン
            </Link>
            してから送ってください。資格をお持ちの専門家としての登録は
            <Link href="/expert/register" style={{ fontWeight: 700 }}>
              こちら
            </Link>
            （書いた内容はこのブラウザに保存されるので、登録後にこのページに戻れば続きから送れます）。
          </div>
        </>
      ) : (
        <>
          <div className="muted" style={{ fontSize: 12 }}>
            登録証の提出は不要です。運営が登録内容を確認し、承認後にこの口コミも公開されます。
          </div>
          <input
            className="input"
            placeholder="お名前（ニックネーム可）"
            value={reg.name}
            onChange={(e) => setReg({ ...reg, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="表示名（未入力ならお名前を表示）"
            value={reg.display_name}
            onChange={(e) => setReg({ ...reg, display_name: e.target.value })}
          />
          <textarea
            className="input"
            rows={2}
            placeholder="簡単な自己紹介（任意）"
            value={reg.bio}
            onChange={(e) => setReg({ ...reg, bio: e.target.value })}
          />
          <input
            className="input"
            type="email"
            placeholder="メールアドレス"
            value={reg.email}
            onChange={(e) => setReg({ ...reg, email: e.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="パスワード（8文字以上）"
            value={reg.password}
            onChange={(e) => setReg({ ...reg, password: e.target.value })}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: 13, padding: '6px 14px', alignSelf: 'flex-start' }}
            disabled={submitState === 'sending'}
            onClick={submitWithRegistration}
          >
            {submitState === 'sending' ? '送信中…' : '登録してこの口コミを送る'}
          </button>
        </>
      )}
    </div>
  );
}
