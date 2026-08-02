import { prisma } from '@/lib/prisma';
import LandingClient from './LandingClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Query all active membership plans directly from PostgreSQL database server-side
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { level: 'asc' }
  });

  // Query all verified vendors directly from database server-side
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      accountNumber: true,
      customGreeting: true,
      telegramLink: true,
      profilePic: true
    }
  });

  return (
    <LandingClient 
      initialPlans={plans} 
      initialVendors={vendors} 
    />
  );
}
