import Link from 'next/link';

// サイト全体のフッター。コピーライト表記と、利用規約・プライバシーポリシー・
// 特定商取引法に基づく表記への導線をまとめて置く（2026-10-19追加）。
// それまでフッター自体が存在せず、特商法表記ページへの導線がどこにも無かった
// （「サイトの下にコピーライトとかないけど大丈夫？」との指摘を受けて対応）。
// 主要な静的ページ・ホーム画面にのみ設置する（全ページへの設置はBottomNav
// （固定の下部タブバー）と干渉するため見送り、2026-10-19）。
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <nav className="site-footer-links">
        <Link href="/terms">利用規約・免責事項</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <Link href="/tokushoho">特定商取引法に基づく表記</Link>
      </nav>
      <div className="site-footer-copyright">© {year} manapri</div>
    </footer>
  );
}
