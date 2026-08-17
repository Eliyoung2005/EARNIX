import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your EARNIX account to access your dashboard, complete tasks, and track your earnings.',
  openGraph: {
    title: 'Login | EARNIX',
    description: 'Sign in to your EARNIX account to access your dashboard, complete tasks, and track your earnings.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
