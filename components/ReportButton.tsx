'use client';

import { useState } from 'react';
import { getUid } from '@/lib/uid';

// 一覧カード（ConsultationCard）・詳細ページ（/result/[id]）の両方から使う、
// 「通報する」ボタン。likeとは違い取り消し不要なので一方向のみ。クリック後は
// 確認を一度挟み、送信したら「ご報告ありがとうございました」に変えて押せなくする
// （誤タップ対策＋多重送信防止。2026-10-12追加）。
export default function ReportButton({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'confirming' | 'sending' | 'done'>('idle');

  async function send() {
    setState('sending');
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, uid: getUid() }),
      });
    } finally {
      setState('done');
    }
  }

  if (state === 'done') {
    return <span className="report-btn report-btn--done">ご報告ありがとうございました</span>;
  }

  if (state === 'confirming' || state === 'sending') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="muted" style={{ fontSize: 12 }}>この相談を通報しますか？</span>
        <button
          type="button"
          className="report-btn"
          disabled={state === 'sending'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            send();
          }}
        >
          {state === 'sending' ? '送信中…' : '通報する'}
        </button>
        <button
          type="button"
          className="report-btn-cancel"
          disabled={state === 'sending'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setState('idle');
          }}
        >
          キャンセル
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="report-btn"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setState('confirming');
      }}
    >
      ⚠ 通報する
    </button>
  );
}
