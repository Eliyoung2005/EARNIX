import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    // Only Admin/SubAdmin can transfer unassigned coupons for now
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { couponCode, targetVendorId } = await req.json();

    if (!couponCode || !targetVendorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify target vendor exists and is actually a VENDOR
    const targetVendor = await prisma.user.findUnique({
      where: { id: targetVendorId }
    });

    if (!targetVendor || targetVendor.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Invalid target vendor' }, { status: 400 });
    }

    // Find the coupon
    const coupon = await prisma.couponCode.findUnique({
      where: { code: couponCode }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    if (coupon.status === 'USED') {
      return NextResponse.json({ error: 'Cannot transfer a used coupon' }, { status: 400 });
    }

    // Update ownership
    await prisma.couponCode.update({
      where: { id: coupon.id },
      data: {
        assignedVendorId: targetVendor.id
      }
    });

    // Log the transfer
    await prisma.activityLog.create({
      data: {
        action: 'COUPON_TRANSFERRED',
        description: `Transferred coupon ${couponCode} to ${targetVendor.username}`,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({ message: 'Coupon transferred successfully!' });

  } catch (error: any) {
    console.error('Coupon Transfer Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
