import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import NewsStatsChart from '@/components/NewsStatsChart';
import YearTrendChart from '@/components/YearTrendChart';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { FUTOUKOU_DATA_CARDS, getFutoukouDataCard } from '@/lib/data/futoukouDataCards';
import { FUTOUKOU_SOURCE } from '@/lib/data/futoukouStats';

// 「データで見る不登校」の個別シェア用ページ（2026-11-08追加）。
// 「それぞれのページを作ってシェアするときは一つのグラフや数字のインパクトで拡散を
// 狙いたい」との要望を受けて新設。1ページ＝1つの数字・1つのグラフだけを主役にする
// （全部まとめて見せる/data/futoukouとは役割を分ける）。
// 仕組みはapp/news/[id]/page.tsxと同じ（generateMetadata＋動的OGP画像＋Xシェア）。

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = getFutoukouDataCard(slug);
  if (!card) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const url = `${SITE_URL}/data/futoukou/${card.slug}`;
  const description = `${card.headlineLabel}。${card.description}`;
  return {
    title: `${card.headlineValue}｜${card.title} - データで見る不登校 - ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${card.headlineValue}｜${card.title}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
    },
    twitter: { card: 'summary_large_image', title: `${card.headlineValue}｜${card.title}`, description },
  };
}

export async function generateStaticParams() {
  return FUTOUKOU_DATA_CARDS.map((c) => ({ slug: c.slug }));
}

export default async function FutoukouDataCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getFutoukouDataCard(slug);
  if (!card) notFound();

  const url = `${SITE_URL}/data/futoukou/${card.slug}`;

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/data/futoukou" className="backlink">← データで見る不登校 一覧に戻る</Link>

          {/* インパクト数字を主役にする（app/news/[id]/page.tsxと同じ考え方） */}
          <div className="card" style={{ alignItems: 'flex-start', gap: 6, background: 'var(--main)', border: 'none' }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {card.headlineValue}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
              {card.headlineLabel}
            </div>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="qtext">{card.description}</div>

            {card.chart.type === 'trend' && <YearTrendChart data={card.chart.data} unit={card.chart.unit} />}
            {card.chart.type === 'bars' && <NewsStatsChart stats={card.chart.stats} caption={card.chart.caption} />}
            {card.chart.type === 'ranking' && (
              <div className="ranking" style={{ width: '100%' }}>
                {card.chart.items.map((item, i) => (
                  <div key={item.label} className="rank-item">
                    <span className="rank-num">{i + 1}</span>
                    <span className="rank-q" style={{ display: 'block', WebkitLineClamp: 'unset' }}>{item.label}</span>
                    <span className="muted" style={{ fontSize: 12, fontWeight: 700, color: 'var(--main)' }}>
                      {item.value}
                      {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <a href={FUTOUKOU_SOURCE.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: 13 }}>
              出典：{FUTOUKOU_SOURCE.name} ›
            </a>

            {/* このページ自体をシェアできるボタン（app/news/[id]/page.tsxと同じ仕組み）。
                カード画像はopengraph-image.tsx（カードごとの動的OGP画像）が使われる。 */}
            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: card.tweetText,
                url,
                hashtags: '不登校,どうする先生',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              このデータをシェア
            </a>
          </div>

          {/* 他のデータカードへの誘導 */}
          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>ほかのデータも見る</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {FUTOUKOU_DATA_CARDS.filter((c) => c.slug !== card.slug).map((c) => (
                <Link
                  key={c.slug}
                  href={`/data/futoukou/${c.slug}`}
                  style={{ display: 'block', borderBottom: '1px solid var(--border)', paddingBottom: 8, color: 'inherit', textDecoration: 'none' }}
                >
                  <div style={{ fontSize: 13, color: 'var(--main)', fontWeight: 700 }}>【{c.headlineValue}】{c.title}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="answer-label" style={{ fontSize: 14 }}>
              うちの子の場合はどうなんだろう……と思ったら
            </div>
            <div className="qtext">登録不要・匿名で、AIと専門家・経験者に相談できます。</div>
            <Link href="/ask" className="btn-primary sidebar-ask-btn-pink" style={{ textDecoration: 'none', width: '100%' }}>
              相談してみる →
            </Link>
          </div>

          <Link href="/data/futoukou" className="backlink">← データで見る不登校 一覧に戻る</Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
