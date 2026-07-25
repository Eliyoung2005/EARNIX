import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StaffManager from "./StaffManager";

export default async function StaffManagementPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch Sub-Admins
  const subAdmins = await prisma.user.findMany({
    where: { role: 'SUB_ADMIN' },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch Vendors and include their coupon performance
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    include: {
      assignedCoupons: true,
      redeemedCoupons: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Staff & Vendor Monitoring</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Monitor performance, set permissions, and manage passwords for Sub-Admins and Vendors.</p>
      
      <StaffManager subAdmins={subAdmins} vendors={vendors} />
    </div>
  );
}
