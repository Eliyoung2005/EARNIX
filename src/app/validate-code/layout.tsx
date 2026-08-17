import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Validate Code',
  description: 'Validate your EARNIX registration or upgrade code here to ensure it is genuine and ready to use.',
  openGraph: {
    title: 'Validate Code | EARNIX',
    description: 'Validate your EARNIX registration or upgrade code here to ensure it is genuine and ready to use.',
  },
};

export default function ValidateCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
