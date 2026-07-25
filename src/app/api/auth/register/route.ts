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

    // 5. Fetch selected MembershipPlan
    const selectedPlan = await prisma.membershipPlan.findUnique({
      where: { id: plan } // The frontend now sends planId as 'plan'
    });

    if (!selectedPlan || !selectedPlan.isActive) {
      return NextResponse.json({ error: 'Selected plan is invalid or currently inactive' }, { status: 400 });
    }

    const welcomeBonus = selectedPlan.welcomeBonus;

    // 6. Handle Paid Plans (Price > 0)
    if (selectedPlan.price > 0) {
      if (!coupon) {
        return NextResponse.json({ error: `A valid coupon code is required for the ${selectedPlan.name} plan` }, { status: 400 });
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
            planId: selectedPlan.id,
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
            description: `Received ₦${welcomeBonus} ${selectedPlan.name} sign-up bonus`,
            userId: newUser.id
          }
        });

        return newUser;
      });

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
    }

    // Free Registration (Price === 0)
    const user = await prisma.user.create({
      data: {
        name: `${fname} ${lname}`,
        username,
        email,
        password: hashedPassword,
        withdrawalPin: hashedPin,
        role: 'USER',
        planId: selectedPlan.id,
        taskBalance: welcomeBonus,
      }
    });

    // Add transaction log for Free User
    await prisma.activityLog.create({
      data: {
        action: 'SIGNUP_BONUS',
        description: `Received ₦${welcomeBonus} ${selectedPlan.name} sign-up bonus`,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
