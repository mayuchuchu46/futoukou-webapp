'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { relativeTimeLabel } from '@/lib/relativeTime';
import ReportButton from '@/components/ReportButton';
import ReactionIcons from '@/components/ReactionIcons';
import { GOHOUBI_REACTION_TYPES } from '@/lib/gohoubiReactions';

type Suggestion = { title: string; category: string; reason: string };
type Post = {
  id: string;
  text: string;
  encouragement: string;
  suggestions: Suggestion[];
  reactions: Partial<Record<string, number>>;
  reacted_by: Partial<Record<string, string[]>>;
  created_at: string;
};

// 「みんなのご褒美」一覧ページ（2026-11-14追加）。/gohoubiへの投稿（gohoubi_posts）を
// 新しい順に流す、別枠の専用ページ。本体（/gohoubi）の入力フローとは分け、
// 「せっかくの投稿をTOP/別ページで流したい」という要望を満たしつつ、本体の
// 入力画面自体は従来どおりシンプルに保つ。
export default function VoicesClient() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/gohoubi-voices')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setError('読み込みに失敗しました'));
  }, []);

  return (
    <>
      <div style={{ margin: '14px 0 10px' }}>
        <div
          style={{
            display: 'inline-block',
            fontWeight: 800,
            fontSize: 19,
            color: '#fff',
            background: 'var(--main)',
            padding: '3px 12px',
            borderRadius: 8,
            letterSpacing: '0.02em',
          }}
        >
          みんなのご褒美
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          同じように頑張っている人の投稿と、AIからの一言です
        </div>
      </div>

      <Link href="/gohoubi" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 14 }}>
        自分にもご褒美を提案してもらう
      </Link>

      {error && <div style={{ color: 'var(--seal-text)', fontSize: 13 }}>{error}</div>}
      {posts === null && !error && <div className="muted" style={{ fontSize: 13 }}>読み込み中…</div>}
      {posts !== null && posts.length === 0 && (
        <div className="muted" style={{ fontSize: 13 }}>まだ投稿がありません。</div>
      )}

      {posts?.map((p) => (
        <div className="card" key={p.id} style={{ alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <div className="muted" style={{ fontSize: 11 }}>{relativeTimeLabel(p.created_at)}</div>
          <div className="qtext">{p.text}</div>
          {p.encouragement && (
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '2px solid var(--main)',
                background: 'var(--sub)',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              {p.encouragement}
            </div>
          )}
          {p.suggestions?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.suggestions.map((s, i) => (
                <span key={i} className="cat-badge" style={{ background: 'var(--sub)', color: '#1F4A3C' }}>
                  {s.title}
                </span>
              ))}
            </div>
          )}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <ReactionIcons
                id={p.id}
                initialReactions={p.reactions}
                initialReactedBy={p.reacted_by}
                types={GOHOUBI_REACTION_TYPES}
                endpoint="/api/gohoubi-voices/react"
              />
            </div>
            <ReportButton id={p.id} endpoint="/api/gohoubi-voices/report" />
          </div>
        </div>
      ))}

      <div className="muted" style={{ fontSize: 11.5, textAlign: 'center', margin: '20px 0' }}>
        投稿は匿名で表示されます。不適切な内容は「通報する」からお知らせください。
      </div>
    </>
  );
}
