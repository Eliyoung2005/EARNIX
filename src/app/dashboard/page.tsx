import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuickActions from "./QuickActions";
import CouponManager from "../admin/CouponManager";

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && searchParams?.view !== 'user') {
    redirect('/admin');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Fetch active coupons if the user is a VENDOR or ADMIN
  const isVendorOrAdmin = role === 'VENDOR' || role === 'ADMIN' || role === 'SUB_ADMIN';
  let activeCoupons: any[] = [];
  
  if (isVendorOrAdmin) {
    activeCoupons = await prisma.couponCode.findMany({
      where: { 
        assignedVendorId: userId,
        status: 'UNUSED'
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          background: 'linear-gradient(135deg, #4F46E5, #0ea5e9)', // Deep Indigo to vivid sky blue
          padding: '0.5rem 1.5rem', 
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
          maxWidth: '100%',
        }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
            fontWeight: '900', 
            color: 'white',
            margin: 0,
            wordBreak: 'break-all',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            @{user.username}
          </h1>
        </div>
        <span style={{ padding: '0.3rem 1rem', background: user.plan === 'PRO' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', color: user.plan === 'PRO' ? '#000' : 'white', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          {user.plan} PLAN
        </span>
      </div>

      {/* Upgrade Banner for FREE Users */}
      {user.plan === 'FREE' && (
        <div style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(10, 91, 255, 0.1))', border: '1px solid var(--accent-gold)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Upgrade to PRO</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Unlock Daily Login Bonuses, higher Task Earnings, and ₦250 Referral Commissions!</p>
          </div>
          <button className="btn-primary" style={{ background: 'var(--accent-gold)', color: '#000', padding: '0.75rem 2rem', fontWeight: 'bold', borderRadius: '50px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)', border: 'none' }}>
            Activate PRO for ₦500
          </button>
        </div>
      )}

      {/* Wallet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Total Balance - Hidden for FREE users */}
        {user.plan !== 'FREE' && (
          <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Affiliate Balance</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₦{user.affiliateBalance.toLocaleString()}</div>
            <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{user.referralCount} total referrals</p>
          </div>
        )}

        {/* Task Earnings */}
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Task Earnings Balance</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>₦{user.taskBalance.toLocaleString()}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Total Earnings: ₦{user.totalEarnings.toLocaleString()}</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Vendor Coupon Panel (Only visible to Vendors/Admins) */}
        {isVendorOrAdmin && (
          <CouponManager initialCoupons={activeCoupons} />
        )}

        <QuickActions username={user.username} plan={user.plan} />

        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {user.activityLogs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent activity.</p>
            ) : (
              user.activityLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{log.action}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {log.createdAt.toLocaleDateString()} at {log.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div style={{ color: log.action.includes('BONUS') ? 'var(--success)' : 'var(--accent-gold)', fontWeight: 'bold' }}>
                    {log.description}
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
