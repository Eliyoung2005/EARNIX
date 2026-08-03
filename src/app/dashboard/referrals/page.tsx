import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReferralsClient from "./ReferralsClient";

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      referralCount: true,
      weeklyReferralCount: true,
      affiliateBalance: true,
      membership: {
        select: { name: true }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#fff' }}>
          Referrals & Affiliate Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Share your referral link with friends and earn commission.
        </p>
      </div>

      <ReferralsClient
        username={user.username}
        referralCount={user.referralCount || 0}
        weeklyReferralCount={user.weeklyReferralCount || 0}
        affiliateBalance={user.affiliateBalance || 0}
        planName={user.membership?.name || 'FREE'}
      />
    </div>
  );
}
