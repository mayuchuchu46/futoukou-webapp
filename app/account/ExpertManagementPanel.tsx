'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';

type Expert = { id: string; name: string; credential: string };

// 旧/expert/dashboardの回答キュー・回答済み一覧（DashboardClient.tsx）を、
// アカウントページに統合するために切り出したもの（2026-11-01、「アカウントページに、
// 専門家や保護者の管理内容も入れ込んじゃえばいい」との方針を受けて）。
// 元のapp-shell・headerは/accountの外枠と重複するため持ち込まず、カード類だけを出す。
export default function ExpertManagementPanel({
  expert,
  pending,
  answeredByMe,
  consultRequestCount = 0,
}: {
  expert: Expert;
  pending: Consultation[];
  answeredByMe: Consultation[];
  // 「この方に直接相談をリクエストする」が押された件数。オンライン相談リンク
  // （online_consult_url）を設定済みの場合は常に0（呼び出し側で判定済み）。
  consultRequestCount?: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(pending);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const ANSWERED_PAGE_SIZE = 3;
  const [answeredVisibleCount, setAnsweredVisibleCount] = useState(ANSWERED_PAGE_SIZE);

  async function submitAnswer(id: string) {
    const answer = drafts[id];
    if (!answer || !answer.trim()) return;
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
    router.refresh();
  }

  return (
    <>
      <div className="card" style={{ gap: 6 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700 }}>{expert.credential}として登録中</div>
          <button type="button" className="btn-ghost" onClick={logout} style={{ fontSize: 12 }}>
            専門家としてログアウト
          </button>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>{expert.name}さん</div>
        <div className="row">
          <a href="/expert/profile" className="btn-ghost">プロフィールを編集</a>
          <a href="/expert/earnings" className="btn-ghost">報酬を見る</a>
        </div>
      </div>

      {/* 「この方に直接相談をリクエストする」の件数（2026-11-01追加）。回答した相談から
          読者がこのボタンを押すと、オンライン相談リンクが未設定の間はここに溜まる。
          設定すれば以降は読者が直接そのリンクへ誘導されるようになる。 */}
      {consultRequestCount > 0 && (
        <div className="card" style={{ gap: 6, background: 'var(--sub)' }}>
          <div style={{ fontWeight: 700 }}>
            直接相談をリクエストした方が{consultRequestCount}人います
          </div>
          <div className="qtext" style={{ fontSize: 13 }}>
            オンライン相談のリンク（MOSH等のご自身の予約・決済ページ）を設定すると、以降はリクエストした方を直接そちらへご案内できます。
          </div>
          <a href="/expert/profile" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
            オンライン相談のリンクを設定する
          </a>
        </div>
      )}

      <div style={{ fontWeight: 700, marginTop: 8 }}>回答待ちの相談（{items.length}件）</div>
      {items.length === 0 && <div className="muted">今は回答待ちの相談はありません。</div>}
      {items.map((item) => {
        const cat = CATS[item.category] || CATS.other;
        return (
          <div key={item.id} className="card">
            <div className="row">
              <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
              {item.requested_expert_id === expert.id && (
                <span className="muted" style={{ fontWeight: 700 }}>あなた指名の相談</span>
              )}
              {metaLabel(item) && <span className="muted">{metaLabel(item)}</span>}
            </div>
            <div className="qtext">{item.question}</div>
            {/* 2026-11-01、専門家への質問をAI回答つきの相談に統合したのに伴い、AIが
                既にどう答えているかをここに表示する（以前はrequest_type==='expert'の
                相談にAI回答が存在しなかったため、質問文だけが出ていた）。専門家・
                先輩保護者がAIの回答を踏まえて、それに付け足す形で回答しやすくする。 */}
            {item.answer && (
              <div className="muted" style={{ fontSize: 13, background: 'var(--bg)', borderRadius: 8, padding: '8px 10px', whiteSpace: 'pre-wrap' }}>
                <span style={{ fontWeight: 700 }}>AIの回答：</span>
                {item.answer}
              </div>
            )}
            <textarea
              className="input"
              rows={6}
              placeholder="回答を入力してください"
              value={drafts[item.id] || ''}
              onChange={(e) => setDrafts({ ...drafts, [item.id]: e.target.value })}
            />
            <button
              className="btn-primary"
              disabled={submitting === item.id || !(drafts[item.id] || '').trim()}
              onClick={() => submitAnswer(item.id)}
            >
              {submitting === item.id ? '送信中…' : '回答を送信する'}
            </button>
          </div>
        );
      })}

      <div style={{ fontWeight: 700, marginTop: 16 }}>自分が回答した相談（直近20件）</div>
      {answeredByMe.length === 0 && <div className="muted">まだ回答した相談はありません。</div>}
      {answeredByMe.slice(0, answeredVisibleCount).map((item) => {
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
      {answeredVisibleCount < answeredByMe.length && (
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setAnsweredVisibleCount((n) => n + ANSWERED_PAGE_SIZE)}
        >
          もっと見る（残り{answeredByMe.length - answeredVisibleCount}件）
        </button>
      )}
    </>
  );
}
