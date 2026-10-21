import Link from 'next/link';
import { Suspense } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import PcSidebar from '@/components/PcSidebar';
import { getCurrentMember } from '@/lib/memberAuth';
import { isSubscriptionActive } from '@/lib/membership';
import { EXPERT_TICKET_PACK_PRICE_JPY, EXPERT_TICKET_PACK_COUNT } from '@/lib/config';
import { isStripeConfigured } from '@/lib/stripe';
import LogoutButton from './LogoutButton';
import MembershipPanel from './MembershipPanel';
import TicketsPanel from './TicketsPanel';
import MyConsultationsPanel from './MyConsultationsPanel';

// 登録・ログイン直後、いきなり「自分の相談を書く」はハードルが高い人も多いので、
// まずは他の人の相談（ホームの一覧）を見てもらう方を主導線にする。
// 読み放題会員（月¥800、MembershipPanel）の登録・解約はこのページで完結させる。
//
// 2026-10-21、マイページ（/mypage）をこのページに統合した。マイページは登録・ログイン
// 不要で誰でも自分の投稿一覧等を見られる作りだったため、統合後もその前提を崩さないよう、
// 以前ここにあった「未ログインなら/account/loginへ強制リダイレクト」は廃止し、
// ログイン必須の会員情報（会員登録・チケット・お子さんのプロフィール・ログアウト）だけを
// member有無で出し分ける形にした。
export default function AccountPage() {
  return (
    <div className="app-shell">
      <Header supervised={false} />
      <div className="main page-with-sidebar">
        <div className="page-main">
          <h2 className="pagetitle">アカウント</h2>

          {/* 自分が投稿した相談一覧（旧マイページ）。ログイン状態に関係なく、ローカルの
              uidに紐づく投稿を表示するため、cookies()を読むAccountMemberSectionとは
              別のSuspense外に置いている。 */}
          <MyConsultationsPanel />

          {/* Cache Componentsではcookies()を読むコンポーネントをSuspense配下に置かないと、
              レンダリング結果がCDNの共有キャッシュに乗ってしまい、別のログイン状態の訪問者にも
              直前にアクセスした人のメールアドレス等がそのまま配信される（instant=falseだけでは防げない）。
              ただし、以前はHeader・BottomNav（ページ全体の外枠）までこのSuspenseの内側に
              含めてしまっていたため、再サスペンド時にfallback（何も表示しない）へ一瞬切り替わると
              ヘッダーごと画面から消える現象が起きていた（2026-10-18、トップページ・/askで起きていた
              のと同じ原因。「別ページに移動するとヘッダーが消える」との報告を受けて、ここも外枠を
              Suspenseの外に出し、cookies()を読む本文側だけに影響範囲を絞った）。 */}
          <Suspense fallback={null}>
            <AccountMemberSection />
          </Suspense>

          {/* 伴走ノートを見る（旧マイページ内のリンクを移設）。 */}
          <Link href="/notebook" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/assets/icon_book.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              伴走ノートを見る
            </span>
            <span className="muted">›</span>
          </Link>

          <Link href="/about" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <span>どうする先生について</span>
            <span className="muted">›</span>
          </Link>
          {/* 学びの多様化学校（旧：不登校特例校）・フリースクール等の都道府県別まとめページ。 */}
          <Link href="/gakko/matome" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <span>学校・フリースクールを探す</span>
            <span className="muted">›</span>
          </Link>
          {/* 学校詳細ページで保存したお気に入りの一覧（2026-10-22追加、lib/favorites.ts）。 */}
          <Link href="/gakko/favorites" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <span>お気に入りの学校・フリースクール</span>
            <span className="muted">›</span>
          </Link>
          <Link href="/expert/login" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <span>専門家として登録・ログイン</span>
            <span className="muted">›</span>
          </Link>

          {/* 利用規約・プライバシーポリシー等は、サイト全体のフッターの代わりとして
              ここ（アカウントページ、旧マイページ）にまとめている。BottomNavから常に
              一タップで来られるため、ボトムナビ型アプリとしてはこの位置が実質的な
              フッターの役割を果たす（2026-10-13、まとめて見出しを付けた）。 */}
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>規約・ポリシー</div>
          <Link href="/terms" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <span>利用規約・免責事項</span>
            <span className="muted">›</span>
          </Link>
          <Link href="/privacy" className="card" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <span>プライバシーポリシー</span>
            <span className="muted">›</span>
          </Link>
        </div>
        <PcSidebar />
      </div>
      <BottomNav />
    </div>
  );
}

// ログイン必須の会員機能（読み放題会員登録・専門家相談チケット・お子さんのプロフィール・
// ログアウト）。未ログインの場合はログイン・新規登録への案内カードを出す（以前はページ全体を
// /account/loginへredirectしていたが、マイページ統合により未ログインでも上の投稿一覧等は
// 見られる必要があるため、この区画だけの出し分けに変更した）。
async function AccountMemberSection() {
  const member = await getCurrentMember();

  if (!member) {
    return (
      <div className="card" style={{ gap: 10, alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 700 }}>ログインしていません</div>
        <div className="muted" style={{ fontSize: 13 }}>
          ログイン・新規登録すると、読み放題会員登録や専門家への相談チケット、お子さんのプロフィールの管理ができます。
        </div>
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <Link href="/account/login" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
            ログイン
          </Link>
          <Link href="/account/register" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>
            新規登録
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}
