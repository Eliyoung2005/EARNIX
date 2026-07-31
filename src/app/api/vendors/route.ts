import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vendors = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        accountNumber: true,
        customGreeting: true,
        telegramLink: true,
        profilePic: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vendors);
  } catch (error: any) {
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}
