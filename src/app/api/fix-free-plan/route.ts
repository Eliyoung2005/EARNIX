export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const freePlan = await prisma.membershipPlan.findUnique({ where: { name: 'FREE' } });
    if (freePlan) {
      const updatedFeatures = freePlan.features.filter(f => !f.toLowerCase().includes('referral'));
      await prisma.membershipPlan.update({
        where: { name: 'FREE' },
        data: {
          referralCommission: 0,
          features: updatedFeatures
        }
      });
      return NextResponse.json({ message: 'FREE plan updated successfully.' });
    } else {
      return NextResponse.json({ error: 'FREE plan not found.' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
