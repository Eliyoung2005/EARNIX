import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new EARNIX account. Join our platform for SoftLife and start your stress-free earnings journey.',
  openGraph: {
    title: 'Register | EARNIX',
    description: 'Create a new EARNIX account. Join our platform for SoftLife and start your stress-free earnings journey.',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
