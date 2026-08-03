export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { prisma } from '@/lib/prisma';

function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let segment1 = '';
  let segment2 = '';
  for (let i = 0; i < 4; i++) {
    segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
    segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ERX-${segment1}-${segment2}`;
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // 1. Vendors are strictly FORBIDDEN from generating coupon codes on their own
    if (role === 'VENDOR') {
      return NextResponse.json({ 
        error: 'Vendors are not permitted to generate coupon codes on their own. Codes must be generated and allocated to vendors by an Admin.' 
      }, { status: 403 });
    }

    // 2. Only ADMIN, SUB_ADMIN, and SUPER_ADMIN roles can proceed
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Access restricted to authorized admin personnel.' }, { status: 403 });
    }

    // 3. For SUB_ADMIN, verify that Super Admin has granted the GENERATE_CODES permission
    if (role === 'SUB_ADMIN') {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { subAdminPermissions: true }
      });

      const hasPermission = dbUser?.subAdminPermissions?.includes('GENERATE_CODES');

      if (!hasPermission) {
        return NextResponse.json({ 
          error: 'Access Denied: Super Admin has not granted you permission to generate coupon codes.' 
        }, { status: 403 });
      }
    }

    const { amount, assignToId, planId } = await req.json();
    const count = parseInt(amount, 10);

    if (isNaN(count) || count < 1 || count > 100) {
      return NextResponse.json({ error: 'Invalid amount. Must be between 1 and 100.' }, { status: 400 });
    }

    if (!planId) {
      return NextResponse.json({ error: 'A valid paid plan must be selected for code generation.' }, { status: 400 });
    }

    const selectedPlan = await prisma.membershipPlan.findUnique({
      where: { id: planId }
    });

    if (!selectedPlan || selectedPlan.name.toUpperCase() === 'FREE') {
      return NextResponse.json({ error: 'A valid paid membership plan must be selected for code generation.' }, { status: 400 });
    }

    let targetVendorId = null;

    if (assignToId === 'SELF') {
      targetVendorId = userId;
    } else if (assignToId === 'UNASSIGNED') {
      targetVendorId = null;
    } else if (assignToId) {
      targetVendorId = assignToId;
    }

    const generatedCodes = [];

    // Generate unique codes
    for (let i = 0; i < count; i++) {
      let unique = false;
      let code = '';
      while (!unique) {
        code = generateRandomCode();
        const existing = await prisma.couponCode.findUnique({ where: { code } });
        if (!existing) unique = true;
      }
      
      generatedCodes.push({
        code,
        assignedVendorId: targetVendorId,
        status: 'UNUSED' as const,
        planId: selectedPlan.id,
      });
    }

    await prisma.couponCode.createMany({
      data: generatedCodes
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'GENERATED_COUPONS',
        description: `Generated ${count} new ${selectedPlan.name} activation coupons.`,
        userId: userId
      }
    });

    return NextResponse.json({ message: 'Coupons generated successfully!', count });

  } catch (error: any) {
    console.error('Coupon Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can delete coupons.' }, { status: 403 });
    }

    const { couponCode } = await req.json();

    if (!couponCode) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    const existing = await prisma.couponCode.findUnique({
      where: { code: couponCode },
      include: {
        assignedVendor: true,
        plan: true
      }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });
    }

    const vendorId = existing.assignedVendorId;
    const vendorName = existing.assignedVendor?.username || 'Unassigned';
    const planName = existing.plan?.name || 'Activation';

    // 1. Delete associated notifications for the vendor referencing this specific code
    if (vendorId) {
      await prisma.notification.deleteMany({
        where: {
          targetUserId: vendorId,
          OR: [
            { message: { contains: couponCode } },
            { title: { contains: couponCode } }
          ]
        }
      });
    }

    // 2. Permanently delete coupon code from database
    await prisma.couponCode.delete({
      where: { id: existing.id }
    });

    // 3. Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETED_COUPON',
        description: `Permanently deleted coupon code: ${couponCode} (${planName} Plan, Vendor: @${vendorName}). All associated details and notifications removed.`,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({ message: 'Coupon and all associated vendor details deleted successfully!' });

  } catch (error: any) {
    console.error('Coupon Deletion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
