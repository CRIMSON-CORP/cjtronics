import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const isAuthPage = pathname.startsWith('/auth');

  // 1. If logged-in user tries to access auth pages (/auth/login, /auth/register, etc.) -> redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. If unauthenticated user tries to access protected pages -> redirect to login (or 401 for API)
  if (!token && !isAuthPage) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (except api/admin)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets & favicon.ico
     * - 404 & 500
     */
    '/((?!api/(?!admin)|_next/static|_next/image|assets|favicon.ico|404|500).*)',
  ],
};
