'use client';

import { useState } from 'react';
import { getUid } from '@/lib/uid';
import { REACTION_TYPES, ReactionType } from '@/lib/reactions';

// 相談詳細ページの定型リアクション（2026-10-16追加）。「参考になった」
// （LikeButton）が回答の有用性の評価なのに対し、こちらは「自分も同じ気持ち」を
// 軽く伝えるための複数タイプのリアクション。自由記述のコメント欄は今の運営体制だと
// モニタリング負荷・荒れた時のリスクが大きいため見送り、定型文のタップだけにした。
export default function ReactionButtons({
  id,
  initialReactions,
  initialReactedBy,
}: {
  id: string;
  initialReactions: Partial<Record<string, number>>;
  initialReactedBy: Partial<Record<string, string[]>>;
}) {
  const [reactions, setReactions] = useState(initialReactions || {});
  const [reactedBy, setReactedBy] = useState(initialReactedBy || {});
  const uid = typeof window !== 'undefined' ? getUid() : '';

  async function toggle(type: ReactionType) {
    const currentList = reactedBy[type] || [];
    const nowReacted = !currentList.includes(uid);

    setReactions((r) => ({ ...r, [type]: (r[type] || 0) + (nowReacted ? 1 : -1) }));
    setReactedBy((rb) => ({
      ...rb,
      [type]: nowReacted ? [...currentList, uid] : currentList.filter((u) => u !== uid),
    }));

    await fetch('/api/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, uid, type, reacted: nowReacted }),
    }).catch(() => {});
  }

  return (
    <div className="reaction-row">
      {REACTION_TYPES.map(({ key, emoji, label }) => {
        const count = reactions[key] || 0;
        const active = (reactedBy[key] || []).includes(uid);
        return (
          <button
            key={key}
            className={`reaction-btn ${active ? 'active' : ''}`}
            onClick={() => toggle(key)}
          >
            <span className="reaction-emoji">{emoji}</span>
            {label}
            {count > 0 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
