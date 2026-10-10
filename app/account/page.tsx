import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getCurrentMember } from '@/lib/memberAuth';
import LogoutButton from './LogoutButton';

// ログイン中のアカウントによって内容が変わるページなので、プリレンダーせず常に動的に実行する
export const instant = false;

// 登録・ログイン直後に一番価値を体験してもらえる行動（AIに相談する）へ、
// このページから1タップで行けるようにする。会員限定機能（専門家相談）は
// まだ使えないので、ログアウトなど主目的ではない操作は控えめな扱いにする。
export default async function AccountPage() {
  const member = await getCurrentMember();
  if (!member) redirect('/account/login');

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">アカウント</h2>

        <div className="card" style={{ gap: 6 }}>
          <div style={{ fontWeight: 700 }}>ログインに成功しました。会員限定機能は近日公開予定です。</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {member.name ? `${member.name}（${member.email}）` : member.email}
          </div>
        </div>

        <Link href="/ask" className="btn-primary">
          さっそく相談する
        </Link>
        <Link href="/mypage" className="btn-secondary">
          マイページで相談履歴を見る
        </Link>

        <LogoutButton />
      </div>
      <BottomNav />
    </div>
  );
}
