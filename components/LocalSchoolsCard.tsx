import Link from 'next/link';
import { getLocalSchools } from '@/lib/localSchools';

// 指定した市区町村に実際にある学びの場（フリースクール・学びの多様化学校・
// 教育支援センター）を紹介するカード（2026-11-01追加、2026-11-02に教育支援
// センターを追加）。もともと自治体の取組ニュース記事専用
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
  const { freeSchools, manabiSchools, supportCenters } = getLocalSchools(prefecture, city);
  const matchedManabiSchools = manabiSchools.slice(0, 5);
  const matchedFreeSchools = freeSchools.slice(0, 5);
  const matchedSupportCenters = supportCenters.slice(0, 5);

  if (
    matchedFreeSchools.length === 0 &&
    matchedManabiSchools.length === 0 &&
    matchedSupportCenters.length === 0
  ) {
    return null;
  }

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
        {matchedSupportCenters.map((s, i) => (
          // 教育支援センターには個別の詳細ページ（/gakko/school/[no]のような固有no）が
          // 無いため、フリースクール・学びの多様化学校と違い個別施設への直リンクはできない。
          // 以前は<div>のまま何もリンクしておらず「リンク飛ばない」との指摘を受けた
          // （2026-11-02）。代わりに、その都道府県の教育支援センター一覧タブ
          // （/gakko?type=shien&pref=…、app/gakko/ShienExplorer.tsx）へリンクする。
          <Link
            key={`shien-${s.city}-${s.name}-${i}`}
            href={`/gakko?type=shien&pref=${encodeURIComponent(prefecture)}`}
            className="qtext"
            style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}
          >
            🏢 {s.name}（教育支援センター）
            {s.contact && (
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.contact}</div>
            )}
          </Link>
        ))}
      </div>
      <Link href={`/gakko/matome?pref=${encodeURIComponent(prefecture)}`} className="btn-secondary">
        {prefecture}の学びの場をもっと見る
      </Link>
    </div>
  );
}
