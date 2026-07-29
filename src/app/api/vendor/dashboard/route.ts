import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const vendor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        customGreeting: true,
        accountNumber: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isVendorOrAdmin = ['VENDOR', 'ADMIN', 'SUB_ADMIN', 'SUPER_ADMIN'].includes(vendor.role);
    if (!isVendorOrAdmin) {
      return NextResponse.json({ error: 'Forbidden. Vendor role required.' }, { status: 403 });
    }

    const coupons = await prisma.couponCode.findMany({
      where: { assignedVendorId: userId },
      include: {
        redeemedBy: {
          select: { username: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAssigned = coupons.length;
    const soldCount = coupons.filter(c => c.status === 'USED').length;
    const availableCount = coupons.filter(c => c.status === 'UNUSED').length;

    return NextResponse.json({
      vendor,
      stats: {
        totalAssigned,
        soldCount,
        availableCount,
      },
      coupons,
    });
  } catch (error: any) {
    console.error('Vendor Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to load vendor dashboard data' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { customGreeting } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: { customGreeting: customGreeting || '' },
    });

    return NextResponse.json({ message: 'Greeting updated successfully' });
  } catch (error: any) {
    console.error('Vendor Greeting Update Error:', error);
    return NextResponse.json({ error: 'Failed to update custom greeting' }, { status: 500 });
  }
}
