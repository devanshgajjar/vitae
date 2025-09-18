import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/sign-in',
    '/create',
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/auth/me',
    '/api/auth/signout',
    '/api/generate', // Allow for both demo and authenticated usage
    // '/api/profiles', // Protected so we always resolve the authenticated user
    // '/api/documents', // Protected to bind to authenticated user data
  ];

  // Check if it's a public route
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Redirect to sign-in page if no token
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  try {
    // Verify the token
    const user = await verifyJWT(token);
    
    if (!user) {
      // Invalid token, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-email', user.email);
    
    return response;
  } catch (error) {
    // Token verification failed, redirect to sign-in
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};