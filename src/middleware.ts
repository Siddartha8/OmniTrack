import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ultra-fast synchronous middleware to bypass Vercel Edge Timeouts
  
  // 1. Check if ANY Supabase auth cookie exists natively
  const hasAuthCookie = request.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth');

  // 2. Logic
  if (isAuthRoute) {
    if (hasAuthCookie) {
      // Logged in, don't allow access to login page
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected routes
  if (!hasAuthCookie) {
    // Not logged in, force login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
