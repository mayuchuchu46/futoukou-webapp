'use client';

import { useState } from 'react';
import { getUid } from '@/lib/uid';

// 「みんなのデータ」の任意コメント用の通報ボタン（2026-10-17追加）。
// components/ReportButton.tsxと同じ一方向の確認フロー（idle→confirming→sending→done）
// だが、送り先が/api/daily-question/comment-report、対象がdaily_answersの1行
// （コメント）である点だけが違う。
export default function CommentReportButton({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'confirming' | 'sending' | 'done'>('idle');

  async function send() {
    setState('sending');
    try {
      await fetch('/api/daily-question/comment-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, uid: getUid() }),
      });
    } finally {
      setState('done');
    }
  }

  if (state === 'done') {
    return <span className="muted" style={{ fontSize: 11 }}>ご報告ありがとうございました</span>;
  }

  if (state === 'confirming' || state === 'sending') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="muted" style={{ fontSize: 11 }}>このコメントを通報しますか？</span>
        <button
          type="button"
          className="report-btn"
          disabled={state === 'sending'}
          onClick={() => send()}
        >
          {state === 'sending' ? '送信中…' : '通報する'}
        </button>
        <button
          type="button"
          className="report-btn-cancel"
          disabled={state === 'sending'}
          onClick={() => setState('idle')}
        >
          キャンセル
        </button>
      </span>
    );
  }

  return (
    <button type="button" className="report-btn" style={{ fontSize: 11 }} onClick={() => setState('confirming')}>
      ⚠ 通報する
    </button>
  );
}
