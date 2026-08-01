import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SPIN_FEE = 100; // ₦100 per paid spin after free spins

const PRIZES = [
  { index: 0, label: '₦200 Cash Bonus', amount: 200, weight: 35, color: '#1042a3' },
  { index: 1, label: '₦500 Cash Bonus', amount: 500, weight: 25, color: '#d4af37' },
  { index: 2, label: '₦150 Cash Bonus', amount: 150, weight: 25, color: '#28c76f' },
  { index: 3, label: '₦1,000 Big Reward', amount: 1000, weight: 10, color: '#ff9f43' },
  { index: 4, label: '₦2,000 JACKPOT!', amount: 2000, weight: 5, color: '#ff3b30' },
];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planName = user.membership?.name?.toUpperCase() || 'FREE';
    const isEligible = planName.includes('VIP') || planName.includes('ELITE');

    return NextResponse.json({
      isEligible,
      planName,
      freeSpinsRemaining: user.freeSpinsRemaining || 0,
      taskBalance: user.taskBalance || 0,
      affiliateBalance: user.affiliateBalance || 0,
      spinFee: SPIN_FEE,
      prizes: PRIZES.map(p => ({ index: p.index, label: p.label, color: p.color }))
    });
  } catch (error: any) {
    console.error('Spin Status Error:', error);
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
    const walletChoice = body.walletChoice || 'TASK'; // 'TASK' or 'AFFILIATE'

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
        error: 'Spin & Win is exclusive to VIP & ELITE membership plans! Please upgrade your plan to unlock 3 free spins and cash rewards.'
      }, { status: 403 });
    }

    const freeSpins = user.freeSpinsRemaining || 0;
    const isFreeSpin = freeSpins > 0;

    // If no free spins remaining, check selected wallet balance for fee deduction
    if (!isFreeSpin) {
      if (walletChoice === 'TASK') {
        if (user.taskBalance < SPIN_FEE) {
          return NextResponse.json({
            error: `Insufficient Task Balance (₦${user.taskBalance.toLocaleString()}) to pay the ₦${SPIN_FEE} spin fee. Try switching to Affiliate Wallet or earn more!`
          }, { status: 400 });
        }
      } else {
        if (user.affiliateBalance < SPIN_FEE) {
          return NextResponse.json({
            error: `Insufficient Affiliate Balance (₦${user.affiliateBalance.toLocaleString()}) to pay the ₦${SPIN_FEE} spin fee. Try switching to Task Wallet or invite users!`
          }, { status: 400 });
        }
      }
    }

    // Weighted Prize Selector
    const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let winningPrize = PRIZES[0];

    for (const prize of PRIZES) {
      if (randomNum < prize.weight) {
        winningPrize = prize;
        break;
      }
      randomNum -= prize.weight;
    }

    // Execute Spin Transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        taskBalance: { increment: winningPrize.amount },
        totalEarnings: { increment: winningPrize.amount },
        lastSpinDate: new Date()
      };

      if (isFreeSpin) {
        updateData.freeSpinsRemaining = { decrement: 1 };
      } else {
        if (walletChoice === 'TASK') {
          updateData.taskBalance = { increment: winningPrize.amount - SPIN_FEE };
        } else {
          updateData.affiliateBalance = { decrement: SPIN_FEE };
        }
      }

      const resUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          taskBalance: true,
          affiliateBalance: true,
          freeSpinsRemaining: true
        }
      });

      await tx.activityLog.create({
        data: {
          action: 'SPIN_WHEEL_REWARD',
          description: isFreeSpin 
            ? `Won ${winningPrize.label} (₦${winningPrize.amount}) on FREE SPIN! (${resUser.freeSpinsRemaining} free spins remaining)`
            : `Won ${winningPrize.label} (₦${winningPrize.amount}) via ₦${SPIN_FEE} spin fee from ${walletChoice} wallet`,
          userId: userId
        }
      });

      return resUser;
    });

    return NextResponse.json({
      success: true,
      winningIndex: winningPrize.index,
      prizeLabel: winningPrize.label,
      prizeAmount: winningPrize.amount,
      wasFreeSpin: isFreeSpin,
      freeSpinsRemaining: updatedUser.freeSpinsRemaining,
      newTaskBalance: updatedUser.taskBalance,
      newAffiliateBalance: updatedUser.affiliateBalance,
      message: isFreeSpin 
        ? `Free Spin Result: You won ${winningPrize.label}! ₦${winningPrize.amount.toLocaleString()} added to your task balance. (${updatedUser.freeSpinsRemaining} free spin${updatedUser.freeSpinsRemaining !== 1 ? 's' : ''} left)`
        : `You won ${winningPrize.label}! ₦${winningPrize.amount.toLocaleString()} added to your task balance.`
    });

  } catch (error: any) {
    console.error('Spin Execution Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
