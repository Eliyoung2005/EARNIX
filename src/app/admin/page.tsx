import { getAdminSession } from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

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
    <AdminDashboardClient
      totalUsersCount={totalUsersCount}
      totalAllUsersCount={totalAllUsersCount}
      usersWithPaidPlansCount={usersWithPaidPlansCount}
      vendors={vendors}
      usedCouponsCount={usedCouponsCount}
      unusedCouponsCount={unusedCouponsCount}
      planUserStats={planUserStats}
      totalInflow={totalInflow}
      totalPaidOut={totalPaidOut}
      totalPendingWithdrawals={totalPendingWithdrawals}
      totalWalletBalance={totalWalletBalance}
      netProfit={netProfit}
      pendingWithdrawalsCount={pendingWithdrawalsCount}
      pendingTasksCount={pendingTasksCount}
      recentRedeemedCoupons={recentRedeemedCoupons}
      recentActivity={recentActivity}
    />
  );
}
