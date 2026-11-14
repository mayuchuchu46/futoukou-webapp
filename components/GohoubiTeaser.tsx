'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 「親のご褒美クラブ」（/gohoubi）への誘導バナー。components/KotobaTeaser.tsxと
// 同じ見た目・パターンで実装（2026-11-10追加）。
//
// [2026-11-14追加] サイト全体（ホーム本文・PCサイドの両方、PcSidebar経由で
// ほぼ全ページ）に出るバナーのため、「せっかくの投稿をTOPで流したい」という
// 要望を、ここに「みんなのご褒美」最新1件のプレビューを出す形で反映した。
// 取得できた場合はそのプレビュー文言に差し替え、リンク先も一覧ページ
// （/gohoubi/voices）に変える。未取得・0件の間は従来どおり静的な説明文と
// /gohoubiへのリンクのまま（壊れた見た目にしない）。
export default function GohoubiTeaser() {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gohoubi-voices')
      .then((res) => res.json())
      .then((data) => {
        const latest = data?.posts?.[0];
        if (latest?.encouragement) setPreview(latest.encouragement);
      })
      .catch(() => {});
  }, []);

  return (
    <Link
      href={preview ? '/gohoubi/voices' : '/gohoubi'}
      className="card home-gohoubi-link"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        margin: '0 0 10px',
        padding: '10px 14px',
        border: '2px solid var(--main)',
        background: 'linear-gradient(135deg, #ffffff 0%, var(--sub) 160%)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span style={{ flex: '0 0 auto', fontSize: 22, lineHeight: 1 }}>🎁</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'inline-block',
            fontWeight: 800,
            fontSize: 15,
            color: '#fff',
            background: 'var(--main)',
            padding: '2px 9px',
            borderRadius: 6,
            letterSpacing: '0.02em',
          }}
        >
          親のご褒美クラブ
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 11.5,
            color: 'var(--muted)',
            marginTop: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {preview || '今日の頑張りを入れると、ご褒美を提案します'}
        </span>
      </span>
      <span style={{ flex: '0 0 auto', color: 'var(--main)', fontWeight: 700 }}>›</span>
    </Link>
  );
}
