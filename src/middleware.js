import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export function middleware(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    // If it's an API request, return 401 JSON instead of redirecting
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/auth/login?auth=false', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except api/admin)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     * - reset-password (public reset password page)
     * - 404
     * - 500
     */
    '/((?!api/(?!admin)|_next/static|_next/image|assets|favicon.ico|auth|reset-password|404|500).*)',
  ],
};
