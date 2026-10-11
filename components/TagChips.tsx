'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 他のテーマへの回遊導線として使うタグ一覧。
// lib/searchTags.ts の候補語のうち、実際の投稿に含まれているものだけを
// 件数付きで /api/consultations/tag-counts から取得して表示する。
// タップすると /search にそのキーワードで絞り込んだ状態で遷移する。
export default function TagChips({ title }: { title: string }) {
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
        {title}
      </div>
      <div className="chip-row">
        {tags.map((t) => (
          <Link
            key={t.word}
            href={`/?q=${encodeURIComponent(t.word)}`}
            className="chip chip-tag"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            #{t.word}（{t.count}）
          </Link>
        ))}
      </div>
    </div>
  );
}
