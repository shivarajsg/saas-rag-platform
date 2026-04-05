import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth condition based on path
  const path = request.nextUrl.pathname;
  
  // Paths that require authentication
  const authRequiredPaths = ['/dashboard', '/meal-plan', '/settings', '/profile'];
  const isAuthRequired = authRequiredPaths.some(authPath => path.startsWith(authPath));
  
  // Auth paths (login, register, etc.)
  const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
  const isAuthPath = authPaths.some(authPath => path === authPath);
  
  // Redirect if accessing auth required paths without session
  if (isAuthRequired && !session) {
    const redirectUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthPath && session) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/meal-plan/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ],
}; 