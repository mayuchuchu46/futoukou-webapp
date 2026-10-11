import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'dsk_admin';

// 2026-10-11：テスター限定公開のための全ページ簡易パスワードゲート（dsk_auth /
// APP_PASSWORD）を撤廃し、誰でもログインなしで通常の閲覧ができるようにした
// （SEO対応のためにもいずれ必要だった変更）。/login・/api/login はコード・ルート
// 自体は残しているが、どこからも強制されない（直接アクセスしても素通りする）。
// 管理画面（/admin）だけは、これまで通り管理者専用パスワードで保護を続ける。
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const isAdmin = req.cookies.get(ADMIN_COOKIE_NAME)?.value === '1';
    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
