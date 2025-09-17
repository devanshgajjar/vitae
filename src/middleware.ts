// Middleware completely disabled for demo purposes
// This prevents any authentication-related redirects

export default function middleware() {
  // No authentication middleware - allow all requests
  return null;
}

export const config = {
  // Don't match any routes - effectively disables middleware
  matcher: [],
}
