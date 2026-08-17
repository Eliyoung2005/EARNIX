import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Earners',
  description: 'View the leaderboard of the top earners on EARNIX. See who is making the most and join the ranks.',
  openGraph: {
    title: 'Top Earners | EARNIX',
    description: 'View the leaderboard of the top earners on EARNIX. See who is making the most and join the ranks.',
  },
};

export default function TopEarnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
