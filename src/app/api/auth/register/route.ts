import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fname, lname, username, email, password, withdrawalPin, planName, coupon, referrerUsername } = body;

    // 1. Validation
    if (!fname || !lname || !username || !email || !password || !withdrawalPin) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(withdrawalPin)) {
      return NextResponse.json({ error: 'Withdrawal PIN must be exactly 4 digits' }, { status: 400 });
    }

    // 2. Check for existing username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    // 3. Handle Referrer lookup
    let referrerId: string | null = null;
    if (referrerUsername && referrerUsername.trim() !== '') {
      const refUser = await prisma.user.findUnique({
        where: { username: referrerUsername.trim() }
      });
      if (refUser) {
        referrerId = refUser.id;
      }
    }

    // 4. Password & PIN Hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(withdrawalPin, 10);

    // 5. Lookup Membership Plan
    let selectedPlan;
    if (planName) {
      selectedPlan = await prisma.membershipPlan.findUnique({
        where: { name: planName }
      });
    }
    if (!selectedPlan) {
      selectedPlan = await prisma.membershipPlan.findFirst({
        where: { isActive: true }
      });
    }

    if (!selectedPlan || !selectedPlan.isActive) {
      return NextResponse.json({ error: 'Selected plan is invalid or currently inactive' }, { status: 400 });
    }

    const welcomeBonus = selectedPlan.welcomeBonus || 0;

    // 6. Handle Paid Plans (Price > 0)
    if (selectedPlan.price > 0) {
      if (!coupon) {
        return NextResponse.json({ error: `A valid coupon code is required for the ${selectedPlan.name} plan` }, { status: 400 });
      }

      const upperCoupon = coupon.toUpperCase().trim();

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
            totalEarnings: welcomeBonus,
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

        if (welcomeBonus > 0) {
          await tx.activityLog.create({
            data: {
              action: 'SIGNUP_BONUS',
              description: `Received ₦${welcomeBonus} ${selectedPlan.name} sign-up bonus`,
              userId: newUser.id
            }
          });
        }

        return newUser;
      });

      if (referrerId && selectedPlan.referralCommission > 0) {
        const refComm = selectedPlan.referralCommission;
        try {
          await prisma.user.update({
            where: { id: referrerId },
            data: {
              referralCount: { increment: 1 },
              weeklyReferralCount: { increment: 1 },
              affiliateBalance: { increment: refComm }
            }
          });
          await prisma.activityLog.create({
            data: {
              action: 'REFERRAL_BONUS',
              description: `Received ₦${refComm.toLocaleString()} referral commission for new user registration (${username})`,
              userId: referrerId
            }
          });
        } catch (err) {
          console.error("Referral bonus error:", err);
        }
      }

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
    }

    // Free Registration (Price === 0) — User gets Welcome Bonus, but ZERO Referral Commission for referrer
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
        affiliateBalance: 0,
        totalEarnings: welcomeBonus,
      }
    });

    if (welcomeBonus > 0) {
      await prisma.activityLog.create({
        data: {
          action: 'SIGNUP_BONUS',
          description: `Received ₦${welcomeBonus} ${selectedPlan.name} sign-up bonus`,
          userId: user.id
        }
      });
    }

    // Free plan referrals increment count only, NO money commission
    if (referrerId) {
      const refComm = selectedPlan.referralCommission || 0; // 0 for FREE plan
      try {
        await prisma.user.update({
          where: { id: referrerId },
          data: {
            referralCount: { increment: 1 },
            weeklyReferralCount: { increment: 1 },
            affiliateBalance: { increment: refComm }
          }
        });
      } catch (err) {
        console.error("Referral update error:", err);
      }
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
