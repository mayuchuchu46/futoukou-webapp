import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'dsk_auth';
const ADMIN_COOKIE_NAME = 'dsk_admin';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 管理画面は、一般テスター用パスワードとは別の管理者専用パスワードで保護する
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

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/expert') ||
    pathname.startsWith('/api/expert') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const authed = req.cookies.get(COOKIE_NAME)?.value === '1';
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
