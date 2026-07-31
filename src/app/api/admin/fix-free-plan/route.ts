import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// One-time fix: correct FREE plan minTaskWithdrawal to 100
export async function GET() {
  try {
    const freePlan = await prisma.membershipPlan.findFirst({
      where: { name: 'FREE' }
    });

    if (!freePlan) {
      return NextResponse.json({ error: 'FREE plan not found' }, { status: 404 });
    }

    const updated = await prisma.membershipPlan.update({
      where: { id: freePlan.id },
      data: {
        minTaskWithdrawal: 100,
      }
    });

    return NextResponse.json({
      success: true,
      message: `FREE plan minTaskWithdrawal updated to ₦100`,
      plan: {
        id: updated.id,
        name: updated.name,
        minTaskWithdrawal: updated.minTaskWithdrawal,
        minAffiliateWithdrawal: updated.minAffiliateWithdrawal,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
