import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { NEWS_ITEMS } from '@/lib/data/news';
import NewsStatsChart from '@/components/NewsStatsChart';

// 不登校関連ニュースのまとめページ（2026-10-29追加）。「助成金情報と同じように、
// 不登校に関する最新ニュースも定期的にチェックして載せていきたい」との要望を受けて
// 新設。記事本文は転載せず、当サイトが自分の言葉で書いた見出し・要約＋出典リンクの
// 形式で紹介する（lib/data/news.tsの方針コメント参照）。
export const metadata: Metadata = {
  title: `不登校に関する最新ニュース｜${SITE_NAME}`,
  description: '不登校に関する制度・調査・自治体の取組などの最新ニュースを、出典を明記してまとめています。',
  alternates: { canonical: `${SITE_URL}/news` },
};

const CATEGORY_LABEL: Record<string, string> = {
  policy: '制度・施策',
  research: '調査・統計',
  local: '自治体の取組',
  other: 'その他',
};

export default function NewsPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">不登校に関する最新ニュース</h2>
          <div className="muted" style={{ marginBottom: 12 }}>
            不登校に関する制度・調査・自治体の取組などのニュースを、確認できたものだけまとめています。各記事の詳細は出典リンクからご確認ください。
          </div>

          {NEWS_ITEMS.length === 0 && (
            <div className="card">
              <div className="qtext">現在、掲載できるニュースを確認中です。</div>
            </div>
          )}

          {NEWS_ITEMS.map((item) => (
            <div key={item.id} className="card" style={{ alignItems: 'flex-start', gap: 8 }}>
              <div className="muted" style={{ fontSize: 12 }}>
                {item.date || item.addedAt}
                {CATEGORY_LABEL[item.category] ? `・${CATEGORY_LABEL[item.category]}` : ''}
              </div>
              <Link href={`/news/${item.id}`} className="answer-label" style={{ fontSize: 15, textDecoration: 'none', color: 'inherit' }}>
                {item.title}
              </Link>
              <div className="qtext">{item.summary}</div>

              {/* 記事中の数値比較を簡単なバーグラフで表示（2026-10-29追加、
                  components/NewsStatsChart.tsxに共通化。経緯はそちらのコメント参照）。 */}
              {item.stats && <NewsStatsChart stats={item.stats} />}

              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: 13 }}>
                出典：{item.sourceName} ›
              </a>
            </div>
          ))}

          <Link href="/" className="backlink">← ホームに戻る</Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
