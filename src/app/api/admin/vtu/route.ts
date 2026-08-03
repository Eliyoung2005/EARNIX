export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transactions = await prisma.vtuTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 150,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            membership: {
              select: { name: true }
            }
          }
        }
      }
    });

    const totalCount = transactions.length;
    const totalAmount = transactions.filter(t => t.status === 'APPROVED' || t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0);
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

    const networkStats = {
      MTN: transactions.filter(t => t.network === 'MTN' && (t.status === 'APPROVED' || t.status === 'SUCCESS')).reduce((acc, t) => acc + t.amount, 0),
      AIRTEL: transactions.filter(t => t.network === 'AIRTEL' && (t.status === 'APPROVED' || t.status === 'SUCCESS')).reduce((acc, t) => acc + t.amount, 0),
      GLO: transactions.filter(t => t.network === 'GLO' && (t.status === 'APPROVED' || t.status === 'SUCCESS')).reduce((acc, t) => acc + t.amount, 0),
      NINE_MOBILE: transactions.filter(t => t.network === 'NINE_MOBILE' && (t.status === 'APPROVED' || t.status === 'SUCCESS')).reduce((acc, t) => acc + t.amount, 0)
    };

    const walletStats = {
      TASK: transactions.filter(t => t.walletSource === 'TASK').reduce((acc, t) => acc + t.amount, 0),
      AFFILIATE: transactions.filter(t => t.walletSource === 'AFFILIATE').reduce((acc, t) => acc + t.amount, 0)
    };

    return NextResponse.json({
      success: true,
      totalCount,
      totalAmount,
      pendingCount,
      networkStats,
      walletStats,
      transactions
    });
  } catch (error: any) {
    console.error('Admin VTU Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ADMIN APPROVE OR REJECT VTU PURCHASES
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { transactionId, action } = body; // action: 'APPROVE' or 'REJECT'

    if (!transactionId || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ error: 'Invalid transaction ID or action parameter.' }, { status: 400 });
    }

    const transaction = await prisma.vtuTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'VTU Transaction not found.' }, { status: 404 });
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ error: `Transaction has already been marked as ${transaction.status}.` }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (action === 'APPROVE') {
        const approvedTx = await tx.vtuTransaction.update({
          where: { id: transactionId },
          data: { status: 'APPROVED' }
        });

        await tx.activityLog.create({
          data: {
            action: 'VTU_PURCHASE_APPROVED',
            description: `Admin approved VTU ${transaction.type} purchase of ₦${transaction.amount.toLocaleString()} for ${transaction.phoneNumber}. Ref: ${transaction.reference}`,
            userId: transaction.userId
          }
        });

        return approvedTx;
      } else {
        // REJECT ACTION: Update status & Refund balance back to user
        const rejectedTx = await tx.vtuTransaction.update({
          where: { id: transactionId },
          data: { status: 'REJECTED' }
        });

        const refundData = transaction.walletSource === 'TASK'
          ? { taskBalance: { increment: transaction.amount } }
          : { affiliateBalance: { increment: transaction.amount } };

        await tx.user.update({
          where: { id: transaction.userId },
          data: refundData
        });

        await tx.activityLog.create({
          data: {
            action: 'VTU_PURCHASE_REJECTED_REFUNDED',
            description: `Admin rejected VTU ${transaction.type} purchase. Refunded ₦${transaction.amount.toLocaleString()} back to user's ${transaction.walletSource} wallet. Ref: ${transaction.reference}`,
            userId: transaction.userId
          }
        });

        return rejectedTx;
      }
    });

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' 
        ? `VTU purchase ${transaction.reference} approved successfully!`
        : `VTU purchase ${transaction.reference} rejected and ₦${transaction.amount.toLocaleString()} refunded to user.`,
      transaction: updated
    });

  } catch (error: any) {
    console.error('Admin VTU Approval Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
