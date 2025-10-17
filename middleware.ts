import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  // API routes that should be public
  const publicApiRoutes = [
    '/api/webhooks/stripe',
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // Allow public routes without authentication
  if (isPublicRoute || isPublicApiRoute) {
    return res;
  }

  // Check if the route is protected (dashboard routes)
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/find') ||
                          pathname.startsWith('/brief') ||
                          pathname.startsWith('/exports') ||
                          pathname.startsWith('/resources') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/select-plan');

  // Redirect to login if trying to access protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in but trying to access login/signup, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - assets folder
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};





