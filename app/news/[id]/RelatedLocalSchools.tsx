import Link from 'next/link';
import { FREE_SCHOOLS } from '@/lib/data/freeSchools';
import { MANABI_TAYOUKA_GAKKO } from '@/lib/data/manabiTayoukaGakko';

// 自治体の取組（category: 'local'）の記事に、その自治体に実際にある学びの場
// （フリースクール・学びの多様化学校）を紹介するカード（2026-11-01追加、「四日市
// なら四日市のフリースクール情報を出す」との要望を受けて）。
//
// lib/data/freeSchools.ts・lib/data/manabiTayoukaGakko.tsのcityは施設によって
// 粒度が異なる（学びの多様化学校は「名古屋市」のように市区町村まで、フリースクールは
// 「名古屋市中区」のように区まで入っていることが多い）ため、完全一致ではなく
// cityがnews.ts側で指定した市区町村名で始まるかどうかで判定する（prefectureは
// 完全一致。同名の市区町村が別の都道府県にある場合の取り違えを防ぐ）。
// 該当する施設が無い場合は何も表示しない（存在しない情報を匂わせない）。
export default function RelatedLocalSchools({
  prefecture,
  city,
}: {
  prefecture: string;
  city: string;
}) {
  const matchedFreeSchools = FREE_SCHOOLS.filter(
    (s) => s.prefecture === prefecture && s.city.startsWith(city)
  ).slice(0, 5);
  const matchedManabiSchools = MANABI_TAYOUKA_GAKKO.filter(
    (s) => s.prefecture === prefecture && s.city.startsWith(city)
  ).slice(0, 5);

  if (matchedFreeSchools.length === 0 && matchedManabiSchools.length === 0) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>{city}の学びの場</div>
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
