import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/content'];
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  console.log('🔒 Middleware - Processing request:', request.nextUrl.pathname);
  
  const { supabase, response } = createClient(request);

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();
  console.log('🔑 Middleware - Session status:', session ? 'Authenticated' : 'Not authenticated');

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.includes(request.nextUrl.pathname);
  
  console.log('📍 Middleware - Route type:', {
    path: request.nextUrl.pathname,
    isProtected: isProtectedRoute,
    isAuth: isAuthRoute
  });

  // If there's no session and the user is trying to access a protected route
  if (!session && isProtectedRoute) {
    console.log('🚫 Middleware - Redirecting to login (protected route)');
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If there's a session and the user is trying to access auth pages
  if (session && isAuthRoute) {
    console.log('✅ Middleware - Redirecting to dashboard (authenticated user)');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('➡️ Middleware - Proceeding with request');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 