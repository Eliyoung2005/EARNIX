export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requestId, action } = await req.json();

    if (!requestId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      await prisma.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      });
      
      // Log it
      await prisma.activityLog.create({
        data: {
          action: 'APPROVED_WITHDRAWAL',
          description: `Approved ₦${withdrawal.amount} withdrawal for ${withdrawal.user.username}`,
          userId: (session.user as any).id
        }
      });
    } else if (action === 'REJECT') {
      // Refund the user
      const balanceField = withdrawal.type === 'AFFILIATE' ? 'affiliateBalance' : 'taskBalance';
      
      await prisma.$transaction([
        prisma.withdrawalRequest.update({
          where: { id: requestId },
          data: { status: 'REJECTED' }
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: {
            [balanceField]: { increment: withdrawal.amount }
          }
        }),
        prisma.activityLog.create({
          data: {
            action: 'REJECTED_WITHDRAWAL',
            description: `Rejected ₦${withdrawal.amount} withdrawal for ${withdrawal.user.username} and refunded their balance.`,
            userId: (session.user as any).id
          }
        })
      ]);
    }

    return NextResponse.json({ message: `Withdrawal successfully ${action.toLowerCase()}ed.` });

  } catch (error: any) {
    console.error('Withdrawal Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
