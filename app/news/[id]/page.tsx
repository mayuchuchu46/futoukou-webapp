import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { NEWS_ITEMS } from '@/lib/data/news';
import NewsStatsChart from '@/components/NewsStatsChart';

// ニュース個別記事ページ（2026-10-29追加）。「記事ごとにシェアできるようにしたい」
// との要望を受けて、/news（一覧）とは別に1記事ずつのURL・OGP画像・Xシェアボタンを
// 持たせた。見た目・構成はapp/gakko/school/[no]/page.tsxのシェア導線を踏襲している。
const CATEGORY_LABEL: Record<string, string> = {
  policy: '制度・施策',
  research: '調査・統計',
  local: '自治体の取組',
  other: 'その他',
};

function findNews(id: string) {
  return NEWS_ITEMS.find((n) => n.id === id) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = findNews(id);
  if (!item) {
    return { title: `ページが見つかりません | ${SITE_NAME}` };
  }
  const url = `${SITE_URL}/news/${item.id}`;
  return {
    title: `${item.title}｜不登校ニュース - ${SITE_NAME}`,
    description: item.summary,
    alternates: { canonical: url },
    openGraph: {
      title: item.title,
      description: item.summary,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'ja_JP',
    },
    twitter: { card: 'summary_large_image', title: item.title, description: item.summary },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = findNews(id);
  if (!item) notFound();

  const url = `${SITE_URL}/news/${item.id}`;

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <Link href="/news" className="backlink">← 不登校に関する最新ニュース一覧に戻る</Link>

          <div className="muted" style={{ fontSize: 12 }}>
            {item.date || item.addedAt}
            {CATEGORY_LABEL[item.category] ? `・${CATEGORY_LABEL[item.category]}` : ''}
          </div>
          <h2 className="pagetitle" style={{ marginBottom: 4 }}>{item.title}</h2>

          {/* インパクト数字（2026-10-29追加）。「わかりやすいインパクトある数字を
              見せつつ、バズりを意識した画像がいい」との要望を受けて、記事の一番
              大きな数字を大きな文字で見せるカードを本文の上に置く。2要素の比較を
              円グラフで見せるのは割合の差が読み取りにくいため避け（データ可視化の
              定石でも2スライスの円グラフは非推奨）、代わりに「一番伝えたい数字」を
              大きく見せる形にした。シェア用のOGP画像（opengraph-image.tsx）も
              同じ数字を大きく使っている。 */}
          {item.headline && (
            <div
              className="card"
              style={{
                alignItems: 'flex-start',
                gap: 6,
                background: 'var(--main)',
                border: 'none',
              }}
            >
              <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                {item.headline.value}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
                {item.headline.label}
              </div>
            </div>
          )}

          <div className="card" style={{ alignItems: 'flex-start', gap: 10 }}>
            <div className="qtext">{item.summary}</div>

            {item.stats && <NewsStatsChart stats={item.stats} caption={item.statsCaption} />}

            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: 13 }}>
              出典：{item.sourceName} ›
            </a>

            {/* このページ自体をシェアできるボタン（2026-10-29追加）。インパクト数字が
                あればそれをツイート文に入れる（無い場合は見出しだけ）。シェア時の
                カード画像はopengraph-image.tsx（記事ごとの動的OGP画像）が使われる。 */}
            <a
              className="share-btn"
              style={{ width: '100%' }}
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                text: item.headline
                  ? `【${item.headline.value}】${item.headline.label}\n${item.title}`
                  : item.title,
                url,
                hashtags: '不登校,どうする先生',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="share-btn-icon">𝕏</span>
              この記事をシェア
            </a>
          </div>

          <Link href="/news" className="backlink">← ニュース一覧に戻る</Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
