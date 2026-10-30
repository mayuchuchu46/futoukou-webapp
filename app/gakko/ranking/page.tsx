import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { getFeaturedGakkoRanking } from '@/lib/gakkoRanking';
import { FEATURED_GAKKO_TYPE_LABEL } from '@/lib/gakkoRankingTypes';

// 「注目の学び場」ランキングの全件ページ（2026-10-29追加）。ホーム画面の
// 「注目の学び場」カード（components/FeaturedGakkoRanking.tsx）は3件だけの
// ティザー表示のため、「ランキングページもあるといいな」との要望を受けて、
// もっと多くの順位を見られる一覧ページを新設した。
//
// 件数（＝直近の相談でこの学校・施設名が話題になった件数）の算出ロジックは
// lib/gakkoRanking.ts（ホームと共通）をそのまま使う。ホームのカードは実データが
// 3件に満たない間は非表示にしているが、このページ自体は直接URLでも来られるため、
// 0件の場合は「集計できるデータがまだありません」という空状態を出す
// （app/news/page.tsxのNEWS_ITEMS.length===0と同じ考え方。架空のランキングは出さない）。
export const metadata: Metadata = {
  title: `注目の学び場ランキング｜${SITE_NAME}`,
  description: '実際に寄せられた相談で話題になった学校・フリースクール・通信制高校・オンラインフリースクールのランキングです。',
  alternates: { canonical: `${SITE_URL}/gakko/ranking` },
};

const TYPE_ICON: Record<string, string> = {
  school: '🏫',
  free: '🏠',
  tsushin: '📮',
  online: '💻',
};

export default async function GakkoRankingPage() {
  const items = await getFeaturedGakkoRanking(30);

  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">注目の学び場ランキング</h2>
          <div className="muted" style={{ marginBottom: 4 }}>
            実際に寄せられた相談の中で、学校名・施設名が話題になった件数のランキングです（閲覧数ではありません）。
          </div>
          {/* ランキングを見た人が、自分で学び場を探す方にも進めるように
              （2026-10-30、「学び場のトップへの導線を作りたい」との要望を受けて追加）。
              他の一覧系ページ（app/gakko/teiji/[no]/page.tsx等）と同じ
              .backlink--forwardのスタイルを使う。 */}
          <Link href="/gakko/matome" className="backlink--forward" style={{ marginBottom: 12 }}>
            学び場をまとめて見る（都道府県・種類から探す） ›
          </Link>

          {items.length === 0 && (
            <div className="card">
              <div className="qtext">現在、ランキングを集計できるデータがまだありません。</div>
            </div>
          )}

          {items.length > 0 && (
            <div className="card" style={{ alignItems: 'flex-start', gap: 0, padding: 0, overflow: 'hidden' }}>
              {items.map((item, i) => (
                <Link
                  key={item.key}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '13px 16px',
                    borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none',
                    color: 'var(--text)',
                    width: '100%',
                  }}
                >
                  <span
                    className="rank-num"
                    style={{ fontSize: 15, width: 22, flex: '0 0 auto' }}
                  >
                    {i + 1}
                  </span>
                  <span aria-hidden="true" style={{ fontSize: 18 }}>
                    {TYPE_ICON[item.type] || '🏫'}
                  </span>
                  <span style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {FEATURED_GAKKO_TYPE_LABEL[item.type]}・{item.count}件の相談で話題
                    </div>
                  </span>
                  <span className="muted">›</span>
                </Link>
              ))}
            </div>
          )}

          {/* ランキングは話題になった学校だけなので、載っていない学校を探したい人向けに
              学び場トップへのCTAも置く（2026-10-30追加）。 */}
          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              気になる学校がランキングに無かったら
            </div>
            <div className="qtext">
              都道府県や学校の種類（学びの多様化学校・フリースクール・通信制高校など）から、もっと詳しく学び場を探せます。
            </div>
            <Link href="/gakko/matome" className="btn-primary sidebar-ask-btn-pink" style={{ textDecoration: 'none', width: '100%' }}>
              学び場をまとめて見る →
            </Link>
          </div>

          <Link href="/" className="backlink">← ホームに戻る</Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
