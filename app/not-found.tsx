import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import PcSidebar from '@/components/PcSidebar';

// サイト全体の共通404ページ（2026-11-02追加）。
// これまでカスタムのnot-found.tsxが無く、存在しないURL（例：/gakko/shien/41 —
// 教育支援センターには/gakko/school/[no]のような個別詳細ページが無いため、他の
// カテゴリ（学びの多様化学校・フリースクール等）のURLパターンを真似て直接
// アクセスすると404になる）を踏んだ際、Next.jsの素っ気ない汎用404
// （「404 | This page could not be found.」のみでサイト内リンクが無い）が
// そのまま出ていた。「リンク飛んだんだけど、ここで何ができるかわかるといい」
// との指摘を受けて、他ページと同じヘッダー・下部ナビ付きの画面にし、
// よく使われる行き先への案内を added。
export default function NotFound() {
  return (
    <div className="app-shell">
      <Header supervised={false} showBack={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <div className="card" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
            <div style={{ fontSize: 40 }}>🔍</div>
            <div
              style={{
                fontFamily: "'M PLUS Rounded 1c', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: 'var(--main)',
              }}
            >
              このページは見つかりませんでした
            </div>
            <div className="muted">
              URLが変更・削除されたか、入力まちがいの可能性があります。下から行きたい場所を選んでください。
            </div>
          </div>

          <div
            className="card"
            style={{ alignItems: 'stretch', gap: 10, marginTop: 12 }}
          >
            <Link href="/" className="btn-primary" style={{ textAlign: 'center' }}>
              ホームに戻る
            </Link>
            <Link href="/gakko/matome" className="btn-secondary" style={{ textAlign: 'center' }}>
              学び場・支援情報をさがす
            </Link>
            <Link href="/ask" className="btn-secondary" style={{ textAlign: 'center' }}>
              相談する
            </Link>
            <Link href="/faq" className="btn-secondary" style={{ textAlign: 'center' }}>
              よくある質問
            </Link>
          </div>
        </div>
        <PcSidebar hideExperts hideRanking />
      </div>
      <BottomNav />
      <Footer />
    </div>
  );
}
