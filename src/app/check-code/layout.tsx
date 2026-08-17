import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check Code Status',
  description: 'Check the status of your EARNIX code. Verify if your code has been used or is still active.',
  openGraph: {
    title: 'Check Code Status | EARNIX',
    description: 'Check the status of your EARNIX code. Verify if your code has been used or is still active.',
  },
};

export default function CheckCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
