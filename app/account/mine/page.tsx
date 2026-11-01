import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import MyConsultationsPanel from '../MyConsultationsPanel';

// 自分が投稿した相談（質問・回答）の一覧ページ（2026-11-01、アカウントページから分離）。
// 以前はアカウントページの先頭に直接このパネルを表示していたが、アカウントページ自体が
// 会員情報・お気に入り・規約など色々詰まっていて縦に長くなっていたため、「別ページに
// 飛ばして見れるのがいい」との要望を受けて、app/gakko/favorites（お気に入り一覧）と
// 同じ考え方で専用ページに分離した。中身（MyConsultationsPanel、ログイン状態に関係なく
// ローカルのuidに紐づく投稿を表示する）自体は変更していない。
export default function MyConsultationsPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">自分の相談一覧</h2>
          <MyConsultationsPanel />
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}
