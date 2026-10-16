'use client';

import { useState } from 'react';
import { getUid } from '@/lib/uid';

type FollowupItem = {
  id: string;
  question: string;
  answer: string;
};

// AIの回答に対して、その場で返信（ラリー）できる機能のUI（2026-10-16追加）。
// 「AIの返事に対して違うことを言いたくて、もう一度相談ボタンを押すと、前回の
// テキストが残っていて書き直しになる」という指摘から、新規相談として一から
// 書き直すのではなく、この相談の続きとしてその場で返信できるようにした。
// 送信すると/api/consult-followupを呼び、できた「続き」をこのスレッドの末尾に足す。
// このやりとり自体はparent_idを持つ続きとして保存され、ホーム・一覧には出ない
// （lib/consultations.ts参照）。
export default function FollowupThread({
  parentId,
  authorId,
  initialFollowups,
}: {
  parentId: string;
  authorId: string;
  initialFollowups: FollowupItem[];
}) {
  const [items, setItems] = useState<FollowupItem[]>(initialFollowups);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 「他人の質問回答に、続けて質問が出てくるのは変」との指摘を受けて追加
  // （2026-10-16）。返信（ラリー）は元の相談を書いた本人（同じブラウザ・端末）だけが
  // 続けられる機能で、/api/consult-followup側でも本人確認（author_id一致）を
  // 行っているため、他人には入力欄・ボタンを出さない。やりとり自体は相談の一部として
  // 既に公開されている内容なので、他人にも閲覧はできるが、返信できるのは本人のみ。
  const isOwner = getUid() === authorId;

  if (!isOwner && items.length === 0) return null;

  async function submit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/consult-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parentId, text, author_id: getUid() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '失敗しました');
      setItems((list) => [...list, { id: data.consultation.id, question: data.consultation.question, answer: data.consultation.answer }]);
      setText('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {isOwner ? 'この回答について、続けて話す' : '続けてのやりとり'}
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {items.map((f) => (
            <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="qtext" style={{ fontSize: 13, fontWeight: 700 }}>{isOwner ? 'あなた' : '相談者'}：{f.question}</div>
              <div className="qtext" style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>どうする先生：{f.answer}</div>
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <>
          <textarea
            className="input"
            rows={3}
            placeholder="この回答への返信・言いたいことを書いてください"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <div className="muted" style={{ color: '#C0392B', fontSize: 12 }}>{error}</div>}
          <button className="btn-secondary" disabled={!text.trim() || submitting} onClick={submit}>
            {submitting ? 'どうする先生が考えています…' : 'この内容で返信する'}
          </button>
        </>
      )}
    </div>
  );
}
