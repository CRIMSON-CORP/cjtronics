import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const isAuthPage = pathname.startsWith('/auth');

  // 1. If accessing auth pages (/auth/login, /auth/register, etc.)
  if (isAuthPage) {
    // If explicitly marked as unauthenticated/expired, clear the cookie and allow the auth page to render
    if (searchParams.get('auth') === 'false') {
      const response = NextResponse.next();
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    // Redirect to dashboard only if user has a token and is NOT flagged unauthenticated
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // 2. If unauthenticated user tries to access protected pages -> redirect to login (or 401 for API)
  if (!token && !isAuthPage) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/auth/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('continueUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
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
