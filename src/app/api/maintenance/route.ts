import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.platformSettings.findFirst({
      select: {
        maintenanceMode: true,
        maintenanceMessage: true,
      }
    });

    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceMessage: settings?.maintenanceMessage || null,
    });
  } catch (error) {
    console.error('Failed to fetch maintenance status:', error);
    return NextResponse.json({ maintenanceMode: false, maintenanceMessage: null });
  }
}
