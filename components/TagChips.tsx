'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getThemeDisplayLabel } from '@/lib/searchTags';

// 他のテーマへの回遊導線として使うタグ一覧。
// lib/searchTags.ts の候補語のうち、実際の投稿に含まれているものだけを
// 件数付きで /api/consultations/tag-counts から取得して表示する。
// タップすると /search にそのキーワードで絞り込んだ状態で遷移する。
export default function TagChips({
  title,
  // ホーム画面（気になるテーマから探す）は横スクロールのチップ列のままにし、
  // 相談詳細ページ下部（他にもこんなテーマの相談があります）だけ、全件を
  // 折り返して一覧で見せたいとの要望（2026-10-13）に応えるためのフラグ。
  wrap = false,
}: {
  // スマホのホーム画面では見出しテキストが不要とのことで省略可にした
  // （2026-10-15）。省略時は見出し行自体を出さない。
  title?: string;
  wrap?: boolean;
}) {
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
      {title && (
        <div className="muted" style={{ marginBottom: 8 }}>
          {title}
        </div>
      )}
      <div className={wrap ? 'chip-row chip-row-wrap' : 'chip-row'}>
        {tags.map((t) => (
          <Link
            key={t.word}
            href={`/?q=${encodeURIComponent(t.word)}`}
            className="chip chip-tag"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            {/* t.word自体は/api/consultations/tag-countsが返すcanonical word
                （例：不登校特例校）。画面表示だけgetThemeDisplayLabelで置き換える
                （2026-10-19、「#不登校特例校というタグ、これは違うよね」との
                指摘を受けて修正。遷移先の/?q=クエリはcanonical wordのままにする）。 */}
            #{getThemeDisplayLabel(t.word)}（{t.count}）
          </Link>
        ))}
      </div>
    </div>
  );
}
