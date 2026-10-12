'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ITEMS = [
  { href: '/', label: 'ホーム', icon: '/assets/icon_house.png' },
  { href: '/ask', label: '相談する', icon: '/assets/icon_bulb.png' },
  // 分析ノートは独立したタブにして常時アクセスできるようにする（元はマイページ内のカードだった）。
  // アイコンはノートを連想させるicon_book、マイページは元のicon_bookmarkに戻す。
  { href: '/notebook', label: '分析ノート', icon: '/assets/icon_book.png' },
  { href: '/mypage', label: 'マイページ', icon: '/assets/icon_bookmark.png' },
];

// ある程度スクロールしたら、フッター付近にページ先頭へ戻るボタンを出す。
// 「相談する」のfabと左右対称の位置に置き、重ならないようにする。
const SCROLL_TOP_SHOW_THRESHOLD = 400;

export default function BottomNav() {
  const pathname = usePathname();
  const onAskPage = pathname.startsWith('/ask');
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
      {!onAskPage && (
        <Link href="/ask" className="fab">
          <img src="/assets/icon_bulb.png" alt="" />
          相談する
        </Link>
      )}
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
      <nav className="nav">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <button className={active ? 'active' : ''}>
                <img className="navicon" src={item.icon} alt="" />
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
