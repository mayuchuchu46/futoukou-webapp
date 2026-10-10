import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getCurrentMember } from '@/lib/memberAuth';
import LogoutButton from './LogoutButton';

// ログイン中のアカウントによって内容が変わるページなので、プリレンダーせず常に動的に実行する
export const instant = false;

export default async function AccountPage() {
  const member = await getCurrentMember();
  if (!member) redirect('/account/login');

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">アカウント</h2>
        <div className="card" style={{ gap: 8 }}>
          {member.name && <div style={{ fontWeight: 700 }}>{member.name}</div>}
          <div className="muted">{member.email}</div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>
          現時点では、アカウントでログインできる状態になっただけで、会員限定の機能（専門家回答の読み放題など）はまだ利用できません。準備が整い次第、このアカウントでご利用いただけるようになります。
        </div>
        <LogoutButton />
      </div>
      <BottomNav />
    </div>
  );
}
