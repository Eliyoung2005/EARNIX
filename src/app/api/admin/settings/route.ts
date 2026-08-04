export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = ['ADMIN', 'SUB_ADMIN', 'SUPER_ADMIN'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !ALLOWED_ROLES.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.platformSettings.findFirst();
    if (!settings) {
       const newSettings = await prisma.platformSettings.create({ data: {} });
       return NextResponse.json(newSettings);
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
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

    const current = await prisma.platformSettings.findFirst();
    if (!current) return NextResponse.json({ error: 'Settings not initialized' }, { status: 400 });

    const allowedFields = [
      'name', 'tagline', 'logo',
      'minAffiliateWithdraw', 'minTaskWithdraw',
      'freeWithdrawalOpen', 'proWithdrawalOpen',
      'withdrawalPortalMode', 'portalOpenManual',
      'affiliatePortalOpenManual', 'taskPortalOpenManual',
      'autoOpenSchedule', 'autoCloseSchedule',
      'scheduledFreeOpenDate', 'scheduledFreeCloseDate',
      'scheduledProOpenDate', 'scheduledProCloseDate',
      'scheduledAffiliateOpenDate', 'scheduledAffiliateCloseDate',
      'scheduledTaskOpenDate', 'scheduledTaskCloseDate',
      'maintenanceMode', 'maintenanceMessage', 'registrationMessage',
      'enableFreeReg', 'enableProReg', 'enableTasks',
      'enableWithdrawals', 'enableReferrals', 'requireUpgradeForWithdrawal', 'blockFreeWithdrawal',
      'enableVtuData', 'vtuDataButtonClaimable',
      'welcomePopupEnabled', 'welcomePopupTitleFree', 'welcomePopupMessageFree',
      'welcomePopupTitlePro', 'welcomePopupMessagePro', 'welcomePopupLink',
      'adsenseEnabled', 'adsenseClientId',
      'supportEmail', 'whatsappSupport', 'telegramSupport',
      'affiliateCurrency', 'usdExchangeRate', 'taskEarningsMode', 'pointsConversionRate'
    ];

    const dateFields = [
      'scheduledFreeOpenDate', 'scheduledFreeCloseDate',
      'scheduledProOpenDate', 'scheduledProCloseDate',
      'scheduledAffiliateOpenDate', 'scheduledAffiliateCloseDate',
      'scheduledTaskOpenDate', 'scheduledTaskCloseDate'
    ];

    // Build clean update object with only known fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (dateFields.includes(field)) {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updated = await prisma.platformSettings.update({
      where: { id: current.id },
      data: updateData
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings: updated });
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update', detail: error?.message || String(error) }, { status: 500 });
  }
}
