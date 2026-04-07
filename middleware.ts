import { auth0 } from '@/lib/auth0';
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

export async function middleware(request: NextRequest) {
  // Let Auth0 middleware handle /auth/* routes (login, logout, callback, profile)
  // and inject session cookies into all other responses.
  const response = await auth0.middleware(request);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));

  if (isProtected) {
    // Check for Auth0 session cookie — if absent, redirect to login
    const hasSession = request.cookies.has('__session') || request.cookies.has('appSession');
    if (!hasSession) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
