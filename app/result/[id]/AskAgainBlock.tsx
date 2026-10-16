'use client';

import Link from 'next/link';
import { getUid } from '@/lib/uid';

// 回答を見た後、「このまま終わり」にならないよう、もう一度（別の内容で）相談できる
// ことを案内するブロック（2026-10-14追加）。「他人のページでの『もう一度相談する』
// ボタンは出てこなくていい」との指摘を受け、投稿者本人（同じブラウザのauthor_id）
// にだけ表示するようにクライアントコンポーネント化した（2026-10-16）。
export default function AskAgainBlock({ authorId }: { authorId: string }) {
  if (getUid() !== authorId) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 6 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>続きが気になること、他にもありますか？</div>
      <div className="qtext" style={{ fontSize: 13 }}>
        状況は日々変わるものです。気になることが出てきたら、また相談してみてください。
      </div>
      <Link className="btn-secondary" href="/ask">
        もう一度相談する
      </Link>
    </div>
  );
}
