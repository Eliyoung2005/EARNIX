import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardNavigation from './DashboardNavigation';
import WelcomePopup from './WelcomePopup';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any)?.id;
  console.log("[DASHBOARD_LAYOUT] userId:", userId, "typeof:", typeof userId);
  
  if (!userId) {
    console.log("[DASHBOARD_LAYOUT] Redirecting to login because no userId");
    redirect('/login');
  }

  // Safety return in case redirect() fails to throw (Next.js bug workaround)
  if (!userId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true, membership: { select: { name: true, level: true } }, taskBalance: true, affiliateBalance: true, hasSeenWelcomePopup: true }
  });

  if (!dbUser) {
    redirect('/login');
  }
  if (!dbUser) return null;
  
  const settings = await prisma.platformSettings.findUnique({ where: { id: "1" } });

  const userPlanName = dbUser.membership?.name || 'FREE';
  const isUpgraded = (dbUser.membership?.level || 1) > 1;

  const user = {
    name: dbUser.name,
    username: dbUser.username,
    plan: userPlanName,
    initials: dbUser.name ? dbUser.name.substring(0, 2).toUpperCase() : 'U',
    balance: dbUser.taskBalance + dbUser.affiliateBalance
  };

  const showPopup = settings?.welcomePopupEnabled && !dbUser.hasSeenWelcomePopup;
  const popupTitle = isUpgraded ? settings?.welcomePopupTitlePro : settings?.welcomePopupTitleFree;
  const popupMessage = isUpgraded ? settings?.welcomePopupMessagePro : settings?.welcomePopupMessageFree;

  return (
    <>
      {showPopup && <WelcomePopup title={popupTitle || 'Welcome'} message={popupMessage || 'Welcome to EARNIX'} />}
      <DashboardNavigation user={user}>
        {children}
      </DashboardNavigation>
    </>
  );
}
