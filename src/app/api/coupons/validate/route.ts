export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ 
        status: 'INVALID', 
        message: 'Please enter a coupon code.' 
      });
    }

    const upperCode = code.toUpperCase().trim();

    const coupon = await prisma.couponCode.findUnique({
      where: { code: upperCode },
      include: {
        assignedVendor: {
          select: { name: true, username: true }
        },
        plan: { select: { name: true } }
      }
    });

    if (!coupon) {
      return NextResponse.json({
        status: 'INVALID',
        message: `The coupon code "${upperCode}" is invalid or does not exist. Please purchase genuine activation codes from our authorized vendors.`,
        code: upperCode
      });
    }

    if (coupon.status === 'USED') {
      return NextResponse.json({
        status: 'USED',
        message: `This coupon code "${upperCode}" has already been redeemed and cannot be reused.`,
        code: upperCode,
        vendor: coupon.assignedVendor?.name || coupon.assignedVendor?.username || 'Authorized Vendor',
        redeemedDate: coupon.redeemedDate,
        planName: coupon.plan?.name || null
      });
    }

    return NextResponse.json({
      status: 'VALID',
      message: coupon.plan?.name ? ` Coupon Code "${upperCode}" is VALID & UNUSED! This is a ${coupon.plan.name} plan activation code.` : ` Coupon Code "${upperCode}" is VALID & UNUSED! It is ready for registration or plan upgrade.`,
      code: upperCode,
      vendor: coupon.assignedVendor?.name || coupon.assignedVendor?.username || 'Authorized Vendor',
      createdAt: coupon.createdAt,
      planName: coupon.plan?.name || null
    });
  } catch (error) {
    console.error('Coupon Validation Error:', error);
    return NextResponse.json({ status: 'INVALID', message: 'An error occurred while validating code.' }, { status: 500 });
  }
}
