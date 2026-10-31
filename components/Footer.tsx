import Link from 'next/link';

// サイト全体のフッター。コピーライト表記と、利用規約・プライバシーポリシー・
// 特定商取引法に基づく表記への導線をまとめて置く（2026-10-19追加）。
// それまでフッター自体が存在せず、特商法表記ページへの導線がどこにも無かった
// （「サイトの下にコピーライトとかないけど大丈夫？」との指摘を受けて対応）。
// 主要な静的ページ・ホーム画面にのみ設置する（全ページへの設置はBottomNav
// （固定の下部タブバー）と干渉するため見送り、2026-10-19）。
//
// コピーライトの年は、コンポーネント本体（レンダー関数）の中でnew Date()を呼ぶと、
// Next.js 16のCache Components機能が「レンダー中に変わりうる値」として静的プリレンダー時に
// エラーにする（/privacy等のビルドが失敗した。2026-10-19発覚）。モジュール読み込み時
// （ビルド時）に1回だけ評価される場所に移すことで回避している。
const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-links">
        <Link href="/terms">利用規約・免責事項</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <Link href="/tokushoho">特定商取引法に基づく表記</Link>
      </nav>
      {/* 専門家・先輩保護者としてすでに登録した人が、自分のダッシュボード・
          プロフィール編集にたどり着く入り口がURLを知っている人しか使えない状態
          だったため追加（2026-10-31、「わかりやすいような導線にして」との
          依頼を受けて）。ログイン後は自動的にダッシュボードへ進む。 */}
      <nav className="site-footer-links">
        <Link href="/expert/login">専門家・先輩保護者の方はこちら（ログイン）</Link>
      </nav>
      <div className="site-footer-copyright">© {currentYear} manapri</div>
    </footer>
  );
}
