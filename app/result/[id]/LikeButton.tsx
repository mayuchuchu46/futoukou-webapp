'use client';

import { useState } from 'react';
import { getUid } from '@/lib/uid';

// 一覧カード（ConsultationCard）には既にある「参考になった」ボタンを、
// 詳細ページ（/result/[id]）にも追加する（2026-10-12、「各質問と回答ページにも
// 参考になった・閲覧の数表示があったほうがいい」との指摘を受けて追加）。
// 閲覧数（views）はサーバー側で描画済み（ResultPage側のEyeIcon表示）なので、
// ここでは「参考になった」の増減だけを担当する。ロジック・API（/api/like）は
// ConsultationCardと共通。
export default function LikeButton({ id, initialLikes, initialLikedBy }: {
  id: string;
  initialLikes: number;
  initialLikedBy: string[];
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [likedBy, setLikedBy] = useState<string[]>(initialLikedBy || []);
  const uid = typeof window !== 'undefined' ? getUid() : '';
  const liked = likedBy.includes(uid);

  async function toggleLike() {
    const nowLiked = !liked;
    setLikes((n) => n + (nowLiked ? 1 : -1));
    setLikedBy((list) => (nowLiked ? [...list, uid] : list.filter((u) => u !== uid)));
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, uid, liked: nowLiked }),
    }).catch(() => {});
  }

  return (
    <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
      参考になった {likes}人
    </button>
  );
}
