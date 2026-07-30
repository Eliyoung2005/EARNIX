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

  const orConditions: any[] = [{ assignedVendorId: null }];
  if (userId) {
    orConditions.push({ assignedVendorId: userId });
  }

  // Fetch all active unassigned coupons AND coupons assigned to this admin
  const activeCoupons = await prisma.couponCode.findMany({
    where: { 
      status: 'UNUSED',
      OR: orConditions
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch used/redeemed coupons for the redemption history log
  const usedCoupons = await prisma.couponCode.findMany({
    where: { status: 'USED' },
    orderBy: { redeemedDate: 'desc' },
    take: 100,
    include: {
      assignedVendor: { select: { username: true, name: true } },
      redeemedBy: { select: { username: true, email: true, name: true } }
    }
  });

  // Fetch vendors for the transfer dropdown
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: { id: true, username: true }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Coupon Management &amp; Tracking</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Generate, track active codes, assign to vendors, and monitor real-time coupon redemptions.</p>
      
      <CouponManager initialCoupons={activeCoupons} usedCoupons={usedCoupons} vendors={vendors} userRole={role} />
    </div>
  );
}
