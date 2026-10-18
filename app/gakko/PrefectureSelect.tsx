'use client';

import { useRouter } from 'next/navigation';
import { PREFECTURES } from '@/lib/data/prefectures';

// 47都道府県チップをそのままwrapで並べると、特にスマホでは目的の県に着くまで
// 何行もスクロールする必要があった（2026-10-18、UXレビューで指摘）。チップ自体は
// クローラーが各都道府県ページをたどれるリンクとして残しつつ、すぐ下の一覧に
// 飛べるセレクトボックスを追加して、スクロールなしで選べる経路も用意した。
export default function PrefectureSelect({ selected }: { selected: string | null }) {
  const router = useRouter();

  return (
    <select
      className="input"
      value={selected || ''}
      onChange={(e) => {
        const pref = e.target.value;
        router.push(pref ? `/gakko?pref=${encodeURIComponent(pref)}` : '/gakko');
      }}
    >
      <option value="">都道府県を選択…</option>
      {PREFECTURES.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}
