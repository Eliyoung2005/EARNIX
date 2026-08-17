import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the EARNIX Terms of Service. Understand the rules and guidelines for using our platform.',
  openGraph: {
    title: 'Terms of Service | EARNIX',
    description: 'Read the EARNIX Terms of Service. Understand the rules and guidelines for using our platform.',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
