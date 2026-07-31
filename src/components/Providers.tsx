'use client';

import { SessionProvider } from 'next-auth/react';
import MaintenanceGuard from '@/components/MaintenanceGuard';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MaintenanceGuard>
        {children}
      </MaintenanceGuard>
    </SessionProvider>
  );
}
