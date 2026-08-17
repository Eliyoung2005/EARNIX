import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the EARNIX Privacy Policy. Learn how we collect, use, and protect your personal data on our platform.',
  openGraph: {
    title: 'Privacy Policy | EARNIX',
    description: 'Read the EARNIX Privacy Policy. Learn how we collect, use, and protect your personal data.',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
