'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Exempt admin routes, api routes, and maintenance page itself
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname === '/maintenance') {
      return;
    }

    const checkMaintenance = async () => {
      try {
        const res = await fetch('/api/maintenance', { cache: 'no-store' });
        const data = await res.json();
        const active = !!data.maintenanceMode;

        // Check if logged-in user is an admin role who can bypass maintenance
        const role = (session?.user as any)?.role;
        const isAdmin = role === 'ADMIN' || role === 'SUB_ADMIN' || role === 'SUPER_ADMIN';

        if (active && !isAdmin) {
          if (pathname !== '/maintenance') {
            router.replace('/maintenance');
          }
        }
      } catch (err) {
        console.error('Error checking maintenance status:', err);
      }
    };

    checkMaintenance();
  }, [pathname, session, router]);

  return <>{children}</>;
}
