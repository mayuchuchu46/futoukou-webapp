import Link from 'next/link';

// 各学校・施設の詳細ページ下部に、次に見てみたくなりそうな他の学校・施設を
// 一覧表示するための共通カード（2026-10-21追加）。マッチング自体の基準は
// タイプごとに違う（lib/similarSchools.ts参照）ため、ここは表示だけを担当する。
export default function RelatedListingsCard({
  title,
  items,
}: {
  title: string;
  items: { key: string | number; href: string; name: string; meta: string }[];
}) {
  // 該当が無ければ何も表示しない（存在しない候補を匂わせない）。
  if (items.length === 0) return null;

  return (
    <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="answer-label" style={{ fontSize: 14 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid var(--border)',
              paddingBottom: 8,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span className="qtext" style={{ fontSize: 14, fontWeight: 700 }}>
              {item.name}
            </span>
            <span className="muted" style={{ fontSize: 12, flex: '0 0 auto', whiteSpace: 'nowrap' }}>
              {item.meta} ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
