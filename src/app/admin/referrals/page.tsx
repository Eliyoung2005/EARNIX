import { getAdminSession } from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminReferralsPage() {
  const session = await getAdminSession();
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'SUB_ADMIN') {
    redirect('/dashboard');
  }

  // Handle Automatic Reset (7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const usersToReset = await prisma.user.findMany({
    where: { lastWeeklyReset: { lt: sevenDaysAgo } },
    select: { id: true }
  });
  
  if (usersToReset.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: usersToReset.map(u => u.id) } },
      data: { weeklyReferralCount: 0, lastWeeklyReset: new Date() }
    });
  }

  // Fetch Top 50 All Time
  const topAllTime = await prisma.user.findMany({
    orderBy: { referralCount: 'desc' },
    take: 50,
    select: { id: true, username: true, email: true, referralCount: true }
  });

  // Fetch Top 50 This Week
  const topWeekly = await prisma.user.findMany({
    orderBy: { weeklyReferralCount: 'desc' },
    take: 50,
    select: { id: true, username: true, email: true, weeklyReferralCount: true }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Referral Leaderboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Extended view of the top 50 referrers across the platform.</p>
      
      <div className="grid-1-1">
        
        {/* Extended All Time Leaderboard */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Top 50 (All Time)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topAllTime.map((user, index) => (
              <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '35px', height: '35px', borderRadius: '50%', 
                    background: index === 0 ? 'var(--accent-gold)' : index === 1 ? '#e0e0e0' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)', 
                    color: index < 3 ? '#000' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{user.username}</p>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{user.email}</p>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: index === 0 ? 'var(--accent-gold)' : index === 1 ? '#e0e0e0' : index === 2 ? '#cd7f32' : 'var(--text-secondary)' }}>
                  {user.referralCount} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Refs</span>
                </div>
              </div>
            ))}
            {topAllTime.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No referrers yet.</p>}
          </div>
        </div>

        {/* Extended Weekly Leaderboard */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#4da6ff' }}>Top 50 (This Week)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topWeekly.map((user, index) => (
              <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '35px', height: '35px', borderRadius: '50%', 
                    background: index === 0 ? '#4da6ff' : index === 1 ? '#e0e0e0' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)', 
                    color: index < 3 ? '#000' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{user.username}</p>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{user.email}</p>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: index === 0 ? '#4da6ff' : index === 1 ? '#e0e0e0' : index === 2 ? '#cd7f32' : 'var(--text-secondary)' }}>
                  {user.weeklyReferralCount} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Refs</span>
                </div>
              </div>
            ))}
            {topWeekly.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No referrers this week.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
