'use client';

import type { CSSProperties, ReactNode } from 'react';

// /out（中継ルート）へのリンク。診断ページ等から来た場合、その遷移元(src)を
// クリック計測に付けるため、クリック時にsessionStorageの値をURLへ足す。
// sessionStorageが使えない環境ではsrcなしでそのまま遷移する（計測は壊れない）。
export default function TrackedOutLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      style={style}
      onClick={(e) => {
        try {
          const src = sessionStorage.getItem('outSrc');
          if (src && /^[a-z0-9-]{1,32}$/.test(src)) {
            e.currentTarget.href = `${href}&src=${src}`;
          }
        } catch {
          // 無視
        }
      }}
    >
      {children}
    </a>
  );
}
