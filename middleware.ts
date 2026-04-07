import { type NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/properties',
  '/tenants',
  '/payments',
  '/leases',
  '/maintenance',
  '/leads',
  '/reports',
  '/settings',
  '/admin',
  '/signup/company',
];

// Better Auth session cookie names (dev vs production)
const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.match(/\.(ico|svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));

  if (isProtected) {
    const hasSession = SESSION_COOKIE_NAMES.some(name =>
      request.cookies.has(name)
    );

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
