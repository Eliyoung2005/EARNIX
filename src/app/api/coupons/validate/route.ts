import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ status: 'INVALID' });
    }

    const upperCode = code.toUpperCase().trim();

    const coupon = await prisma.couponCode.findUnique({
      where: { code: upperCode }
    });

    if (!coupon) {
      return NextResponse.json({ status: 'INVALID' });
    }

    if (coupon.status === 'USED') {
      return NextResponse.json({ status: 'USED' });
    }

    return NextResponse.json({ status: 'VALID' });
  } catch (error) {
    console.error('Coupon Validation Error:', error);
    return NextResponse.json({ status: 'INVALID' });
  }
}
