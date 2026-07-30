import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    let whereClause = {};

    if (query && query.trim() !== '') {
      whereClause = {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { accountName: { contains: query, mode: 'insensitive' } },
          { accountNumber: { contains: query, mode: 'insensitive' } }
        ]
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        taskBalance: true,
        affiliateBalance: true,
        membership: {
          select: { name: true }
        },
        role: true,
        totalEarnings: true,
        referralCount: true,
        createdAt: true
      },
      take: 20
    });

    const mappedUsers = users.map(u => ({
      ...u,
      plan: u.membership?.name || 'FREE',
      membership: undefined
    }));

    return NextResponse.json({ users: mappedUsers });
  } catch (error: any) {
    console.error('User Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
