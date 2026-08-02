import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = ['ADMIN', 'SUB_ADMIN', 'SUPER_ADMIN'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !ALLOWED_ROLES.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await prisma.membershipPlan.findMany({
      orderBy: { level: 'asc' }
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Failed to fetch memberships:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !ALLOWED_ROLES.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, isActive, price, welcomeBonus, dailyLoginBonus, taskReward, referralCommission, minTaskWithdrawal, minAffiliateWithdrawal } = body;

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: {
        isActive,
        withdrawalPortalOpen: body.withdrawalPortalOpen !== undefined ? Boolean(body.withdrawalPortalOpen) : undefined,
        affiliateWithdrawalOpen: body.affiliateWithdrawalOpen !== undefined ? Boolean(body.affiliateWithdrawalOpen) : undefined,
        taskWithdrawalOpen: body.taskWithdrawalOpen !== undefined ? Boolean(body.taskWithdrawalOpen) : undefined,
        affiliateScheduledOpenDate: body.affiliateScheduledOpenDate !== undefined ? (body.affiliateScheduledOpenDate ? new Date(body.affiliateScheduledOpenDate) : null) : undefined,
        affiliateScheduledCloseDate: body.affiliateScheduledCloseDate !== undefined ? (body.affiliateScheduledCloseDate ? new Date(body.affiliateScheduledCloseDate) : null) : undefined,
        taskScheduledOpenDate: body.taskScheduledOpenDate !== undefined ? (body.taskScheduledOpenDate ? new Date(body.taskScheduledOpenDate) : null) : undefined,
        taskScheduledCloseDate: body.taskScheduledCloseDate !== undefined ? (body.taskScheduledCloseDate ? new Date(body.taskScheduledCloseDate) : null) : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        welcomeBonus: body.welcomeBonus !== undefined ? Number(body.welcomeBonus) : undefined,
        dailyLoginBonus: body.dailyLoginBonus !== undefined ? Number(body.dailyLoginBonus) : undefined,
        taskReward: body.taskReward !== undefined ? Number(body.taskReward) : undefined,
        referralCommission: body.referralCommission !== undefined ? Number(body.referralCommission) : undefined,
        minTaskWithdrawal: body.minTaskWithdrawal !== undefined ? Number(body.minTaskWithdrawal) : undefined,
        minAffiliateWithdrawal: body.minAffiliateWithdrawal !== undefined ? Number(body.minAffiliateWithdrawal) : undefined
      }
    });

    return NextResponse.json({ message: 'Plan updated successfully', plan: updated });
  } catch (error) {
    console.error('Failed to update membership:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
