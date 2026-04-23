import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // If Supabase keys are missing, just bypass middleware entirely so the app doesn't crash in an infinite loop while we configure it.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user;

    // Define public routes
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')) {
      if (user) {
        // If logged in, send them to dashboard
        return NextResponse.redirect(new URL('/', request.url))
      }
      return response;
    }

    // All other routes are protected
    if (!user) {
      // If not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (err) {
    // Failsafe catch block to prevent crash loops
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
