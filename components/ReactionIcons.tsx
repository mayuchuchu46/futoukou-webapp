'use client';

import { useState } from 'react';
import { getUid } from '@/lib/uid';
import { REACTION_TYPES } from '@/lib/reactions';

// 相談詳細ページ（app/result/[id]/ReactionButtons.tsx）の定型リアクションを、
// 一覧カード（ConsultationCard）でも使えるように、絵文字＋件数だけの省スペース版
// として切り出した（2026-10-16、「詳細ページだけじゃなくトップにもその数
// 表示されたりボタン押されるといい、絵文字だけでも」との指摘を受けて追加）。
// カード自体がLink（/result/[id]への遷移）なので、ボタン押下時は
// 既存のtoggleLike・goToTagと同じくpreventDefault/stopPropagationで
// カード遷移を止める。
// types・endpointはconsultations向け（lib/reactions.ts・/api/react）がデフォルト。
// 他テーブル向け（例：gohoubi_posts向けのlib/gohoubiReactions.ts・
// /api/gohoubi-voices/react）には呼び出し側で指定する（2026-11-14追加）。
export default function ReactionIcons({
  id,
  initialReactions,
  initialReactedBy,
  types = REACTION_TYPES,
  endpoint = '/api/react',
}: {
  id: string;
  initialReactions: Partial<Record<string, number>>;
  initialReactedBy: Partial<Record<string, string[]>>;
  types?: { key: string; emoji: string; label: string }[];
  endpoint?: string;
}) {
  const [reactions, setReactions] = useState(initialReactions || {});
  const [reactedBy, setReactedBy] = useState(initialReactedBy || {});
  const uid = typeof window !== 'undefined' ? getUid() : '';

  async function toggle(e: React.MouseEvent, type: string) {
    e.preventDefault();
    e.stopPropagation();
    const currentList = reactedBy[type] || [];
    const nowReacted = !currentList.includes(uid);

    setReactions((r) => ({ ...r, [type]: (r[type] || 0) + (nowReacted ? 1 : -1) }));
    setReactedBy((rb) => ({
      ...rb,
      [type]: nowReacted ? [...currentList, uid] : currentList.filter((u) => u !== uid),
    }));

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, uid, type, reacted: nowReacted }),
    }).catch(() => {});
  }

  return (
    <>
      {types.map(({ key, emoji }) => {
        const count = reactions[key] || 0;
        const active = (reactedBy[key] || []).includes(uid);
        return (
          <button
            key={key}
            className={`reaction-icon-btn ${active ? 'active' : ''}`}
            onClick={(e) => toggle(e, key)}
          >
            {emoji}
            <span className="reaction-icon-count">{count}</span>
          </button>
        );
      })}
    </>
  );
}
