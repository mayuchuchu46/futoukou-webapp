'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'ホーム', icon: '/assets/icon_house.png' },
  { href: '/search', label: 'さがす', icon: '/assets/icon_search.png' },
  { href: '/ask', label: '相談する', icon: '/assets/icon_bulb.png' },
  { href: '/mypage', label: 'マイページ', icon: '/assets/icon_bookmark.png' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const onAskPage = pathname.startsWith('/ask');
  return (
    <>
      {!onAskPage && (
        <Link href="/ask" className="fab">
          <img src="/assets/icon_bulb.png" alt="" />
          相談する
        </Link>
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
