'use client';

import { useRouter } from 'next/navigation';
import { PREFECTURES } from '@/lib/data/prefectures';

// 47都道府県チップをそのままwrapで並べると、特にスマホでは目的の県に着くまで
// 何行もスクロールする必要があった（2026-10-18、UXレビューで指摘）。チップ自体は
// クローラーが各都道府県ページをたどれるリンクとして残しつつ、すぐ下の一覧に
// 飛べるセレクトボックスを追加して、スクロールなしで選べる経路も用意した。
//
// 「フリースクール」タブ追加（2026-10-18）にあわせて、どちらのタブで選んでも
// 同じタブのまま都道府県だけ切り替わるよう type を保持してナビゲートする。
export default function PrefectureSelect({
  selected,
  type = 'gakko',
}: {
  selected: string | null;
  type?: 'gakko' | 'free' | 'online';
}) {
  const router = useRouter();
  const typeQuery = type === 'free' ? 'type=free&' : '';

  return (
    <select
      className="input"
      value={selected || ''}
      onChange={(e) => {
        const pref = e.target.value;
        router.push(pref ? `/gakko?${typeQuery}pref=${encodeURIComponent(pref)}` : `/gakko${type === 'free' ? '?type=free' : ''}`);
      }}
    >
      <option value="">都道府県を選択…</option>
      {PREFECTURES.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}
