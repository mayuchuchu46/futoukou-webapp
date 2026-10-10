import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getCurrentMember } from '@/lib/memberAuth';
import LogoutButton from './LogoutButton';

// ログイン中のアカウントによって内容が変わるページなので、プリレンダーせず常に動的に実行する
export const instant = false;

// 登録・ログイン直後、いきなり「自分の相談を書く」はハードルが高い人も多いので、
// まずは他の人の相談（ホームの一覧）を見てもらう方を主導線にする。
// 「相談する」はその次のステップとして並べ、会員限定機能（専門家相談）は
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

        <Link href="/" className="btn-primary">
          みんなの相談を見てみる
        </Link>
        <Link href="/ask" className="btn-secondary">
          自分も相談してみる
        </Link>

        <LogoutButton />
      </div>
      <BottomNav />
    </div>
  );
}
