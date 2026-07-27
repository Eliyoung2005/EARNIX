import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, amount = 3 } = await req.json();

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { freeSpinsRemaining: { increment: amount } }
      });
      return NextResponse.json({ message: `Granted ${amount} free spins to user!` });
    } else {
      const result = await prisma.user.updateMany({
        data: { freeSpinsRemaining: amount }
      });
      return NextResponse.json({ message: `Granted ${amount} free spins to all ${result.count} users!` });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
