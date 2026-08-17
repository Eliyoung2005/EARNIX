import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verified Vendors',
  description: 'Browse our list of verified vendors on EARNIX to purchase your registration code safely.',
  openGraph: {
    title: 'Verified Vendors | EARNIX',
    description: 'Browse our list of verified vendors on EARNIX to purchase your registration code safely.',
  },
};

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
