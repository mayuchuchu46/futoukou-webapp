import Link from 'next/link';
import { getLocalSchools } from '@/lib/localSchools';

// 指定した市区町村に実際にある学びの場（フリースクール・学びの多様化学校）を
// 紹介するカード（2026-11-01追加）。もともと自治体の取組ニュース記事専用
// （app/news/[id]/RelatedLocalSchools.tsx）だったが、ホーム画面の「自分の地域登録」
// 機能（components/MyRegionCard.tsx）でも同じ見た目を使うため共通化した。
// 該当する施設が無い場合は何も表示しない（存在しない情報を匂わせない）。
export default function LocalSchoolsCard({
  prefecture,
  city,
  title,
}: {
  prefecture: string;
  city: string;
  title?: string;
}) {
  const { freeSchools, manabiSchools } = getLocalSchools(prefecture, city);
  const matchedManabiSchools = manabiSchools.slice(0, 5);
  const matchedFreeSchools = freeSchools.slice(0, 5);

  if (matchedFreeSchools.length === 0 && matchedManabiSchools.length === 0) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>{title || `${city}の学びの場`}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {matchedManabiSchools.map((s) => (
          <Link
            key={`manabi-${s.no}`}
            href={`/gakko/school/${s.no}`}
            className="qtext"
            style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}
          >
            🏫 {s.name}（学びの多様化学校）
          </Link>
        ))}
        {matchedFreeSchools.map((s) => (
          <Link
            key={`free-${s.no}`}
            href={`/gakko/free/${s.no}`}
            className="qtext"
            style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}
          >
            🏠 {s.name}（フリースクール）
          </Link>
        ))}
      </div>
      <Link href={`/gakko/matome?pref=${encodeURIComponent(prefecture)}`} className="btn-secondary">
        {prefecture}の学びの場をもっと見る
      </Link>
    </div>
  );
}
