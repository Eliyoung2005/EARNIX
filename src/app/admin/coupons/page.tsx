import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CouponManager from "../CouponManager";

export default async function AdminCouponsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role !== 'ADMIN' && role !== 'SUB_ADMIN') {
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

  // Fetch vendors for the transfer dropdown
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: { id: true, username: true }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Coupon Management</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Generate, track, and assign PRO activation codes.</p>
      
      <CouponManager initialCoupons={activeCoupons} vendors={vendors} userRole={role} />
    </div>
  );
}
