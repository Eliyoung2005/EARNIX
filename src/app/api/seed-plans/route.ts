import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const freePlan = await prisma.membershipPlan.upsert({
      where: { name: 'FREE' },
      update: {},
      create: {
        name: 'FREE',
        level: 1,
        price: 0,
        welcomeBonus: 50,
        dailyLoginBonus: 0,
        taskReward: 80,
        referralCommission: 250,
        isActive: true,
        description: 'Start earning immediately for free.'
      }
    });

    const proPlan = await prisma.membershipPlan.upsert({
      where: { name: 'PRO' },
      update: {},
      create: {
        name: 'PRO',
        level: 2,
        price: 500,
        welcomeBonus: 100,
        dailyLoginBonus: 10,
        taskReward: 120,
        referralCommission: 250,
        isActive: true,
        description: 'Unlock higher earnings.'
      }
    });

    // Update any users without a plan to FREE
    const users = await prisma.user.updateMany({
      where: { planId: null },
      data: { planId: freePlan.id }
    });

    return NextResponse.json({ success: true, freePlan, proPlan, usersUpdated: users.count });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
