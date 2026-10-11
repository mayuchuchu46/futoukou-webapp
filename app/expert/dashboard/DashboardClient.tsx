'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';

type Expert = { id: string; name: string; credential: string };

const MIN_ANSWER_LENGTH = 150;

export default function DashboardClient({
  expert,
  pending,
  answeredByMe,
}: {
  expert: Expert;
  pending: Consultation[];
  answeredByMe: Consultation[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(pending);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function submitAnswer(id: string) {
    const answer = drafts[id];
    if (!answer || answer.trim().length < MIN_ANSWER_LENGTH) return;
    setSubmitting(id);
    const res = await fetch('/api/expert/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: id, answer }),
    });
    setSubmitting(null);
    if (res.ok) {
      setItems((list) => list.filter((it) => it.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || '送信に失敗しました');
    }
  }

  async function logout() {
    await fetch('/api/expert/logout', { method: 'POST' });
    router.push('/expert/login');
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div className="header-row">
          <div style={{ fontWeight: 700, fontSize: 16 }}>専門家ダッシュボード</div>
          <button className="btn-ghost" onClick={logout}>ログアウト</button>
        </div>
        <div className="muted">{expert.credential}・{expert.name}さん</div>
      </div>

      <div className="main">
        <div className="row">
          <a href="/expert/profile" className="btn-ghost">プロフィールを編集</a>
          <a href="/expert/earnings" className="btn-ghost">報酬を見る</a>
        </div>

        <div style={{ fontWeight: 700, marginTop: 8 }}>回答待ちの相談（{items.length}件）</div>
        {items.length === 0 && <div className="muted">今は回答待ちの相談はありません。</div>}
        {items.map((item) => {
          const cat = CATS[item.category] || CATS.other;
          return (
            <div key={item.id} className="card">
              <div className="row">
                <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
                {metaLabel(item) && <span className="muted">{metaLabel(item)}</span>}
              </div>
              <div className="qtext">{item.question}</div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
                良い回答の目安：①状況の受け止め（共感・ねぎらい）→②具体的な「次の一手」（今日・今週できること）→③注意点や見守りのポイント、の順で書くと伝わりやすいです。
              </div>
              <textarea
                className="input"
                rows={6}
                placeholder={`状況の受け止め→具体的な「次の一手」→注意点、の順で回答してください（${MIN_ANSWER_LENGTH}文字以上）`}
                value={drafts[item.id] || ''}
                onChange={(e) => setDrafts({ ...drafts, [item.id]: e.target.value })}
              />
              <div className="muted" style={{ textAlign: 'right', fontSize: 12 }}>
                {(drafts[item.id] || '').trim().length} / {MIN_ANSWER_LENGTH}文字以上
              </div>
              <button
                className="btn-primary"
                disabled={submitting === item.id || (drafts[item.id] || '').trim().length < MIN_ANSWER_LENGTH}
                onClick={() => submitAnswer(item.id)}
              >
                {submitting === item.id ? '送信中…' : '回答を送信する'}
              </button>
            </div>
          );
        })}

        <div style={{ fontWeight: 700, marginTop: 16 }}>自分が回答した相談（直近20件）</div>
        {answeredByMe.length === 0 && <div className="muted">まだ回答した相談はありません。</div>}
        {answeredByMe.map((item) => {
          const cat = CATS[item.category] || CATS.other;
          return (
            <div key={item.id} className="card">
              <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
              <div className="qtext">{item.question}</div>
              <div className="answer-label">回答内容</div>
              <div className="qtext">{item.expert_answer}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
