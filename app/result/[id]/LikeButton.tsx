'use client';

import { useState } from 'react';
import { getUid } from '@/lib/uid';

// 一覧カード（ConsultationCard）には既にある「参考になった」ボタンを、
// 詳細ページ（/result/[id]）にも追加する（2026-10-12、「各質問と回答ページにも
// 参考になった・閲覧の数表示があったほうがいい」との指摘を受けて追加）。
// 閲覧数（views）はサーバー側で描画済み（ResultPage側のEyeIcon表示）なので、
// ここでは「参考になった」の増減だけを担当する。ロジック・API（/api/like）は
// ConsultationCardと共通。
// pill: true で、定型リアクション（ReactionButtons、lib/reactions.ts）と
// 横一列に並べるための見た目（.reaction-btn、枠のあるピル型）に切り替える
// （2026-10-16、「わかる・うちも同じ・応援・参考になった の4つ表示どう？」との
// 相談を受けて、同じ行に統合）。一覧カード側の見た目（.like-btn）は変えないため
// デフォルトはfalseのまま。
export default function LikeButton({ id, initialLikes, initialLikedBy, pill = false }: {
  id: string;
  initialLikes: number;
  initialLikedBy: string[];
  pill?: boolean;
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

  if (pill) {
    return (
      <button className={`reaction-btn ${liked ? 'active' : ''}`} onClick={toggleLike}>
        <span className="reaction-emoji">👍</span>
        参考になった
        <span className="reaction-count">{likes}</span>
      </button>
    );
  }

  return (
    <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
      参考になった {likes}人
    </button>
  );
}
