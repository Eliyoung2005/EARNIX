import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token && !!token.id;
    const pathname = req.nextUrl.pathname;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isAdminLoginPage = pathname === '/admin/login';
    const isAdminRoute = pathname.startsWith('/admin') && !isAdminLoginPage;
    const isDashboardRoute = pathname.startsWith('/dashboard');

    // Always allow auth pages and admin login page
    if (isAuthPage || isAdminLoginPage) {
      // If already logged in as admin, skip admin/login and go straight to /admin
      if (isAdminLoginPage && isAuth && (token?.role === 'ADMIN' || token?.role === 'SUB_ADMIN')) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    // Redirect unauthenticated users away from protected routes to standard /login
    if (!isAuth && (isAdminRoute || isDashboardRoute || isAdminLoginPage)) {
      const from = req.nextUrl.pathname + (req.nextUrl.search || '');
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
    }

    // Block non-admins from /admin routes
    if (isAdminRoute && token?.role !== 'ADMIN' && token?.role !== 'SUB_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET || "earnix-super-secret-key-for-jwt-2026",
    callbacks: {
      authorized: () => true // Let the middleware function handle all logic
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
