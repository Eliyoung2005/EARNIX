export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Your login session has expired. Please refresh the page or log in again.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { couponCode, targetPlanName } = await req.json();

    if (!couponCode || !couponCode.trim()) {
      return NextResponse.json({ error: 'Please enter a valid Activation Coupon Code.' }, { status: 400 });
    }

    if (!targetPlanName) {
      return NextResponse.json({ error: 'Target membership plan is required.' }, { status: 400 });
    }

    const cleanCode = couponCode.trim().toUpperCase();

    // Look up target plan
    const targetPlan = await prisma.membershipPlan.findUnique({
      where: { name: targetPlanName }
    });

    if (!targetPlan || !targetPlan.isActive) {
      return NextResponse.json({ error: 'Selected plan is invalid or currently inactive.' }, { status: 400 });
    }

    // Look up the coupon
    const validCoupon = await prisma.couponCode.findUnique({
      where: { code: cleanCode }
    });

    if (!validCoupon || validCoupon.status !== 'UNUSED') {
      return NextResponse.json({ error: 'Invalid or already redeemed coupon code. Need a code? Check our verified vendors page.' }, { status: 400 });
    }

    // Check if user is already on this plan or a higher plan
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const currentLevel = currentUser.membership?.level || 1;
    const targetLevel = targetPlan.level;

    if (targetLevel <= currentLevel && currentUser.planId === targetPlan.id) {
      return NextResponse.json({ error: `You are already subscribed to the ${targetPlan.name} plan or a higher plan.` }, { status: 400 });
    }

    const welcomeBonus = targetPlan.welcomeBonus || 0;
    const isVipOrElite = targetPlan.name.toUpperCase().includes('VIP') || targetPlan.name.toUpperCase().includes('ELITE');

    // Execute upgrade in transaction
    await prisma.$transaction(async (tx) => {
      // Update User Plan, Credit New Plan Welcome Bonus & Award 3 Free Spins for VIP/ELITE
      await tx.user.update({
        where: { id: userId },
        data: {
          planId: targetPlan.id,
          freeSpinsRemaining: isVipOrElite ? 3 : 0,
          taskBalance: welcomeBonus > 0 ? { increment: welcomeBonus } : undefined,
          totalEarnings: welcomeBonus > 0 ? { increment: welcomeBonus } : undefined,
          currentPlanAffiliateWithdrawals: 0,
          currentPlanTaskWithdrawals: 0,
          pendingUpgradeThankYou: targetPlan.name
        }
      });

      // Mark coupon as used
      await tx.couponCode.update({
        where: { id: validCoupon.id },
        data: {
          status: 'USED',
          redeemedById: userId,
          redeemedDate: new Date()
        }
      });

      // Log activity for Plan Upgrade
      await tx.activityLog.create({
        data: {
          action: 'PLAN_UPGRADED',
          description: `Upgraded account plan to ${targetPlan.name} via activation coupon ${cleanCode}${isVipOrElite ? ' + Unlocked 3 Free Spins' : ''}`,
          userId: userId
        }
      });

      // Log activity for New Plan Welcome Bonus
      if (welcomeBonus > 0) {
        await tx.activityLog.create({
          data: {
            action: 'UPGRADE_WELCOME_BONUS',
            description: `Received ₦${welcomeBonus.toLocaleString()} welcome bonus for upgrading to the ${targetPlan.name} plan`,
            userId: userId
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      newPlanName: targetPlan.name,
      welcomeBonus: welcomeBonus,
      message: `Successfully upgraded to the ${targetPlan.name} plan! ₦${welcomeBonus.toLocaleString()} welcome bonus ${isVipOrElite ? '+ 3 Free Spins' : ''} added to your account.`
    });
  } catch (error: any) {
    console.error('Plan Upgrade Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
