import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token && !!token.id;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');

    if (isAuthPage) {
      // Allowed: Let authenticated users view the auth pages if they want to.
      return null;
    }

    if (!isAuth && (isAdminRoute || isDashboardRoute)) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
    }

    if (isAdminRoute && token?.role !== 'ADMIN' && token?.role !== 'SUB_ADMIN' && token?.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true // Let the middleware function handle the logic
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
