import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fname, lname, username, email, password, pin, plan, coupon } = body;

    // 1. Basic validation
    if (!fname || !lname || !username || !email || !password || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Validate password complexity (backend defense)
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Password does not meet complexity requirements' }, { status: 400 });
    }

    // 3. Check for existing user by Email OR Username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    // 4. Hash Password & PIN
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    // 5. Registration logic (Welcome Bonus and Plan)
    // We would ideally fetch these values from PlatformSettings
    const settings = await prisma.platformSettings.findFirst();
    const welcomeBonus = plan === 'PRO' ? (settings?.welcomeBonusPro || 100.0) : (settings?.welcomeBonusFree || 50.0);

    // If PRO, we check the coupon code logic here
    if (plan === 'PRO') {
      if (!coupon) {
        // Normally redirect to paystack
        // For now, let's just reject if no coupon in this mockup logic
        return NextResponse.json({ error: 'Payment logic or valid coupon required for PRO plan' }, { status: 400 });
      }

      // Normalize coupon code
      const upperCoupon = coupon.toUpperCase().trim();

      // Check coupon
      const validCoupon = await prisma.couponCode.findUnique({
        where: { code: upperCoupon }
      });

      if (!validCoupon || validCoupon.status === 'USED') {
        return NextResponse.json({ error: 'Invalid or already used coupon code' }, { status: 400 });
      }

      // Create User and Mark Coupon as Used in a Transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: `${fname} ${lname}`,
            username,
            email,
            password: hashedPassword,
            withdrawalPin: hashedPin,
            role: 'USER',
            plan: 'PRO',
            taskBalance: welcomeBonus,
          }
        });

        await tx.couponCode.update({
          where: { id: validCoupon.id },
          data: {
            status: 'USED',
            redeemedById: newUser.id,
            redeemedDate: new Date()
          }
        });

        // Add transaction log
        await tx.activityLog.create({
          data: {
            action: 'SIGNUP_BONUS',
            description: `Received ₦${welcomeBonus} PRO sign-up bonus`,
            userId: newUser.id
          }
        });

        return newUser;
      });

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
    }

    // Free Registration
    const user = await prisma.user.create({
      data: {
        name: `${fname} ${lname}`,
        username,
        email,
        password: hashedPassword,
        withdrawalPin: hashedPin,
        role: 'USER',
        plan: 'FREE',
        taskBalance: welcomeBonus,
      }
    });

    // Add transaction log for Free User
    await prisma.activityLog.create({
      data: {
        action: 'SIGNUP_BONUS',
        description: `Received ₦${welcomeBonus} FREE sign-up bonus`,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
