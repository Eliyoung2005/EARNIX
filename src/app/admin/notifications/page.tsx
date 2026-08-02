import { prisma } from '@/lib/prisma';
import WelcomePopupSettingsForm from './WelcomePopupSettingsForm';
import BroadcastForm from './BroadcastForm';
import PreviousBroadcastsList from './PreviousBroadcastsList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminNotifications() {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "1" } });
  
  // Fetch actual previous manual broadcasts from PostgreSQL database
  const broadcasts = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Broadcast Pop Notifications</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Welcome Popup Settings (1-Time Pop) */}
        {settings && <WelcomePopupSettingsForm settings={settings} />}

        <div className="grid-1-1">
          {/* Send Notification Form */}
          <BroadcastForm />

          {/* Previous Broadcasts List */}
          <PreviousBroadcastsList broadcasts={broadcasts} />
        </div>

      </div>
    </div>
  );
}
