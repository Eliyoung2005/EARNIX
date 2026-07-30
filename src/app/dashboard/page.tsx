import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuickActions from "./QuickActions";
import UpgradeBannerButton from "./UpgradeBannerButton";
import CouponManager from "../admin/CouponManager";
import { getBadgeProps } from "@/lib/badgeUtils";

export const dynamic = 'force-dynamic';

export default async function DashboardOverview(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
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
      membership: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  const userPlanName = user.membership?.name || 'FREE';
  const userPlanLevel = user.membership?.level || 1;

  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { level: 'asc' }
  });

  const nextPlan = plans.find(p => p.level > userPlanLevel);

  // Fetch active coupons if the user is an ADMIN, or vendor summary if VENDOR
  const userRoleStr = (user.role as string);
  const isAdmin = ['ADMIN', 'SUB_ADMIN', 'SUPER_ADMIN'].includes(userRoleStr);
  const isVendor = userRoleStr === 'VENDOR';
  let activeCoupons: any[] = [];
  let vendorAssignedCount = 0;
  
  if (isAdmin) {
    activeCoupons = await prisma.couponCode.findMany({
      where: { 
        assignedVendorId: userId,
        status: 'UNUSED'
      },
      orderBy: { createdAt: 'desc' }
    });
  } else if (isVendor) {
    vendorAssignedCount = await prisma.couponCode.count({
      where: { 
        assignedVendorId: userId,
        status: 'UNUSED'
      }
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          background: 'linear-gradient(135deg, #4F46E5, #0ea5e9)', 
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
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            @{user.username}
            {getBadgeProps(userPlanName).icon && (
              <span title={`${userPlanName} Member`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: getBadgeProps(userPlanName).bg, color: getBadgeProps(userPlanName).color, borderRadius: '50%', width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                {getBadgeProps(userPlanName).icon}
              </span>
            )}
          </h1>
        </div>
        <span style={{ padding: '0.3rem 1rem', background: getBadgeProps(userPlanName).bg, color: getBadgeProps(userPlanName).color, borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          {userPlanName} PLAN
        </span>
      </div>

      {/* Dynamic Upgrade Banner */}
      {nextPlan && (
        <div style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(10, 91, 255, 0.1))', border: '1px solid var(--accent-gold)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Upgrade to {nextPlan.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{nextPlan.description}</p>
          </div>
          <UpgradeBannerButton nextPlanName={nextPlan.name} price={nextPlan.price} />
        </div>
      )}

      {/* Wallet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Total Balance - Hidden for FREE users */}
        {userPlanLevel > 1 && (
          <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Affiliate Balance</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₦{user.affiliateBalance.toLocaleString()}</div>
            <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{user.referralCount} total referrals</p>
          </div>
        )}

        {/* Task Earnings (includes Welcome Bonus) */}
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle background glow */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Task + Bonus Balance</p>
            <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', padding: '0.15rem 0.5rem', borderRadius: '50px', border: '1px solid rgba(212,175,55,0.3)', fontWeight: 'bold' }}>
              Withdrawable
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>₦{user.taskBalance.toLocaleString()}</div>
        </div>

      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Admin Coupon Panel (Only visible to Admins) */}
        {isAdmin && (
          <CouponManager initialCoupons={activeCoupons} userRole={user.role} />
        )}

        {/* Vendor Quick Card (Only visible to Vendors) */}
        {isVendor && (
          <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', margin: 0 }}>Vendor Operations</h2>
              <span style={{ fontSize: '0.75rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--accent-gold)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 'bold' }}>
                AUTHORIZED VENDOR
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Manage your allocated activation codes, set custom WhatsApp sales greetings, and track live redemptions.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Available Unused Codes</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{vendorAssignedCount}</span>
              </div>
              <a href="/dashboard/vendor" className="btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-gold)', color: '#000', fontWeight: 'bold', textDecoration: 'none', borderRadius: '8px' }}>
                Go to Vendor Dashboard
              </a>
            </div>
          </div>
        )}

        <QuickActions username={user.username} plan={userPlanName} />

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
