import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Bypass auth in E2E test mode (set via header or cookie)
  const testMode = request.headers.get('x-e2e-test') || request.cookies.get('e2e_test_mode');
  if (testMode) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('prototype_auth');

  if (!authCookie) {
    const url = new URL('/password', request.url);
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!password|_next/static|_next/image|favicon.ico|api).*)'],
};
