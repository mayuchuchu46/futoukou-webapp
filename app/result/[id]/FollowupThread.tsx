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
  initialFollowups,
}: {
  parentId: string;
  initialFollowups: FollowupItem[];
}) {
  const [items, setItems] = useState<FollowupItem[]>(initialFollowups);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      <div className="answer-label" style={{ fontSize: 14 }}>この回答について、続けて話す</div>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {items.map((f) => (
            <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="qtext" style={{ fontSize: 13, fontWeight: 700 }}>あなた：{f.question}</div>
              <div className="qtext" style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>どうする先生：{f.answer}</div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
