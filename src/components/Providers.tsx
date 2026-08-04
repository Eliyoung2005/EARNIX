'use client';

import { SessionProvider } from 'next-auth/react';
import MaintenanceGuard from '@/components/MaintenanceGuard';
import { CurrencyProvider } from '@/lib/CurrencyContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CurrencyProvider>
        <MaintenanceGuard>
          {children}
        </MaintenanceGuard>
      </CurrencyProvider>
    </SessionProvider>
  );
}
