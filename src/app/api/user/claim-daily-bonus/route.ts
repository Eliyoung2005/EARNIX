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

/** Resolve the bonus amount for a user:
 *  1. Plan's dailyLoginBonus (if > 0)
 *  2. Platform defaultDailyLoginBonus
 *  3. Hardcoded fallback of 50
 */
async function resolveBonus(
  planBonus: number | null | undefined,
  platformSettings: any
): Promise<number> {
  if (planBonus && planBonus > 0) return planBonus;
  if (platformSettings?.defaultDailyLoginBonus && platformSettings.defaultDailyLoginBonus > 0) {
    return platformSettings.defaultDailyLoginBonus;
  }
  return 50;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const [user, platformSettings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { membership: true }
      }),
      prisma.platformSettings.findFirst()
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const baseBonus = await resolveBonus(user.membership?.dailyLoginBonus, platformSettings);
    const taskEarningsMode = platformSettings?.taskEarningsMode || 'CASH';
    const pointsConversionRate = platformSettings?.pointsConversionRate || 1;

    const startOfToday = getStartOfDay();
    const startOfYesterday = getYesterdayStart();

    const lastClaim = user.lastDailyBonusClaim ? new Date(user.lastDailyBonusClaim) : null;
    const claimedToday = lastClaim ? lastClaim >= startOfToday : false;

    let activeStreak = user.loginStreak || 0;

    // Check if user missed a day — reset streak
    if (!claimedToday && lastClaim && lastClaim < startOfYesterday) {
      activeStreak = 0;
    }

    // Determine current day position in 7-day calendar (1 to 7)
    const dayIndexInCycle = claimedToday
      ? (((activeStreak - 1) % 7) + 1)
      : (((activeStreak) % 7) + 1);

    // The display amount in points (if POINTS mode) or raw amount (if CASH mode)
    const displayAmount = taskEarningsMode === 'POINTS'
      ? baseBonus * pointsConversionRate
      : baseBonus;

    return NextResponse.json({
      claimedToday,
      activeStreak,
      dayIndexInCycle,
      baseBonus: displayAmount,
      todayBonus: displayAmount,
      taskEarningsMode,
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
    const [user, platformSettings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { membership: true }
      }),
      prisma.platformSettings.findFirst()
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

    // Resolve bonus amount (raw NGN/points value stored in DB)
    const baseBonus = await resolveBonus(user.membership?.dailyLoginBonus, platformSettings);
    const taskEarningsMode = platformSettings?.taskEarningsMode || 'CASH';
    const pointsConversionRate = platformSettings?.pointsConversionRate || 1;

    // Calculate new streak
    let newStreak = 1;
    if (lastClaim && lastClaim >= startOfYesterday) {
      newStreak = (user.loginStreak || 0) + 1;
    }

    // 7-Day Cycle Calculation
    const dayIndexInCycle = ((newStreak - 1) % 7) + 1;

    // The value credited to taskBalance is always the raw baseBonus
    // (fmtTask on the frontend handles ERX vs ₦ display)
    const rewardAmount = baseBonus;

    // Display amount shown to user in response message
    const displayAmount = taskEarningsMode === 'POINTS'
      ? baseBonus * pointsConversionRate
      : baseBonus;
    const unitLabel = taskEarningsMode === 'POINTS' ? 'ERX' : '₦';

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
          description: `Claimed ${displayAmount.toLocaleString()} ${unitLabel} Daily Bonus (Day ${dayIndexInCycle} Streak)`,
          userId: user.id
        }
      });

      return updated;
    });

    return NextResponse.json({
      claimed: true,
      amount: displayAmount,
      newStreak: updatedUser.loginStreak,
      dayIndexInCycle,
      newTaskBalance: updatedUser.taskBalance,
      taskEarningsMode,
      message: `🎉 Day ${dayIndexInCycle} streak bonus of ${displayAmount.toLocaleString()} ${unitLabel} credited to your balance!`
    });

  } catch (error: any) {
    console.error('Daily Bonus Claim Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
