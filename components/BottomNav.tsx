'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ITEMS = [
  { href: '/', label: 'ホーム', icon: '/assets/icon_house.png' },
  // 学校以外の学びの場・居場所まとめページ（/gakko/matome）への、スマホでも常時
  // 1タップで来られる導線（2026-10-21、「このページ充実してきたし、ニーズ高そうだから
  // スマホからも導線しっかり確保したい」との指摘を受けて追加）。それまではTOP等の
  // カード・テキストリンク経由のみで、常時表示される導線が無かった。
  { href: '/gakko/matome', label: '学び場', icon: '/assets/icon_cap.png' },
  // 「下のメニューの相談するボタンを目立たせたい」との要望を受けて、アイコンを
  // ピンクの丸バッジで一段浮かせて強調する専用スタイル（highlight）を追加
  // （2026-10-15）。他の3タブはこれまで通り選択時だけ緑になる控えめな見た目。
  { href: '/ask', label: '相談する', icon: '/assets/icon_bulb.png', highlight: true },
  // 伴走ノートは独立したタブにして常時アクセスできるようにする（元はマイページ内のカードだった）。
  // アイコンはノートを連想させるicon_book、マイページは元のicon_bookmarkに戻す。
  { href: '/notebook', label: '伴走ノート', icon: '/assets/icon_book.png' },
  // 「みんなのデータ」タブ（2026-10-16追加）。「日常の中でふと気づいた時にメモする」流れに
  // 合うよう、伴走ノートの中に埋め込むのではなく常時アクセスできる独立タブにした。
  { href: '/today', label: 'みんなのデータ', icon: '/assets/icon_comment.png' },
  // 2026-10-21、マイページを/accountに統合したため遷移先を変更（ラベルは維持）。
  { href: '/account', label: 'マイページ', icon: '/assets/icon_bookmark.png' },
];

// ある程度スクロールしたら、フッター付近にページ先頭へ戻るボタンを出す。
const SCROLL_TOP_SHOW_THRESHOLD = 400;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  // Header（画面上部）には既に「戻る」があるが、長いページでは上までスクロールしないと
  // 見えないため、下の固定ナビのすぐ上にも同じ「戻る」を出す（2026-10-13、全ページ下部にも
  // 欲しいとの指摘を受けて追加）。行き先はHeaderと同じくrouter.back()（直前の画面）。
  // ホームページでは意味がないので出さない。
  const isHome = pathname === '/';
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > SCROLL_TOP_SHOW_THRESHOLD);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* 浮いていた「相談する」ボタン（.fab）は、下部ナビが常時表示（スティッキー）な上に
          「相談する」タブをピンクバッジで強調したことで重複になったため削除した
          （2026-10-15）。 */}
      {showScrollTop && (
        <button
          type="button"
          className="scroll-top-btn"
          aria-label="ページの先頭へ戻る"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
      {!isHome && (
        <div className="bottomnav-back-row">
          <button type="button" className="bottomnav-back" onClick={() => router.back()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            戻る
          </button>
        </div>
      )}
      <nav className="nav">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <button className={`${active ? 'active' : ''} ${item.highlight ? 'nav-highlight' : ''}`}>
                {item.highlight ? (
                  <span className="navicon-badge">
                    <img className="navicon" src={item.icon} alt="" />
                  </span>
                ) : (
                  <img className="navicon" src={item.icon} alt="" />
                )}
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
