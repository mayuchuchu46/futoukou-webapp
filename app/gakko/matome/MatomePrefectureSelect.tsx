'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PREFECTURES } from '@/lib/data/prefectures';

// /gakko/matome専用の都道府県セレクトボックス（2026-10-21追加）。
// /gakko/PrefectureSelect.tsxはtype=クエリ（タブ）を保持する作りだが、
// このまとめページにはタブが無いため、よりシンプルに ?pref=X だけを
// 組み立てる専用版として分けている。
//
// このページは都道府県を選ぶと6カテゴリ分のデータをまとめて再取得・再描画するため、
// 他のページより切り替えに時間がかかりやすい。それにもかかわらず切り替え中の見た目が
// 何も変わらず、押しても反応していないように見えてしまっていた（2026-10-28、
// 「都道府県選択しても切り替わるまで時間かかる」との指摘を受けて対応）。useTransition で
// 切り替え中であることが伝わるようにした。
export default function MatomePrefectureSelect({ selected }: { selected: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select
        className="input"
        value={selected || ''}
        disabled={isPending}
        onChange={(e) => {
          const pref = e.target.value;
          const href = pref ? `/gakko/matome?pref=${encodeURIComponent(pref)}` : '/gakko/matome';
          startTransition(() => {
            router.push(href);
          });
        }}
      >
        <option value="">都道府県を選択…</option>
        {PREFECTURES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      {isPending && <span className="muted" style={{ fontSize: 12 }}>読み込み中…</span>}
    </div>
  );
}
