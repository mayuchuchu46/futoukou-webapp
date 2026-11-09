import Link from 'next/link';

// 「親のご褒美クラブ」（/gohoubi）への誘導バナー。components/KotobaTeaser.tsxと
// 同じ見た目・パターンで実装（2026-11-10追加）。
export default function GohoubiTeaser() {
  return (
    <Link
      href="/gohoubi"
      className="card home-gohoubi-link"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        margin: '0 0 10px',
        padding: '10px 14px',
        border: '2px solid var(--main)',
        background: 'linear-gradient(135deg, #ffffff 0%, var(--sub) 160%)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span style={{ flex: '0 0 auto', fontSize: 22, lineHeight: 1 }}>🎁</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'inline-block',
            fontWeight: 800,
            fontSize: 15,
            color: '#fff',
            background: 'var(--main)',
            padding: '2px 9px',
            borderRadius: 6,
            letterSpacing: '0.02em',
          }}
        >
          親のご褒美クラブ
        </span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>今日の頑張りを入れると、ご褒美を提案します</span>
      </span>
      <span style={{ flex: '0 0 auto', color: 'var(--main)', fontWeight: 700 }}>›</span>
    </Link>
  );
}
