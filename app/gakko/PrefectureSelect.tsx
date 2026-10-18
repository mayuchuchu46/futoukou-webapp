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
//
// 学びの多様化学校タブの学校種フィルター（小学校／中学校／高等学校／小・中）を
// 最初から使えるようにした（2026-10-18）のにあわせて、セレクトボックスで都道府県を
// 切り替えても選択中の学校種が外れないよう school パラメータも保持する。
export default function PrefectureSelect({
  selected,
  type = 'gakko',
  schoolType = null,
}: {
  selected: string | null;
  type?: 'gakko' | 'free' | 'online' | 'shien' | 'tsushin' | 'josei';
  schoolType?: string | null;
}) {
  const router = useRouter();
  const typeQuery =
    type === 'free'
      ? 'type=free&'
      : type === 'shien'
        ? 'type=shien&'
        : type === 'tsushin'
          ? 'type=tsushin&'
          : type === 'josei'
            ? 'type=josei&'
            : '';
  const emptyQuery =
    type === 'free'
      ? '?type=free'
      : type === 'shien'
        ? '?type=shien'
        : type === 'tsushin'
          ? '?type=tsushin'
          : type === 'josei'
            ? '?type=josei'
            : '';
  const schoolQuery = type === 'gakko' && schoolType ? `school=${encodeURIComponent(schoolType)}&` : '';
  const schoolQueryStandalone = type === 'gakko' && schoolType ? `school=${encodeURIComponent(schoolType)}` : '';

  return (
    <select
      className="input"
      value={selected || ''}
      onChange={(e) => {
        const pref = e.target.value;
        router.push(
          pref
            ? `/gakko?${typeQuery}${schoolQuery}pref=${encodeURIComponent(pref)}`
            : schoolQueryStandalone
              ? `/gakko${emptyQuery}${emptyQuery ? '&' : '?'}${schoolQueryStandalone}`
              : `/gakko${emptyQuery}`
        );
      }}
    >
      <option value="">都道府県を選択…</option>
      {PREFECTURES.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}
