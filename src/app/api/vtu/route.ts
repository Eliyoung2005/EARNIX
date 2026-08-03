export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VtuNetwork, VtuType, WithdrawalType } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        membership: true,
        vtuTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planName = user.membership?.name?.toUpperCase() || 'FREE';
    const isEligible = planName.includes('VIP') || planName.includes('ELITE');

    return NextResponse.json({
      isEligible,
      planName,
      taskBalance: user.taskBalance || 0,
      affiliateBalance: user.affiliateBalance || 0,
      vtuTransactions: user.vtuTransactions || []
    });
  } catch (error: any) {
    console.error('VTU Status Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));
    const { network, type, planOrBundle, phoneNumber, amount, walletSource } = body;

    // Validate Purchase Type
    const purchaseType = type === 'DATA' ? 'DATA' : 'AIRTIME';

    // Validate Network
    const validNetworks = ['MTN', 'AIRTEL', 'GLO', 'NINE_MOBILE'];
    if (!network || !validNetworks.includes(network)) {
      return NextResponse.json({ error: 'Please select a valid network provider (MTN, AIRTEL, GLO, 9MOBILE).' }, { status: 400 });
    }

    // Validate Phone Number
    const cleanedPhone = String(phoneNumber || '').replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length !== 11 || !cleanedPhone.startsWith('0')) {
      return NextResponse.json({ error: 'Please enter a valid 11-digit mobile phone number (e.g., 08012345678).' }, { status: 400 });
    }

    // Validate Amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100 || parsedAmount > 50000) {
      return NextResponse.json({ error: 'Top-Up amount must be between ₦100 and ₦50,000.' }, { status: 400 });
    }

    // Validate Wallet Choice
    if (walletSource !== 'TASK' && walletSource !== 'AFFILIATE') {
      return NextResponse.json({ error: 'Please select a valid wallet (Task Wallet or Affiliate Wallet).' }, { status: 400 });
    }

    // Fetch user and membership plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planName = user.membership?.name?.toUpperCase() || 'FREE';
    const isEligible = planName.includes('VIP') || planName.includes('ELITE');

    if (!isEligible) {
      return NextResponse.json({
        error: 'VTU Airtime & Data Top-Up is exclusive to VIP & ELITE membership plans! Please upgrade your plan.'
      }, { status: 403 });
    }

    // Check Balance
    if (walletSource === 'TASK') {
      if (user.taskBalance < parsedAmount) {
        return NextResponse.json({
          error: `Insufficient Task Balance (₦${user.taskBalance.toLocaleString()}). You need ₦${parsedAmount.toLocaleString()} to complete this request.`
        }, { status: 400 });
      }
    } else {
      if (user.affiliateBalance < parsedAmount) {
        return NextResponse.json({
          error: `Insufficient Affiliate Balance (₦${user.affiliateBalance.toLocaleString()}). You need ₦${parsedAmount.toLocaleString()} to complete this request.`
        }, { status: 400 });
      }
    }

    const reference = `VTU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Process Purchase Request via Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct Balance immediately upon submission
      const updateData = walletSource === 'TASK'
        ? { taskBalance: { decrement: parsedAmount } }
        : { affiliateBalance: { decrement: parsedAmount } };

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          taskBalance: true,
          affiliateBalance: true
        }
      });

      // 2. Create VTU Transaction Record with PENDING status (Requires Admin Approval)
      const transaction = await tx.vtuTransaction.create({
        data: {
          userId,
          network: network as VtuNetwork,
          type: purchaseType as VtuType,
          planOrBundle: purchaseType === 'DATA' ? (planOrBundle || 'Data Bundle') : 'Airtime Top-Up',
          phoneNumber: cleanedPhone,
          amount: parsedAmount,
          walletSource: walletSource as WithdrawalType,
          status: 'PENDING',
          reference
        }
      });

      // 3. Log Activity
      await tx.activityLog.create({
        data: {
          action: 'VTU_PURCHASE_SUBMITTED',
          description: `Submitted VTU ${purchaseType} top-up of ₦${parsedAmount.toLocaleString()} (${network}${purchaseType === 'DATA' ? ' - ' + (planOrBundle || 'Data Bundle') : ''}) for ${cleanedPhone} using ${walletSource} wallet. Ref: ${reference}`,
          userId
        }
      });

      return { updatedUser, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `VTU ${purchaseType} request submitted successfully! Pending admin approval.`,
      transaction: result.transaction,
      newTaskBalance: result.updatedUser.taskBalance,
      newAffiliateBalance: result.updatedUser.affiliateBalance
    });

  } catch (error: any) {
    console.error('VTU Purchase Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
