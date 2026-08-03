import { getAdminSession } from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CouponManager from "../CouponManager";

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const session = await getAdminSession();
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    select: { id: true, name: true, price: true },
    orderBy: { level: 'asc' }
  });

  // Fetch all active unused coupons (unassigned pool + all vendor assigned)
  const activeCoupons = await prisma.couponCode.findMany({
    where: { status: 'UNUSED' },
    orderBy: { createdAt: 'desc' },
    include: {
      assignedVendor: { select: { id: true, username: true } },
      plan: { select: { id: true, name: true } }
    }
  });

  // Fetch used/redeemed coupons for the redemption history log
  const usedCoupons = await prisma.couponCode.findMany({
    where: { status: 'USED' },
    orderBy: { redeemedDate: 'desc' },
    take: 100,
    include: {
      assignedVendor: { select: { id: true, username: true, name: true } },
      redeemedBy: { select: { username: true, email: true, name: true } },
      plan: { select: { id: true, name: true } }
    }
  });

  // Fetch vendors for the transfer dropdown & stats breakdown
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: { id: true, username: true, name: true }
  });

  // Fetch all vendor assigned coupons to calculate exact sales & remaining stats per vendor & plan
  const vendorCoupons = await prisma.couponCode.findMany({
    where: { assignedVendorId: { not: null } },
    select: {
      assignedVendorId: true,
      status: true,
      planId: true,
      plan: { select: { id: true, name: true } }
    }
  });

  const vendorStatsMap: Record<string, {
    id: string;
    username: string;
    name?: string | null;
    plans: Record<string, { planName: string; available: number; sold: number; total: number }>;
    totalAvailable: number;
    totalSold: number;
    totalAssigned: number;
  }> = {};

  vendors.forEach(v => {
    vendorStatsMap[v.id] = {
      id: v.id,
      username: v.username,
      name: v.name,
      plans: {},
      totalAvailable: 0,
      totalSold: 0,
      totalAssigned: 0
    };
  });

  vendorCoupons.forEach(c => {
    if (!c.assignedVendorId || !vendorStatsMap[c.assignedVendorId]) return;
    const vStats = vendorStatsMap[c.assignedVendorId];
    const planKey = c.plan?.name || 'Legacy';

    if (!vStats.plans[planKey]) {
      vStats.plans[planKey] = { planName: planKey, available: 0, sold: 0, total: 0 };
    }

    vStats.plans[planKey].total++;
    vStats.totalAssigned++;

    if (c.status === 'UNUSED') {
      vStats.plans[planKey].available++;
      vStats.totalAvailable++;
    } else if (c.status === 'USED') {
      vStats.plans[planKey].sold++;
      vStats.totalSold++;
    }
  });

  const vendorStats = Object.values(vendorStatsMap);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Coupon Management &amp; Tracking</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Generate, track active codes, assign to vendors, and monitor real-time coupon redemptions.</p>
      
      <CouponManager 
        initialCoupons={activeCoupons as any} 
        usedCoupons={usedCoupons} 
        vendors={vendors} 
        plans={plans} 
        vendorStats={vendorStats}
        userRole={role} 
      />
    </div>
  );
}


