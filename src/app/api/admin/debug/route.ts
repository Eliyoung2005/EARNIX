import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Temporary debug endpoint - no auth required

    // Get ALL membership plans to see their current values
    const plans = await prisma.membershipPlan.findMany({ orderBy: { level: 'asc' } });

    // Get platform settings
    const settings = await prisma.platformSettings.findFirst();

    // Get a sample of users with their planId
    const users = await prisma.user.findMany({
      take: 10,
      select: { id: true, email: true, planId: true, role: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      plans: plans.map(p => ({
        id: p.id,
        name: p.name,
        minTaskWithdrawal: p.minTaskWithdrawal,
        minAffiliateWithdrawal: p.minAffiliateWithdrawal,
        taskWithdrawalOpen: p.taskWithdrawalOpen,
        taskScheduledOpenDate: p.taskScheduledOpenDate,
        taskScheduledCloseDate: p.taskScheduledCloseDate,
      })),
      settings: {
        withdrawalPortalMode: settings?.withdrawalPortalMode,
        taskPortalOpenManual: settings?.taskPortalOpenManual,
        scheduledTaskOpenDate: settings?.scheduledTaskOpenDate,
        scheduledTaskCloseDate: settings?.scheduledTaskCloseDate,
      },
      recentUsers: users,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
