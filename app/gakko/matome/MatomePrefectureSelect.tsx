'use client';

import { useRouter } from 'next/navigation';
import { PREFECTURES } from '@/lib/data/prefectures';

// /gakko/matome専用の都道府県セレクトボックス（2026-10-21追加）。
// /gakko/PrefectureSelect.tsxはtype=クエリ（タブ）を保持する作りだが、
// このまとめページにはタブが無いため、よりシンプルに ?pref=X だけを
// 組み立てる専用版として分けている。
export default function MatomePrefectureSelect({ selected }: { selected: string | null }) {
  const router = useRouter();
  return (
    <select
      className="input"
      value={selected || ''}
      onChange={(e) => {
        const pref = e.target.value;
        router.push(pref ? `/gakko/matome?pref=${encodeURIComponent(pref)}` : '/gakko/matome');
      }}
    >
      <option value="">都道府県を選択…</option>
      {PREFECTURES.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}
