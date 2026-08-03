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

async function getUniqueCode() {
  let unique = false;
  let code = '';
  while (!unique) {
    code = generateRandomCode();
    const existing = await prisma.couponCode.findUnique({ where: { code } });
    if (!existing) unique = true;
  }
  return code;
}

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    // Only Admin/SubAdmin/SuperAdmin can transfer unassigned coupons
    if (role !== 'ADMIN' && role !== 'SUB_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { couponCode, targetVendorId, amount, planId } = await req.json();

    if (!targetVendorId) {
      return NextResponse.json({ error: 'Target vendor is required' }, { status: 400 });
    }

    // Verify target vendor exists and is actually a VENDOR
    const targetVendor = await prisma.user.findUnique({
      where: { id: targetVendorId }
    });

    if (!targetVendor || targetVendor.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Invalid target vendor selected' }, { status: 400 });
    }

    // --- BATCH TRANSFER MODE ---
    if (amount && !couponCode) {
      const count = parseInt(amount, 10);
      if (isNaN(count) || count < 1) {
        return NextResponse.json({ error: 'Invalid amount for batch transfer' }, { status: 400 });
      }

      const poolCoupons = await prisma.couponCode.findMany({
        where: { 
          status: 'UNUSED', 
          assignedVendorId: null,
          ...(planId ? { planId } : {})
        },
        take: count
      });

      if (poolCoupons.length === 0) {
        return NextResponse.json({ error: 'No unassigned coupons available in pool' }, { status: 400 });
      }

      const transferredCodes: string[] = [];
      for (const coupon of poolCoupons) {
        const freshCode = await getUniqueCode();
        await prisma.couponCode.update({
          where: { id: coupon.id },
          data: {
            code: freshCode,
            assignedVendorId: targetVendor.id,
            createdAt: new Date()
          }
        });
        transferredCodes.push(freshCode);
      }

      await prisma.activityLog.create({
        data: {
          action: 'BATCH_COUPONS_TRANSFERRED',
          description: `Transferred ${transferredCodes.length} coupons to vendor ${targetVendor.username} with freshly generated codes.`,
          userId: (session.user as any).id
        }
      });

      let planName = 'Activation';
      if (planId) {
        const p = await prisma.membershipPlan.findUnique({ where: { id: planId } });
        if (p) planName = p.name;
      }

      await prisma.notification.create({
        data: {
          title: `New ${planName} Activation Codes Assigned`,
          message: `You have been assigned ${transferredCodes.length} ${planName} activation code(s). Check your Vendor Dashboard to view and manage them.`,
          targetAudience: 'INDIVIDUAL',
          targetUserId: targetVendor.id
        }
      });

      return NextResponse.json({
        message: `Successfully transferred ${transferredCodes.length} coupons to @${targetVendor.username} with fresh unique codes!`,
        count: transferredCodes.length,
        codes: transferredCodes
      });
    }

    // --- SINGLE TRANSFER MODE ---
    if (!couponCode) {
      return NextResponse.json({ error: 'Coupon code or amount is required' }, { status: 400 });
    }

    // Find the coupon
    const coupon = await prisma.couponCode.findUnique({
      where: { code: couponCode },
      include: { plan: true }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    if (coupon.status === 'USED') {
      return NextResponse.json({ error: 'Cannot transfer an already used coupon' }, { status: 400 });
    }

    // Generate a fresh unique code for the vendor assignment
    const freshCode = await getUniqueCode();

    // Update ownership and code string
    const updated = await prisma.couponCode.update({
      where: { id: coupon.id },
      data: {
        code: freshCode,
        assignedVendorId: targetVendor.id,
        createdAt: new Date()
      }
    });

    // Log the transfer
    await prisma.activityLog.create({
      data: {
        action: 'COUPON_TRANSFERRED',
        description: `Assigned coupon to ${targetVendor.username}. Code updated to fresh code ${freshCode} (was ${coupon.code}).`,
        userId: (session.user as any).id
      }
    });

    const pName = coupon.plan?.name || 'Activation';
    await prisma.notification.create({
      data: {
        title: `New ${pName} Activation Codes Assigned`,
        message: `You have been assigned 1 ${pName} activation code(s). Check your Vendor Dashboard to view and manage them.`,
        targetAudience: 'INDIVIDUAL',
        targetUserId: targetVendor.id
      }
    });

    return NextResponse.json({
      message: `Coupon assigned to @${targetVendor.username}! Fresh Code: ${freshCode}`,
      newCode: updated.code,
      previousCode: coupon.code,
      assignedVendor: targetVendor.username
    });

  } catch (error: any) {
    console.error('Coupon Transfer Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

