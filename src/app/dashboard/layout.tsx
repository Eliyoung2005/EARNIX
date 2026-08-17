import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardNavigation from './DashboardNavigation';
import WelcomePopup from './WelcomePopup';
import UpgradeThankYouPopup from './UpgradeThankYouPopup';
import GlobalBroadcastPopup from './GlobalBroadcastPopup';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
    select: { 
      name: true, 
      username: true, 
      role: true, 
      membership: { select: { name: true, level: true } }, 
      taskBalance: true, 
      affiliateBalance: true, 
      hasSeenWelcomePopup: true,
      pendingUpgradeThankYou: true 
    }
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
    role: dbUser.role,
    plan: userPlanName,
    initials: dbUser.name ? dbUser.name.substring(0, 2).toUpperCase() : 'U',
    balance: dbUser.taskBalance + dbUser.affiliateBalance
  };

  const isRegularUser = dbUser.role === 'USER';
  const showPopup = isRegularUser && settings?.welcomePopupEnabled && !dbUser.hasSeenWelcomePopup;
  const popupTitle = settings?.welcomePopupTitleFree || 'Welcome to EARNIX!';
  const popupMessage = settings?.welcomePopupMessageFree || 'We are excited to have you on board! Start completing tasks today to earn real cash.';
  const popupLink = settings?.welcomePopupLink || null;

  // Query latest global manual broadcast popup notification for this user
  const audienceFilter: any[] = [
    { targetAudience: 'ALL' },
    { targetAudience: userPlanName.toUpperCase() },
    { targetUserId: userId }
  ];

  const latestGlobalNotification = await prisma.notification.findFirst({
    where: {
      OR: audienceFilter
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      {showPopup && <WelcomePopup title={popupTitle} message={popupMessage} link={popupLink} />}
      {dbUser.pendingUpgradeThankYou && <UpgradeThankYouPopup planName={dbUser.pendingUpgradeThankYou} />}
      {latestGlobalNotification && (
        <GlobalBroadcastPopup 
          notification={{
            id: latestGlobalNotification.id,
            title: latestGlobalNotification.title,
            message: latestGlobalNotification.message,
            link: latestGlobalNotification.link,
            createdAt: latestGlobalNotification.createdAt
          }} 
        />
      )}
      <DashboardNavigation user={user}>
        {children}
      </DashboardNavigation>
    </>
  );
}
