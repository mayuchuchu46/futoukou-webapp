'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { relativeTimeLabel } from '@/lib/relativeTime';

type Post = { id: string; text: string; encouragement: string; created_at: string };

// ホームの相談一覧（ConsultationCardの並び）に、さりげなく1件だけ混ぜる
// 「親のご褒美クラブ」最新投稿カード（2026-11-14追加）。「TOPのフィードにも
// さりげなくこの投稿の回答だけのせたい」との要望を受けて、ConsultationCardの
// 一覧とは別枠の、見た目を合わせた軽量カードとして実装した。相談本体
// （consultations）には一切手を加えず、/api/gohoubi-voicesの最新1件だけを
// 表示する。投稿が無い・取得前はカード自体を出さない（空の枠を見せない）。
export default function GohoubiFeedCard() {
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch('/api/gohoubi-voices')
      .then((res) => res.json())
      .then((data) => setPost(data?.posts?.[0] || null))
      .catch(() => {});
  }, []);

  if (!post) return null;

  return (
    <Link href="/gohoubi/voices" className="card consultation-card" style={{ background: 'var(--sub)', border: '1.5px dashed var(--main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <span
          style={{
            display: 'inline-block',
            fontWeight: 800,
            fontSize: 12,
            color: '#fff',
            background: 'var(--main)',
            padding: '2px 9px',
            borderRadius: 6,
          }}
        >
          🎁 親のご褒美クラブ
        </span>
        <span className="muted" style={{ fontSize: 11 }}>{relativeTimeLabel(post.created_at)}</span>
      </div>
      <div className="qtext" style={{ marginTop: 6 }}>{post.text}</div>
      {post.encouragement && (
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{post.encouragement}</div>
      )}
    </Link>
  );
}
