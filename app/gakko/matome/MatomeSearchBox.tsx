'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// まとめページの学校名検索窓（2026-11-08追加）。
// 入力値は URL の ?q= パラメータとして反映し、サーバー側でデータを絞り込む。
// 300ms のデバウンスで router.replace を呼ぶことで、逐次入力でもページ遷移を
// 連打しない。都道府県（?pref=）が選択されている場合はそのまま保持する。
export default function MatomeSearchBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get('q') ?? '');

  // URL の ?q= が変わったときに入力欄を同期（ブラウザバック等に対応）
  useEffect(() => {
    setValue(sp.get('q') ?? '');
  }, [sp]);

  const navigate = useCallback(
    (v: string) => {
      const params = new URLSearchParams();
      const pref = sp.get('pref');
      if (pref) params.set('pref', pref);
      if (v.trim()) params.set('q', v.trim());
      const qs = params.toString();
      router.replace(`/gakko/matome${qs ? '?' + qs : ''}`, { scroll: false });
    },
    [router, sp]
  );

  // 300ms デバウンス
  useEffect(() => {
    const timer = setTimeout(() => navigate(value), 300);
    return () => clearTimeout(timer);
  }, [value, navigate]);

  return (
    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 15,
          pointerEvents: 'none',
          color: 'var(--muted)',
          lineHeight: 1,
        }}
        aria-hidden
      >
        🔍
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="学校名・運営者名などで絞り込む"
        aria-label="学校名で検索"
        style={{
          width: '100%',
          padding: '10px 36px 10px 36px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 14,
          background: 'var(--bg)',
          color: 'var(--fg)',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="検索をクリア"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: 'var(--muted)',
            padding: '2px 4px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
