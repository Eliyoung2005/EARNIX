export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleReferredUserUpgrade, handleReferrerUpgrade } from '@/lib/referralUtils';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, newPlan } = await req.json();

    if (!userId || !newPlan) {
      return NextResponse.json({ error: 'Invalid user ID or plan format.' }, { status: 400 });
    }

    const plan = await prisma.membershipPlan.findUnique({
      where: { name: newPlan }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });
    }

    const welcomeBonus = plan.welcomeBonus || 0;
    const isVipOrElite = plan.name.toUpperCase().includes('VIP') || plan.name.toUpperCase().includes('ELITE');

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: { 
          planId: plan.id,
          freeSpinsRemaining: isVipOrElite ? 3 : 0,
          taskBalance: welcomeBonus > 0 ? { increment: welcomeBonus } : undefined,
          totalEarnings: welcomeBonus > 0 ? { increment: welcomeBonus } : undefined,
          currentPlanAffiliateWithdrawals: 0,
          currentPlanTaskWithdrawals: 0,
          pendingUpgradeThankYou: newPlan
        }
      });
      
      await tx.activityLog.create({
        data: {
          action: 'PLAN_UPGRADED',
          description: `Admin manually updated ${u.username}'s plan to ${newPlan}${isVipOrElite ? ' + 3 Free Spins' : ''}`,
          userId: (session.user as any).id
        }
      });

      if (welcomeBonus > 0) {
        await tx.activityLog.create({
          data: {
            action: 'UPGRADE_WELCOME_BONUS',
            description: `Received ₦${welcomeBonus.toLocaleString()} welcome bonus for upgrading to the ${newPlan} plan`,
            userId: userId
          }
        });
      }

      // Handle referral payouts
      await handleReferredUserUpgrade(userId, plan.id, tx);
      await handleReferrerUpgrade(userId, tx);

      return u;
    });

    return NextResponse.json({ 
      message: `Success! ${updatedUser.username} is now on the ${newPlan} plan${isVipOrElite ? ' with 3 Free Spins' : ''}.` 
    });
  } catch (error: any) {
    console.error('Plan Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
