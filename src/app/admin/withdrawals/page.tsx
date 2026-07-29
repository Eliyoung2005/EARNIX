import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WithdrawalManager from "./WithdrawalManager";
import WithdrawalPortalControl from "./WithdrawalPortalControl";

export const dynamic = 'force-dynamic';

export default async function AdminWithdrawalsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;

  if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all withdrawals ordered by latest first
  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: {
      user: {
        select: {
          username: true,
          email: true,
          bankName: true,
          accountName: true,
          accountNumber: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Withdrawal Requests</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Process and manage all user payout requests.</p>
      
      <WithdrawalPortalControl />
      
      <WithdrawalManager withdrawals={withdrawals} />
    </div>
  );
}
