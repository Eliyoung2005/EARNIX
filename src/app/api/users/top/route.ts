import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        referralCount: 'desc'
      },
      select: {
        id: true,
        name: true,
        username: true,
        referralCount: true
      }
    });

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error('Failed to fetch top earners:', error);
    return NextResponse.json({ error: 'Failed to fetch top earners' }, { status: 500 });
  }
}
