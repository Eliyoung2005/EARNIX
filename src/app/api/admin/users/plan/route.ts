import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN') {
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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { planId: plan.id }
    });
    
    await prisma.activityLog.create({
      data: {
        action: 'PLAN_UPGRADED',
        description: `Admin manually updated ${updatedUser.username}'s plan to ${newPlan}`,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({ message: `Success! ${updatedUser.username} is now on the ${newPlan} plan.` });
  } catch (error: any) {
    console.error('Plan Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
