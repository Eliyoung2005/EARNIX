import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function getStartOfDay(date: Date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getYesterdayStart() {
  const d = getStartOfDay();
  d.setDate(d.getDate() - 1);
  return d;
}

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

    const baseBonus = user.membership?.dailyLoginBonus || 50;

    const startOfToday = getStartOfDay();
    const startOfYesterday = getYesterdayStart();

    const lastClaim = user.lastDailyBonusClaim ? new Date(user.lastDailyBonusClaim) : null;
    const claimedToday = lastClaim ? lastClaim >= startOfToday : false;

    let activeStreak = user.loginStreak || 0;

    // Check if user missed a day
    if (!claimedToday && lastClaim && lastClaim < startOfYesterday) {
      activeStreak = 0; // Streak reset due to missed day
    }

    // Determine current day position in 7-day calendar (1 to 7)
    const dayIndexInCycle = claimedToday 
      ? (((activeStreak - 1) % 7) + 1)
      : (((activeStreak) % 7) + 1);

    const todayBonus = baseBonus;

    return NextResponse.json({
      claimedToday,
      activeStreak,
      dayIndexInCycle,
      baseBonus,
      todayBonus,
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

    const baseBonus = user.membership?.dailyLoginBonus || 50;
    const startOfToday = getStartOfDay();
    const startOfYesterday = getYesterdayStart();

    const lastClaim = user.lastDailyBonusClaim ? new Date(user.lastDailyBonusClaim) : null;
    const claimedToday = lastClaim ? lastClaim >= startOfToday : false;

    if (claimedToday) {
      return NextResponse.json({
        claimed: false,
        alreadyClaimed: true,
        message: 'You have already claimed your daily bonus today! Return tomorrow to keep your streak going.'
      });
    }

    // Calculate new streak
    let newStreak = 1;
    if (lastClaim && lastClaim >= startOfYesterday) {
      newStreak = (user.loginStreak || 0) + 1;
    }

    // 7-Day Cycle Calculation
    const dayIndexInCycle = ((newStreak - 1) % 7) + 1;
    const rewardAmount = baseBonus;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          loginStreak: newStreak,
          lastDailyBonusClaim: new Date(),
          taskBalance: { increment: rewardAmount },
          totalEarnings: { increment: rewardAmount }
        },
        select: { taskBalance: true, loginStreak: true }
      });

      await tx.activityLog.create({
        data: {
          action: 'DAILY_LOGIN_BONUS',
          description: `Claimed ₦${rewardAmount} Daily Bonus (Day ${newStreak} Streak)`,
          userId: user.id
        }
      });

      return updated;
    });

    return NextResponse.json({
      claimed: true,
      amount: rewardAmount,
      newStreak: updatedUser.loginStreak,
      dayIndexInCycle,
      newTaskBalance: updatedUser.taskBalance,
      message: `Success! Day ${dayIndexInCycle} streak bonus of ₦${rewardAmount} credited to your task balance!`
    });

  } catch (error: any) {
    console.error('Daily Bonus Claim Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
