'use client';

import Link from 'next/link';
import { getUid } from '@/lib/uid';

// 回答ページで、投稿者本人以外に出す「自分も相談してみる」導線（2026-10-22追加）。
// FollowupThread（本人向けのラリー継続）と対になる位置に置き、
// 他人がこのページを見た場合にも相談への入口を提供する。
// prefillにはこの相談の質問文をそのまま渡し、書き換えて使いやすくする。
export default function AskSimilarBlock({
  authorId,
  question,
}: {
  authorId: string;
  question: string;
}) {
  const isOwner = getUid() === authorId;
  if (isOwner) return null;

  const prefill = encodeURIComponent(
    question.length > 120 ? question.slice(0, 120) + '…' : question
  );

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        似たお悩みがありますか？
      </div>
      <div className="qtext" style={{ fontSize: 13 }}>
        子どもの特徴や状況をもう少し教えてもらえると、あなたの状況に合わせた具体的なアドバイスができます。
      </div>
      <Link
        href={`/ask?prefill=${prefill}`}
        className="btn-primary sidebar-ask-btn-pink"
        style={{ textDecoration: 'none', width: '100%' }}
      >
        自分の状況で相談してみる →
      </Link>
    </div>
  );
}
