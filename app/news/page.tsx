import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { NEWS_ITEMS } from '@/lib/data/news';

// 不登校関連ニュースのまとめページ（2026-10-29追加）。「助成金情報と同じように、
// 不登校に関する最新ニュースも定期的にチェックして載せていきたい」との要望を受けて
// 新設。記事本文は転載せず、当サイトが自分の言葉で書いた見出し・要約＋出典リンクの
// 形式で紹介する（lib/data/news.tsの方針コメント参照）。
//
// 当初は要約全文・グラフ・出典ボタンまで一覧にそのまま出していたが、
// 「一覧はもっと一部見せる感じで、各ニュースの詳細ページに飛ばす見せ方の方が
// いいのでは」との指摘を受けて、一覧はタイトル・要約の冒頭だけを見せる軽い
// ティザー形式に変更した（2026-10-29）。グラフ・出典・シェア・相談導線は
// 個別記事ページ（/news/[id]）側に集約し、一覧→詳細への遷移を前提にする。
// これにより一覧と詳細での文章の重複も解消される。
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
            不登校に関する制度・調査・自治体の取組などのニュースを、確認できたものだけまとめています。タップすると詳細（出典リンク付き）をご覧いただけます。
          </div>

          {NEWS_ITEMS.length === 0 && (
            <div className="card">
              <div className="qtext">現在、掲載できるニュースを確認中です。</div>
            </div>
          )}

          {NEWS_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="card"
              style={{ alignItems: 'flex-start', gap: 6, textDecoration: 'none', color: 'inherit' }}
            >
              <div className="muted" style={{ fontSize: 12 }}>
                {item.date || item.addedAt}
                {CATEGORY_LABEL[item.category] ? `・${CATEGORY_LABEL[item.category]}` : ''}
              </div>
              <div className="answer-label" style={{ fontSize: 15 }}>{item.title}</div>

              {/* インパクト数字があれば、要約の代わりに小さく見せて続きを読む動機にする
                  （2026-10-29、一覧をティザー化した際に追加）。 */}
              {item.headline ? (
                <div style={{ fontSize: 13, color: 'var(--main)', fontWeight: 700 }}>
                  【{item.headline.value}】{item.headline.label}
                </div>
              ) : (
                <div className="qtext qtext-clamp-3">{item.summary}</div>
              )}

              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>続きを読む ›</span>
            </Link>
          ))}

          <Link href="/" className="backlink">← ホームに戻る</Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
