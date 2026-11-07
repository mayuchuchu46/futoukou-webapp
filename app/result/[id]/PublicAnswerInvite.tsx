'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 公開側の結果ページに、まだ登録していない専門家・経験者がその場で回答を書き、
// その場で簡易登録もできる導線（2026-11-07追加）。
// 「これを読んだ経験者や専門家がコメント入れるみたいな、その流れで登録するみたいな」
// 「でも、登録するのハードルたかいよね、経験者はすぐできるといいんだけど」との要望を
// 受けて追加。書く行為自体は登録前でもできるが、送信後は運営の本人確認が済むまで
// 内容を公開しない（/api/expert/public-answer参照）。これにより、書く体験の
// 手軽さと、保護者が読む内容の安全性（事前の人による確認）を両方成立させている。
//
// このテキストはブラウザのlocalStorageに下書き保存する（相談者本人向けの各種
// 下書き保存と同じ仕組み）。未登録のまま書いた内容は、専門家として本登録
// （資格の提出が必要）する場合でもこのページに戻ってくれば残っているため、
// 「経験者としてその場で簡易登録」以外の経路を選んでも内容が失われない。
export default function PublicAnswerInvite({ consultationId }: { consultationId: string }) {
  const draftKey = `dsk_public_answer_draft_${consultationId}`;

  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [loggedIn, setLoggedIn] = useState(false);
  const [verified, setVerified] = useState(false);

  const [answer, setAnswer] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [reg, setReg] = useState({ email: '', password: '', name: '', display_name: '', bio: '' });

  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [publishedNow, setPublishedNow] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftKey);
      if (saved) setAnswer(saved);
    } catch {
      // localStorageが使えない環境（プライベートモード等）でも、入力自体は
      // 問題なく行えるため無視する。
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

  function updateAnswer(value: string) {
    setAnswer(value);
    try {
      if (value) window.localStorage.setItem(draftKey, value);
      else window.localStorage.removeItem(draftKey);
    } catch {
      // 無視（上と同じ理由）。
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
      const res = await fetch('/api/expert/public-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultation_id: consultationId, answer }),
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
      const res = await fetch('/api/expert/public-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultation_id: consultationId, answer, registration: reg }),
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
      <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>専門家・経験者の方へ</div>
        <div className="qtext" style={{ fontSize: 13 }}>
          {publishedNow
            ? '回答を公開しました。ご協力ありがとうございます。'
            : '回答を受け付けました。運営による本人確認が完了すると、このページに公開されます。'}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>専門家・経験者の方へ</div>
      <div className="qtext" style={{ fontSize: 13 }}>
        この相談を読んで、あなたの言葉で回答してみませんか。
        {!loggedIn && '未登録でもここに書けますが、'}
        {loggedIn && !verified && '本人確認が完了するまでは、'}
        運営の確認を経てからこのページに公開されます。
      </div>

      <textarea
        className="input"
        rows={4}
        placeholder="この相談への回答を書いてみてください"
        value={answer}
        onChange={(e) => updateAnswer(e.target.value)}
      />

      {errorMessage && (
        <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>
          {errorMessage}
        </div>
      )}

      {loggedIn ? (
        <button
          type="button"
          className="btn-secondary"
          disabled={!answer.trim() || submitState === 'sending'}
          onClick={submitDirect}
        >
          {submitState === 'sending' ? '送信中…' : verified ? 'この内容を公開する' : 'この内容を送る'}
        </button>
      ) : !showRegisterForm ? (
        <>
          <button
            type="button"
            className="btn-secondary"
            disabled={!answer.trim()}
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
            登録証の提出は不要です。運営が登録内容を確認し、承認後にこの回答も公開されます。
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
            disabled={submitState === 'sending'}
            onClick={submitWithRegistration}
          >
            {submitState === 'sending' ? '送信中…' : '登録してこの回答を送る'}
          </button>
        </>
      )}
    </div>
  );
}
