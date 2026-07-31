import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const bonusAmount = user.membership?.dailyLoginBonus || 50;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingClaim = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        action: 'DAILY_LOGIN_BONUS',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    return NextResponse.json({
      claimedToday: Boolean(existingClaim),
      bonusAmount,
      planName: user.membership?.name || 'FREE'
    });
  } catch (error: any) {
    console.error('Daily Bonus GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
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

    const bonusAmount = user.membership?.dailyLoginBonus || 50;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingClaim = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        action: 'DAILY_LOGIN_BONUS',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingClaim) {
      return NextResponse.json({
        claimed: false,
        alreadyClaimed: true,
        message: `You have already claimed your ₦${bonusAmount} daily login bonus today! Come back tomorrow for your next reward.`
      });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          taskBalance: { increment: bonusAmount },
          totalEarnings: { increment: bonusAmount }
        },
        select: { taskBalance: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'DAILY_LOGIN_BONUS',
          description: `Claimed ₦${bonusAmount} Daily Login Bonus`,
          userId: user.id
        }
      });

      return updated;
    });

    return NextResponse.json({
      claimed: true,
      amount: bonusAmount,
      newTaskBalance: updatedUser.taskBalance,
      message: `🎉 Success! ₦${bonusAmount} Daily Login Bonus credited to your task balance!`
    });

  } catch (error: any) {
    console.error('Daily Bonus Claim Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
