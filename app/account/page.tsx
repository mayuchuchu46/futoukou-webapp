import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';
import { EXPERT_TICKET_PACK_PRICE_JPY, EXPERT_TICKET_PACK_COUNT } from '@/lib/config';
import { isStripeConfigured } from '@/lib/stripe';
import LogoutButton from './LogoutButton';
import MembershipPanel from './MembershipPanel';
import TicketsPanel from './TicketsPanel';

// 登録・ログイン直後、いきなり「自分の相談を書く」はハードルが高い人も多いので、
// まずは他の人の相談（ホームの一覧）を見てもらう方を主導線にする。
// 読み放題会員（月¥800、MembershipPanel）の登録・解約はこのページで完結させる。
export default function AccountPage() {
  // Cache Componentsではcookies()を読むコンポーネントをSuspense配下に置かないと、
  // レンダリング結果がCDNの共有キャッシュに乗ってしまい、別のログイン状態の訪問者にも
  // 直前にアクセスした人のメールアドレス等がそのまま配信される（instant=falseだけでは防げない）。
  return (
    <Suspense fallback={null}>
      <AccountPageContent />
    </Suspense>
  );
}

async function AccountPageContent() {
  const member = await getCurrentMember();
  if (!member) redirect('/account/login');

  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main">
        <h2 className="pagetitle">アカウント</h2>

        <div className="card" style={{ gap: 6 }}>
          <div style={{ fontWeight: 700 }}>ログインしています</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {member.name ? `${member.name}（${member.email}）` : member.email}
          </div>
        </div>

        <MembershipPanel
          active={isSubscriptionActive(member)}
          periodEnd={member.subscription_current_period_end}
          stripeConfigured={isStripeConfigured()}
        />

        {isSubscriptionActive(member) && (
          <TicketsPanel
            initialCredits={member.expert_credits}
            priceJpy={EXPERT_TICKET_PACK_PRICE_JPY}
            packCount={EXPERT_TICKET_PACK_COUNT}
            stripeConfigured={isStripeConfigured()}
          />
        )}

        {/* お知らせ・メルマガの受信設定は不要とのことで非表示にした（2026-10-14）。
            APIやDBの購読状態は変更していないので、再表示したくなった場合は
            NewsletterPanelをここに戻すだけでよい。 */}

        {/* 「兄弟で不登校のパターンが多い」ため、1アカウントで複数の子どもを分けて
            管理できる機能への導線（2026-10-16追加）。 */}
        <Link href="/account/children" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>お子さんのプロフィール（兄弟で分ける）</span>
          <span className="muted">›</span>
        </Link>

        <Link href="/" className="btn-secondary">
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
