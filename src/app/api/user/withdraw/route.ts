import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isWithdrawalOpen } from '@/lib/withdrawalUtils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, type, pin } = body; // type is 'AFFILIATE' or 'TASK'
    const withdrawalAmount = Number(amount);

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Fetch user with their plan and balances
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { membership: true }
    });

    if (!user || !user.membership) {
      return NextResponse.json({ error: 'User or membership plan not found' }, { status: 404 });
    }

    if (!user.withdrawalPin) {
      return NextResponse.json({ error: 'You have not set your 4-digit Withdrawal PIN yet. Please go to Profile Settings to set it before withdrawing.' }, { status: 400 });
    }

    if (!pin) {
      return NextResponse.json({ error: 'Please enter your 4-digit Withdrawal PIN to confirm this withdrawal.' }, { status: 400 });
    }

    const isValidPin = await bcrypt.compare(pin, user.withdrawalPin);
    if (!isValidPin) {
      return NextResponse.json({ error: 'Incorrect Withdrawal PIN.' }, { status: 400 });
    }

    const settings = await prisma.platformSettings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: 'Platform settings not found' }, { status: 500 });
    }

    // STRICT PORTAL STATUS & SCHEDULE EVALUATION
    const isAffiliate = type === 'AFFILIATE';
    const withdrawalStatus = isWithdrawalOpen({
      mode: settings.withdrawalPortalMode || 'MANUAL',
      type: isAffiliate ? 'AFFILIATE' : 'TASK',
      manualMasterOpen: isAffiliate 
        ? (settings.affiliatePortalOpenManual ?? settings.portalOpenManual ?? true) 
        : (settings.taskPortalOpenManual ?? settings.portalOpenManual ?? true),
      manualPlanOpen: isAffiliate 
        ? (user.membership.affiliateWithdrawalOpen ?? user.membership.withdrawalPortalOpen ?? true) 
        : (user.membership.taskWithdrawalOpen ?? user.membership.withdrawalPortalOpen ?? true),
      scheduledOpenDate: isAffiliate 
        ? (user.membership.affiliateScheduledOpenDate || settings.scheduledAffiliateOpenDate || settings.scheduledFreeOpenDate) 
        : (user.membership.taskScheduledOpenDate || settings.scheduledTaskOpenDate || settings.scheduledFreeOpenDate),
      scheduledCloseDate: isAffiliate 
        ? (user.membership.affiliateScheduledCloseDate || settings.scheduledAffiliateCloseDate || settings.scheduledFreeCloseDate) 
        : (user.membership.taskScheduledCloseDate || settings.scheduledTaskCloseDate || settings.scheduledFreeCloseDate),
    });

    if (!withdrawalStatus.isOpen) {
      return NextResponse.json({ error: withdrawalStatus.reason || 'The withdrawal portal is currently closed.' }, { status: 403 });
    }

    // Verify balance
    const availableBalance = type === 'AFFILIATE' ? user.affiliateBalance : user.taskBalance;
    if (withdrawalAmount > availableBalance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Check minimum withdrawal limits based on the user's specific plan
    const minRequired = type === 'AFFILIATE' ? user.membership.minAffiliateWithdrawal : user.membership.minTaskWithdrawal;
    if (withdrawalAmount < minRequired) {
      return NextResponse.json({ error: `Minimum withdrawal is ₦${minRequired}` }, { status: 400 });
    }

    // UPGRADE LOCK LOGIC
    if (settings.requireUpgradeForWithdrawal) {
      const withdrawalsMade = type === 'AFFILIATE' ? user.currentPlanAffiliateWithdrawals : user.currentPlanTaskWithdrawals;
      
      if (withdrawalsMade >= 1) {
        // Check if there is a higher plan available
        const higherPlan = await prisma.membershipPlan.findFirst({
          where: { 
            isActive: true,
            level: { gt: user.membership.level }
          },
          orderBy: { level: 'asc' }
        });

        // If a higher plan exists, block the withdrawal
        if (higherPlan) {
          return NextResponse.json({ 
            error: `UpgradeRequired`, 
            message: `You must upgrade to the ${higherPlan.name} plan to withdraw again from this wallet.`,
            nextPlan: higherPlan.name
          }, { status: 403 });
        }
        // If no higher plan exists (they are on the highest tier), they can withdraw normally
      }
    }

    // Deduct balance and create withdrawal request in a transaction
    const balanceField = type === 'AFFILIATE' ? 'affiliateBalance' : 'taskBalance';
    const withdrawalsField = type === 'AFFILIATE' ? 'currentPlanAffiliateWithdrawals' : 'currentPlanTaskWithdrawals';

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          [balanceField]: { decrement: withdrawalAmount },
          [withdrawalsField]: { increment: 1 }
        }
      }),
      prisma.withdrawalRequest.create({
        data: {
          userId: user.id,
          amount: withdrawalAmount,
          type: type as any,
          status: 'PENDING'
        }
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'WITHDRAWAL_REQUESTED',
          description: `Requested ₦${withdrawalAmount} withdrawal from ${type} wallet.`
        }
      })
    ]);

    return NextResponse.json({ message: 'Withdrawal request submitted successfully' });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
