'use client';

import { useEffect } from 'react';

// 閲覧数を1増やすだけの副作用。SEOには関係ないのでクライアント側のまま。
export default function ViewPing({ id }: { id: string }) {
  useEffect(() => {
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, [id]);

  return null;
}
