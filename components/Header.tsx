'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CrisisModal from './CrisisModal';

export default function Header({
  supervised,
  showBack = true,
}: {
  supervised: boolean;
  // ページ本文側に、行き先が明示された「もどる」リンク（.backlink）が既にある場合はtrue。
  // Header側のrouter.back()な「戻る」とほぼ同じ場所に同じ意味のボタンが2つ並んでしまう
  // UI上の重複があったため、本文にbacklinkがあるページではHeader側を隠せるようにした
  // （2026-10-18、「スマホもっと言い出しかたないかな」等の一連のUXレビューを受けて）。
  // 下部固定ナビ直上の「戻る」（BottomNav、.bottomnav-back）は、長いページでスクロールした
  // 後にも使える位置的な役割が別にあるため、こちらは引き続きどのページでも出す。
  showBack?: boolean;
}) {
  const [crisisOpen, setCrisisOpen] = useState(false);
  // トップページ以外（伴走ノート・マイページ等）のスマホ表示では、「専門家監修：準備中…」
  // 「不登校のご家庭に、次の一手を。」といったトップページ向けの説明文はもう要らない、
  // という指摘を受けて追加。PC幅では引き続き全ページに表示する（2026-10-12）。
  const pathname = usePathname();
  const isHome = pathname === '/';
  const router = useRouter();
  // ヘッダーに常時「ログイン／アカウント」導線を出すための、ログイン状態の軽量チェック。
  // 以前は会員登録・ログインへの入り口がマイページ・伴走ノートの中に埋もれていて、
  // 「今すぐログインしたいだけ」の人にも毎回それらを掘ってもらう必要があったため追加した
  // （2026-10-12）。
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.loggedIn))
      .catch(() => setLoggedIn(false));
  }, []);

  return (
    <div className={`header${isHome ? '' : ' header-subpage'}`}>
      <div className="header-row">
        <div className="header-left">
          {/* トップページ以外では、ブラウザの戻る導線がわかりにくい人のために、さりげない
              「戻る」をヘッダーに置く。特定のリンク先を決め打ちせずrouter.back()にしている
              のは、ページごとに「もどる」の行き先がバラバラ（既存の.backlinkは各ページの
              文脈に応じた固定リンク）なので、ヘッダー側は汎用的な「直前の画面に戻る」に
              した（2026-10-12）。 */}
          {!isHome && showBack && (
            <button type="button" className="header-back" onClick={() => router.back()} aria-label="前のページに戻る">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              戻る
            </button>
          )}
          {/* ロゴ＋「不登校編」バッジ。直下にhero-catch（「不登校のご家庭に、次の一手を。」）が
              来る配置が良いとのことなので、supervision-noteをこの行に混ぜるのはやめ、
              以前の形（ロゴ→hero-catch→hero-subの並びをそのまま、supervision-noteは
              header-rowの外に単独で配置）に戻した（2026-10-12）。
              ロゴ横に「相談する」タブ（.header-ask-tab）を一度置いたが、
              「上のピンクの相談するボタンはなくして」との指摘を受けて撤去した
              （2026-10-15）。PCでの「相談する」導線はPCサイド（.sidebar-ask-btn相当）に
              集約している。 */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: '10px 10px 10px 0',
              margin: '-10px -10px -10px 0',
            }}
          >
            <img src="/assets/wordmark_logo.png" className="wordmark" alt="どうする先生" />
            <span className="badge">不登校編</span>
          </Link>
          {/* サイト全体でh1タグが1つも無かった（ページ見出しは全てh2のpagetitle）ため、
              SEO上の見出し構造を補う目的で、全ページ共通ヘッダーのこのキャッチコピーを
              h1にした（2026-10-14）。全ページで同じテキストになる点は、タグライン的な
              見出しとして許容範囲と判断（ブランド名＋キャッチコピーという構成）。
              デフォルトのh1マージンは globals.css の.hero-catchでmargin:0にして打ち消している。 */}
          <h1 className="hero-catch">不登校のご家庭に、次の一手を。</h1>
          {/* 「相談を重ねるほど〜」を一度hero-subに足してみたが、文が長くなりすぎるとの
              指摘を受けて元に戻した（2026-10-15）。この差別化メッセージは結果ページ
              （SaveConsultationPrompt、会員本人向け「伴走ノートに記録されました」表示）
              の方に残している。 */}
          {/* 「伴走ノート」への改名に合わせて、キャッチコピーも「答えて終わり」ではなく
              継続的に寄り添う印象に変更（2026-10-16）。 */}
          <div className="hero-sub">「どうしたらいい？」にAIと専門家が回答＆伴走</div>
        </div>
        <div className="header-right">
          <button className="crisis-btn" onClick={() => setCrisisOpen(true)}>
            つらいときはこちら
          </button>
          <Link href="/about" className="aboutlink">
            どうする先生とは？
          </Link>
        </div>
      </div>
      <span className="supervision-note">
        {supervised ? '専門家監修済み' : '専門家監修：準備中・ベータ版・無料でお試しいただけます'}
      </span>

      {/* ログイン／アカウントへの導線。他の情報系リンク（つらいときはこちら／どうする先生とは？）
          と並べて同じ見た目にすると埋もれてしまうため、画面右上の角にタブのようにぶら下げて
          常時固定表示する（position: fixedなのでスクロールしても常に見える）。スマホ幅では
          この固定タブと.header-rightの縦積みリンクが同じ右上の領域で重なるため、
          .header-rightの方をCSS側でタブの高さぶんだけ下に逃がして調整している
          （ヘッダー全体やロゴを動かすと今度はロゴ上に無駄な余白ができてしまったため、
          header-rightだけをずらす方式に戻した。2026-10-12）。 */}
      {loggedIn !== null && (
        <Link href={loggedIn ? '/account' : '/account/login'} className="account-tab">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0 1 16 0z" />
          </svg>
          {/* 未ログイン時は「ログイン」だけでなく新規登録も誘導したいので、ログインページへの
              リンクのまま文言だけ両方を伝える形にする（/account/loginからは
              /account/registerへの導線が既にある）。 */}
          {loggedIn ? 'アカウント' : 'ログイン / 無料登録'}
        </Link>
      )}

      {crisisOpen && <CrisisModal onClose={() => setCrisisOpen(false)} />}
    </div>
  );
}
