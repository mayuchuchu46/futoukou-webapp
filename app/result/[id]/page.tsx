'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CATS } from '@/lib/categories';
import { Consultation, Comment } from '@/lib/types';
import { getUid } from '@/lib/uid';

function ResultInner() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<Consultation | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function load() {
    const res = await fetch(`/api/consultations`);
    const data = await res.json();
    const found = (data.consultations || []).find((c: Consultation) => c.id === id);
    if (found) {
      setItem(found);
    } else {
      setNotFound(true);
    }
  }

  async function loadComments() {
    const res = await fetch(`/api/comments?consultation_id=${id}`);
    const data = await res.json();
    setComments(data.comments || []);
  }

  useEffect(() => {
    load();
    loadComments();
  }, [id]);

  async function sendComment() {
    if (!commentText.trim()) return;
    setSending(true);
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: id, author_id: getUid(), body: commentText }),
    });
    setCommentText('');
    await loadComments();
    setSending(false);
  }

  if (notFound) {
    return (
      <div className="app-shell">
        <Header supervised={false} />
        <div className="main">
          <div className="muted">相談が見つかりませんでした。</div>
          <button className="btn-secondary" onClick={() => router.push('/')}>ホームへ</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="app-shell">
        <Header supervised={false} />
        <div className="main">
          <div className="muted">読み込み中…</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const cat = CATS[item.category] || CATS.other;

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <div className={`cat-badge ${cat.cls}`} style={{ alignSelf: 'flex-start' }}>{cat.label}</div>

        <div className="card">
          <div className="muted">質問</div>
          <div className="qtext">{item.question}</div>
        </div>

        <div className="card">
          <div className="answer-label">
            <img src="/assets/icon_bulb.png" alt="" />
            どうする先生の回答・次にやること
          </div>
          <div className="qtext" style={{ whiteSpace: 'pre-wrap' }}>{item.answer}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>みんなのコメント（{comments.length}件）</div>
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>🙂</div>
              <div className="card" style={{ flex: 1, padding: '12px 14px' }}>
                <div className="qtext" style={{ fontSize: 13 }}>{c.body}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--border)', borderRadius: 999, padding: '8px 14px' }}>
            <input
              className="input"
              style={{ border: 'none', padding: 0 }}
              placeholder="コメントを書く…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
            />
            <button onClick={sendComment} disabled={sending} style={{ background: 'none', border: 'none', color: 'var(--main)', fontWeight: 700 }}>
              送信
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultInner />
    </Suspense>
  );
}
