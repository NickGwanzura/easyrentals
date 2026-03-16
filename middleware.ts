import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import {
  applyCompanyHeaders,
  resolveCompanyForHostname,
} from '@/lib/whitelabel/tenant-resolver';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Get hostname
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Skip static files and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.match(/\.(.*)$/)
  ) {
    return res;
  }
  
  const company = await resolveCompanyForHostname(hostname, supabase);
  applyCompanyHeaders(requestHeaders, company);
  applyCompanyHeaders(res.headers, company);
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
