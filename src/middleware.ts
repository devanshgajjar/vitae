import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow demo access to /create page
    if (req.nextUrl.pathname === '/create') {
      return NextResponse.next()
    }
    
    // All other protected routes require authentication
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to public pages
        if (req.nextUrl.pathname === '/' || 
            req.nextUrl.pathname === '/create') {
          return true
        }
        
        // Require authentication for protected pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
