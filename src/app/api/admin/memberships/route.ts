import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUB_ADMIN')) {
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
    if (!session?.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUB_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, isActive, price, welcomeBonus, dailyLoginBonus, taskReward, referralCommission } = body;

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: {
        isActive,
        price: Number(price),
        welcomeBonus: Number(welcomeBonus),
        dailyLoginBonus: Number(dailyLoginBonus),
        taskReward: Number(taskReward),
        referralCommission: Number(referralCommission)
      }
    });

    return NextResponse.json({ message: 'Plan updated successfully', plan: updated });
  } catch (error) {
    console.error('Failed to update membership:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
