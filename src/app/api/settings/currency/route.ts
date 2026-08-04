export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public endpoint to expose currency & earnings mode settings to the frontend.
 * No authentication required — these are display-only settings.
 */
export async function GET() {
  try {
    const settings = await prisma.platformSettings.findFirst({
      select: {
        affiliateCurrency: true,
        usdExchangeRate: true,
        taskEarningsMode: true,
        pointsConversionRate: true,
      }
    });

    if (!settings) {
      return NextResponse.json({
        affiliateCurrency: 'NGN',
        usdExchangeRate: 1600,
        taskEarningsMode: 'CASH',
        pointsConversionRate: 1,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch currency settings:', error);
    return NextResponse.json({
      affiliateCurrency: 'NGN',
      usdExchangeRate: 1600,
      taskEarningsMode: 'CASH',
      pointsConversionRate: 1,
    });
  }
}
