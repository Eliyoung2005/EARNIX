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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let membership = user.membership;
    if (!membership) {
      membership = await prisma.membershipPlan.findFirst({
        where: { name: 'FREE' }
      });
    }

    if (!membership) {
      return NextResponse.json({ error: 'Membership plan not found' }, { status: 404 });
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

    if (isAffiliate && membership.name === 'FREE') {
      return NextResponse.json({ error: 'FREE plan members do not have referral benefits or affiliate wallet withdrawals. Please upgrade to PRO to unlock affiliate earnings.' }, { status: 403 });
    }
    const withdrawalStatus = isWithdrawalOpen({
      mode: settings.withdrawalPortalMode || 'MANUAL',
      type: isAffiliate ? 'AFFILIATE' : 'TASK',
      manualMasterOpen: isAffiliate 
        ? (settings.affiliatePortalOpenManual ?? settings.portalOpenManual ?? true) 
        : (settings.taskPortalOpenManual ?? settings.portalOpenManual ?? true),
      manualPlanOpen: isAffiliate 
        ? (membership.affiliateWithdrawalOpen ?? membership.withdrawalPortalOpen ?? true) 
        : (membership.taskWithdrawalOpen ?? membership.withdrawalPortalOpen ?? true),
      scheduledOpenDate: isAffiliate 
        ? (membership.affiliateScheduledOpenDate || settings.scheduledAffiliateOpenDate || settings.scheduledFreeOpenDate) 
        : (membership.taskScheduledOpenDate || settings.scheduledTaskOpenDate || settings.scheduledFreeOpenDate),
      scheduledCloseDate: isAffiliate 
        ? (membership.affiliateScheduledCloseDate || settings.scheduledAffiliateCloseDate || settings.scheduledFreeCloseDate) 
        : (membership.taskScheduledCloseDate || settings.scheduledTaskCloseDate || settings.scheduledFreeCloseDate),
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
    const minRequired = type === 'AFFILIATE' ? (membership.minAffiliateWithdrawal ?? 5000) : (membership.minTaskWithdrawal ?? 2000);
    if (withdrawalAmount < minRequired) {
      return NextResponse.json({ error: `Minimum withdrawal is ₦${minRequired}` }, { status: 400 });
    }

    // UPGRADE LOCK LOGIC
    if (settings.blockFreeWithdrawal && membership.name.toUpperCase() === 'FREE') {
      const proPlan = await prisma.membershipPlan.findFirst({
        where: {
          isActive: true,
          name: { equals: 'PRO', mode: 'insensitive' }
        }
      });
      return NextResponse.json({
        error: `UpgradeRequired`,
        message: `Free plan users cannot withdraw funds. You must upgrade to the PRO plan to proceed.`,
        nextPlan: proPlan?.name || 'PRO'
      }, { status: 403 });
    }

    if (settings.requireUpgradeForWithdrawal) {
      const withdrawalsMade = type === 'AFFILIATE' ? user.currentPlanAffiliateWithdrawals : user.currentPlanTaskWithdrawals;
      
      if (withdrawalsMade >= 1) {
        // Check if there is a higher plan available
        const higherPlan = await prisma.membershipPlan.findFirst({
          where: { 
            isActive: true,
            level: { gt: membership.level }
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
