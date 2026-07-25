import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminOverview() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role !== 'ADMIN' && role !== 'SUB_ADMIN') {
    redirect('/dashboard');
  }

  // Aggregate Data
  const totalUsers = await prisma.user.count();
  const freeUsers = await prisma.user.count({ where: { plan: 'FREE' } });
  const proUsers = await prisma.user.count({ where: { plan: 'PRO' } });
  const vendors = await prisma.user.count({ where: { role: 'VENDOR' } });

  const totalInflow = proUsers * 500;
  
  // Calculate Pending Withdrawals
  const pendingWithdrawalsCount = await prisma.withdrawalRequest.count({ where: { status: 'PENDING' } });
  
  // Calculate Pending Task Proofs
  const pendingTasksCount = await prisma.taskSubmission.count({ where: { status: 'PENDING' } });
  
  // Check and Reset Weekly Referrals automatically (7 days = 7 * 24 * 60 * 60 * 1000 ms)
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



  const recentActivity = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { user: true }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Platform Overview</h1>

      {/* Admin Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ff3b30', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Users</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{totalUsers.toLocaleString()}</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #f8f9fa', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Free Users</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{freeUsers.toLocaleString()}</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-gold)', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>PRO Users</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{proUsers.toLocaleString()}</div>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #4da6ff', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Code Vendors</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{vendors.toLocaleString()}</div>
        </div>

      </div>

      {/* Super Admin Financial Overview */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Financial Overview (Super Admin Only)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-blue)', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Platform Inflow</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>₦{totalInflow.toLocaleString()}</div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>Total money from PRO activations</p>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--success)', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Paid Out</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>₦0</div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>Total successful withdrawals</p>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ff3b30', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Unpaid (Pending Wallets)</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>₦0</div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>User balances yet to be withdrawn</p>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-gold)', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Net Profit</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>₦{totalInflow.toLocaleString()}</div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>Platform retained earnings</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Pending Actions */}
        <div style={{ padding: '2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ff4d4d', fontWeight: 'bold' }}>Action Required</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(100, 80, 200, 0.3)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 'bold', color: 'white' }}>Pending Task Proofs</span>
              <span style={{ background: '#ff4d4d', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>{pendingTasksCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(100, 80, 200, 0.3)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 'bold', color: 'white' }}>Pending Withdrawals</span>
              <span style={{ background: '#ff4d4d', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>{pendingWithdrawalsCount}</span>
            </div>
          </div>
        </div>

        {/* System Health / Quick Logs */}
        <div style={{ padding: '2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'white', fontWeight: 'bold' }}>Recent Activity Logs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>No recent activity recorded.</p>
            ) : (
              recentActivity.map(log => (
                <p key={log.id} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                  • <strong style={{ color: 'white' }}>{log.user?.username || 'System'}</strong>: {log.action} - {log.description}
                </p>
              ))
            )}

          </div>
        </div>



      </div>
    </div>
  );
}
