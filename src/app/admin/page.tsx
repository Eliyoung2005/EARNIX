import { getAdminSession } from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CurrencyValue } from "@/components/CurrencyValue";

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const session = await getAdminSession();
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;

  if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  // ── 1. USER & PLAN MEMBERSHIP STATS ──────────────────────────────
  const totalUsersCount = await prisma.user.count({ where: { role: 'USER' } });
  const totalAllUsersCount = await prisma.user.count(); // All accounts: Users + Vendors + Admins
  const vendors = await prisma.user.count({ where: { role: 'VENDOR' } });

  // Fetch all membership plans and count total users in each plan
  const allMembershipPlans = await prisma.membershipPlan.findMany({
    orderBy: { level: 'asc' }
  });

  const unassignedUsersCount = await prisma.user.count({
    where: { role: 'USER', planId: null }
  });

  const planUserStats = await Promise.all(
    allMembershipPlans.map(async (plan) => {
      let userCount = await prisma.user.count({
        where: { role: 'USER', planId: plan.id }
      });
      // Add unassigned users to FREE plan count if this is the level 1 plan
      if (plan.level === 1 || plan.name.toUpperCase() === 'FREE') {
        userCount += unassignedUsersCount;
      }
      return {
        id: plan.id,
        name: plan.name,
        level: plan.level,
        price: plan.price,
        userCount,
        totalInflow: userCount * plan.price,
        percentage: totalUsersCount > 0 ? ((userCount / totalUsersCount) * 100).toFixed(1) : '0'
      };
    })
  );

  const usersWithPaidPlansCount = planUserStats
    .filter(p => p.price > 0)
    .reduce((sum, p) => sum + p.userCount, 0);

  // ── 2. FINANCIAL STATS ──────────────────────────────────────────
  // Inflow = sum of (paid plan users * plan price)
  const usersWithPlans = await prisma.user.findMany({
    where: { role: 'USER', membership: { price: { gt: 0 } } },
    select: { membership: { select: { name: true, price: true } } }
  });
  const totalInflow = usersWithPlans.reduce((sum, u) => sum + (u.membership?.price || 0), 0);

  const approvedWithdrawals = await prisma.withdrawalRequest.aggregate({
    _sum: { amount: true },
    where: { status: 'APPROVED' }
  });
  const totalPaidOut = approvedWithdrawals._sum.amount || 0;

  const pendingWithdrawals = await prisma.withdrawalRequest.aggregate({
    _sum: { amount: true },
    where: { status: 'PENDING' }
  });
  const totalPendingWithdrawals = pendingWithdrawals._sum.amount || 0;

  const walletAggregates = await prisma.user.aggregate({
    _sum: { taskBalance: true, affiliateBalance: true }
  });
  const totalWalletBalance = (walletAggregates._sum.taskBalance || 0) + (walletAggregates._sum.affiliateBalance || 0);

  const netProfit = totalInflow - totalPaidOut;

  // ── 3. COUPON USAGE TRACKING STATS ──────────────────────────────
  const totalCouponsCount = await prisma.couponCode.count();
  const usedCouponsCount = await prisma.couponCode.count({ where: { status: 'USED' } });
  const unusedCouponsCount = await prisma.couponCode.count({ where: { status: 'UNUSED' } });

  const recentRedeemedCoupons = await prisma.couponCode.findMany({
    where: { status: 'USED' },
    orderBy: { redeemedDate: 'desc' },
    take: 8,
    include: {
      assignedVendor: { select: { username: true, name: true } },
      redeemedBy: { select: { username: true, email: true, name: true, membership: { select: { name: true } } } }
    }
  });

  // ── 4. PENDING ACTIONS ──────────────────────────────────────────
  const pendingWithdrawalsCount = await prisma.withdrawalRequest.count({ where: { status: 'PENDING' } });
  const pendingTasksCount = await prisma.taskSubmission.count({ where: { status: 'PENDING' } });

  // Reset weekly referrals
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const usersToReset = await prisma.user.findMany({ where: { lastWeeklyReset: { lt: sevenDaysAgo } }, select: { id: true } });
  if (usersToReset.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: usersToReset.map(u => u.id) } },
      data: { weeklyReferralCount: 0, lastWeeklyReset: new Date() }
    });
  }

  const recentActivity = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { username: true } } }
  });

  // Currency formatting is now handled by the CurrencyValue client component

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Platform Overview</h1>

      {/* ── 1. User & Platform Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { 
            label: 'Total Money Generated', 
            value: <CurrencyValue amount={totalInflow} />, 
            subtext: `Revenue from ${usersWithPaidPlansCount} paid plans`,
            border: 'var(--success)', 
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          },
          { 
            label: 'Total Platform Users', 
            value: totalUsersCount.toLocaleString(), 
            subtext: `${totalAllUsersCount.toLocaleString()} total accounts (incl. vendors/admins)`,
            border: '#ff3b30', 
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          },
          { 
            label: 'Paid Plan Users', 
            value: usersWithPaidPlansCount.toLocaleString(), 
            subtext: `${((usersWithPaidPlansCount / (totalUsersCount || 1)) * 100).toFixed(1)}% of total users`,
            border: 'var(--accent-gold)', 
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9 6 3"/></svg>
          },
          { 
            label: 'Code Vendors', 
            value: vendors.toLocaleString(), 
            subtext: 'Authorized coupon vendors',
            border: '#4da6ff', 
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          },
          { 
            label: 'Redeemed Coupons', 
            value: usedCouponsCount.toLocaleString(), 
            subtext: `${unusedCouponsCount.toLocaleString()} unused codes remaining`,
            border: 'var(--success)', 
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          },
        ].map(card => (
          <div key={card.label} style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${card.border}`, background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {card.svg} <span>{card.label}</span>
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{card.value}</div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* ── 2. Users in Each Plan Breakdown Section ── */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '3rem', border: '1px solid rgba(10, 91, 255, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              User Membership Distribution (Total: {totalUsersCount.toLocaleString()} Users)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Total users in each membership plan and percentage breakdown across the platform.
            </p>
          </div>
          <Link href="/admin/memberships" style={{ padding: '0.5rem 1.25rem', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>
            Manage Plans →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {planUserStats.map((plan) => {
            const isPaid = plan.price > 0;
            return (
              <div key={plan.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${isPaid ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isPaid ? 'var(--accent-gold)' : 'white' }}>
                    {plan.name} PLAN
                  </span>
                  <span style={{ fontSize: '0.75rem', background: isPaid ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.08)', color: isPaid ? 'var(--accent-gold)' : 'var(--text-secondary)', padding: '0.15rem 0.5rem', borderRadius: '50px', fontWeight: 'bold' }}>
                    {plan.price === 0 ? 'FREE' : <CurrencyValue amount={plan.price} />}
                  </span>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '0.25rem' }}>
                  {plan.userCount.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>users</span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '50px', overflow: 'hidden', margin: '0.6rem 0' }}>
                  <div style={{ width: `${plan.percentage}%`, height: '100%', background: isPaid ? 'var(--accent-gold)' : 'var(--accent-blue)', borderRadius: '50px', transition: 'width 0.5s ease' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{plan.percentage}% of total users</span>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}><CurrencyValue amount={plan.totalInflow} /></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Redeemed Coupon Code Usage Tracking Section ── */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '3rem', border: '1px solid rgba(40,199,111,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--success)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Coupon Redemption &amp; Usage History
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Real-time monitoring of redeemed activation coupon codes across the platform ({usedCouponsCount.toLocaleString()} total used).
            </p>
          </div>
          <Link href="/admin/coupons" style={{ padding: '0.5rem 1.25rem', borderRadius: '50px', background: 'rgba(40,199,111,0.15)', border: '1px solid rgba(40,199,111,0.3)', color: 'var(--success)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>
            Coupon Manager ({unusedCouponsCount.toLocaleString()} Unused) →
          </Link>
        </div>

        {recentRedeemedCoupons.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No coupon codes have been redeemed yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.8rem 1rem' }}>Coupon Code</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Redeemed By User</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Vendor Issuer</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Activated Plan</th>
                  <th style={{ padding: '0.8rem 1rem' }}>Date &amp; Time Redeemed</th>
                </tr>
              </thead>
              <tbody>
                {recentRedeemedCoupons.map((coupon) => (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                      {coupon.code}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'white', fontWeight: 'bold' }}>
                      {coupon.redeemedBy ? (
                        <div>
                          <div>@{coupon.redeemedBy.username}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{coupon.redeemedBy.email}</div>
                        </div>
                      ) : 'System / Unknown'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {coupon.assignedVendor ? `@${coupon.assignedVendor.username}` : 'Direct Admin Issue'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(40,199,111,0.15)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 'bold', border: '1px solid rgba(40,199,111,0.3)' }}>
                        {coupon.redeemedBy?.membership?.name || 'PRO'} PLAN
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {coupon.redeemedDate ? new Date(coupon.redeemedDate).toLocaleString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Financial Overview ── */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Financial Overview
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>Live Database Summary</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

        {/* INFLOW */}
        <div style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(40,199,111,0.3)', background: 'linear-gradient(135deg, rgba(40,199,111,0.12) 0%, rgba(40,199,111,0.04) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--success)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Total Inflow</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--success)' }}><CurrencyValue amount={totalInflow} /></div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
            From {usersWithPaidPlansCount} paid plan registrations/upgrades
          </p>
        </div>

        {/* PAID OUT */}
        <div style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,59,48,0.3)', background: 'linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.03) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#ff3b30' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Total Paid Out</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ff3b30' }}><CurrencyValue amount={totalPaidOut} /></div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
            Approved withdrawals disbursed to users
          </p>
        </div>

        {/* PENDING */}
        <div style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.3)', background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--warning)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/></svg>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Pending Payouts</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--warning)' }}><CurrencyValue amount={totalPendingWithdrawals} /></div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
            {pendingWithdrawalsCount} withdrawal request{pendingWithdrawalsCount !== 1 ? 's' : ''} awaiting approval
          </p>
        </div>

        {/* USER WALLETS */}
        <div style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(10,91,255,0.3)', background: 'linear-gradient(135deg, rgba(10,91,255,0.1) 0%, rgba(10,91,255,0.03) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>User Wallet Balances</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-blue)' }}><CurrencyValue amount={totalWalletBalance} /></div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
            Total sitting in user wallets (not yet withdrawn)
          </p>
        </div>

        {/* NET PROFIT */}
        <div style={{ padding: '1.75rem', borderRadius: '16px', border: `1px solid ${netProfit >= 0 ? 'rgba(212,175,55,0.4)' : 'rgba(255,59,48,0.4)'}`, background: `linear-gradient(135deg, ${netProfit >= 0 ? 'rgba(212,175,55,0.15)' : 'rgba(255,59,48,0.1)'} 0%, rgba(0,0,0,0.1) 100%)`, gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: netProfit >= 0 ? 'var(--accent-gold)' : '#ff3b30' }}>
            {netProfit >= 0 ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
            )}
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Net Profit</p>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: netProfit >= 0 ? 'var(--accent-gold)' : '#ff3b30' }}>
            {netProfit < 0 ? '-' : ''}<CurrencyValue amount={Math.abs(netProfit)} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
            Inflow (<CurrencyValue amount={totalInflow} />) − Paid Out (<CurrencyValue amount={totalPaidOut} />)
          </p>
        </div>

      </div>

      {/* ── 5. Pending Actions & Recent Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div style={{ padding: '2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ff4d4d', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Action Required
          </h2>
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

        <div style={{ padding: '2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1042a3 0%, #0d2875 100%)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Recent System Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>No recent activity recorded.</p>
            ) : (
              recentActivity.map(log => (
                <div key={log.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, fontWeight: 'bold' }}>
                    {log.user?.username || 'System'} — <span style={{ color: 'var(--accent-gold)' }}>{log.action}</span>
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>{log.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
