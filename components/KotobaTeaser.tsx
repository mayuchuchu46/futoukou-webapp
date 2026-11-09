import Link from 'next/link';

// 「子どもの本音翻訳」（/kotoba）への誘導バナー。もとはapp/HomeClient.tsx内に
// 直書きしていたJSXを、PC（960px以上）ではPcSidebar側にも同じものを出したい
// （「PCはこの２つはサイドにおくのでいいかも」との指摘を受けて、FutoukouDataTeaserと
// 合わせてサイドへ移動）ため、FutoukouDataTeaserと同じ形でコンポーネント化した
// （2026-11-09）。見た目・文言は移動前のまま変更していない。
export default function KotobaTeaser() {
  return (
    <Link
      href="/kotoba"
      className="card home-kotoba-link"
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
      <span style={{ flex: '0 0 auto', fontSize: 22, lineHeight: 1 }}>💬</span>
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
          子どもの本音翻訳
        </span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>子供が言った一言を、気持ちと返し方に変換します</span>
      </span>
      <span style={{ flex: '0 0 auto', color: 'var(--main)', fontWeight: 700 }}>›</span>
    </Link>
  );
}
