'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 質問を書き始める前に「同じテーマの相談、もうあるかも」と気づいてもらうための
// タグ一覧。/search と同じ /api/consultations/tag-counts を使い回している。
// タップすると /search にそのキーワードで絞り込んだ状態で遷移する。
export default function AskTagTeaser() {
  const [tags, setTags] = useState<{ word: string; count: number }[]>([]);

  useEffect(() => {
    fetch('/api/consultations/tag-counts')
      .then((r) => r.json())
      .then((d) => setTags(d.tags || []))
      .catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  return (
    <div style={{ marginBottom: 4 }}>
      <div className="muted" style={{ marginBottom: 8 }}>
        書く前に、こんな相談も見てみませんか？
      </div>
      <div className="chip-row">
        {tags.map((t) => (
          <Link
            key={t.word}
            href={`/search?q=${encodeURIComponent(t.word)}`}
            className="chip"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            #{t.word}（{t.count}）
          </Link>
        ))}
      </div>
    </div>
  );
}
