'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATS } from '@/lib/categories';
import { Consultation, metaLabel } from '@/lib/types';
import { getUid } from '@/lib/uid';
import EyeIcon from './EyeIcon';

export default function ConsultationCard({ item }: { item: Consultation }) {
  const [likes, setLikes] = useState(item.likes);
  const [likedBy, setLikedBy] = useState<string[]>(item.liked_by || []);
  const uid = typeof window !== 'undefined' ? getUid() : '';
  const liked = likedBy.includes(uid);
  const cat = CATS[item.category] || CATS.other;

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = !liked;
    setLikes((n) => n + (nowLiked ? 1 : -1));
    setLikedBy((list) => (nowLiked ? [...list, uid] : list.filter((u) => u !== uid)));
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, uid, liked: nowLiked }),
    });
  }

  return (
    <Link href={`/result/${item.id}`} className="card">
      <div className="row">
        <div className={`cat-badge ${cat.cls}`}>{cat.label}</div>
        {metaLabel(item) && <span className="muted">{metaLabel(item)}</span>}
      </div>
      <div className="qtext">{item.question}</div>
      {item.locked && (
        <div className="locked-hint">🔒 専門家の回答あり・読むには¥500の相談（読み放題特典つき）が必要です</div>
      )}
      <div className="card-foot">
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
          参考になった {likes}人
        </button>
        <span className="view-count"><EyeIcon /> {item.views || 0}</span>
      </div>
    </Link>
  );
}
