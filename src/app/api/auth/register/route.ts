export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isReferrerEligible, handleReferredUserUpgrade } from '@/lib/referralUtils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Accept both old field names (planName/referrerUsername) and new form field names (plan/referralCode)
    const {
      fname,
      lname,
      username,
      email,
      password,
      withdrawalPin,
      phone,
      // Plan can come as ID or name
      plan,
      planName,
      // Referral can come as username or code (username in this app)
      referralCode,
      referrerUsername,
      coupon,
    } = body;

    const resolvedReferrer = referrerUsername || referralCode || null;
    const resolvedPlanIdentifier = planName || plan || null;

    // 1. Validation — withdrawalPin is optional (default to '0000' if not provided)
    if (!fname || !lname || !username || !email || !password) {
      return NextResponse.json({ error: 'All required fields must be filled in' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const pinToUse = withdrawalPin && /^\d{4}$/.test(withdrawalPin) ? withdrawalPin : '0000';

    const cleanUsername = username.replace(/\s+/g, '').toLowerCase();

    // 2. Check for existing username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: cleanUsername }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Username is already taken. Please choose a different one.' }, { status: 400 });
    }

    // 3. Handle Referrer lookup (by username)
    let referrerId: string | null = null;
    if (resolvedReferrer && resolvedReferrer.trim() !== '') {
      const cleanReferrer = resolvedReferrer.replace(/\s+/g, '').toLowerCase();
      const refUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: cleanReferrer },
            { email: cleanReferrer }
          ]
        }
      });
      if (refUser) {
        referrerId = refUser.id;
      }
    }

    // 4. Password & PIN Hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pinToUse, 10);

    // 5. Lookup Membership Plan — try by ID first, then by name
    let selectedPlan = null;

    if (resolvedPlanIdentifier) {
      // Try by ID
      selectedPlan = await prisma.membershipPlan.findUnique({
        where: { id: resolvedPlanIdentifier }
      });
      // Try by exact name
      if (!selectedPlan) {
        selectedPlan = await prisma.membershipPlan.findUnique({
          where: { name: resolvedPlanIdentifier }
        });
      }
      // Try case-insensitive name match
      if (!selectedPlan) {
        const allPlans = await prisma.membershipPlan.findMany({ where: { isActive: true } });
        selectedPlan = allPlans.find(
          p => p.name.toUpperCase() === resolvedPlanIdentifier.toUpperCase()
        ) || null;
      }
    }

    // Fall back to the free/first active plan
    if (!selectedPlan) {
      selectedPlan = await prisma.membershipPlan.findFirst({
        where: { isActive: true, price: 0 },
        orderBy: { level: 'asc' }
      });
    }
    if (!selectedPlan) {
      selectedPlan = await prisma.membershipPlan.findFirst({
        where: { isActive: true },
        orderBy: { level: 'asc' }
      });
    }

    if (!selectedPlan || !selectedPlan.isActive) {
      return NextResponse.json({ error: 'No active membership plan found. Please contact support.' }, { status: 400 });
    }

    const welcomeBonus = selectedPlan.welcomeBonus || 0;

    // 6. Handle Paid Plans (Price > 0)
    if (selectedPlan.price > 0) {
      if (!coupon || !coupon.trim()) {
        return NextResponse.json(
          { error: `A valid coupon/activation code is required for the ${selectedPlan.name} plan` },
          { status: 400 }
        );
      }

      const upperCoupon = coupon.toUpperCase().trim();

      const validCoupon = await prisma.couponCode.findUnique({
        where: { code: upperCoupon }
      });

      if (!validCoupon || validCoupon.status === 'USED') {
        return NextResponse.json({ error: 'Invalid or already used coupon code' }, { status: 400 });
      }

      // Validate plan-specific coupon
      if (validCoupon.planId && validCoupon.planId !== selectedPlan.id) {
        // Look up the coupon's intended plan name for a clear error
        const couponPlan = await prisma.membershipPlan.findUnique({
          where: { id: validCoupon.planId },
          select: { name: true }
        });
        return NextResponse.json({ 
          error: `This activation code is for the ${couponPlan?.name || 'another'} plan. Please select the correct plan or use a different code.` 
        }, { status: 400 });
      }

      // Create User and Mark Coupon as Used in a Transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: `${fname.trim()} ${lname.trim()}`,
            username: cleanUsername,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            withdrawalPin: hashedPin,
            role: 'USER',
            planId: selectedPlan!.id,
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
              description: `Received ₦${welcomeBonus} ${selectedPlan!.name} sign-up bonus`,
              userId: newUser.id
            }
          });
        }

        if (referrerId) {
          // Create Referral Relation
          await tx.referral.create({
            data: {
              referrerId,
              referredId: newUser.id,
              paidPlanNames: []
            }
          });

          // Increment count for referrer
          await tx.user.update({
            where: { id: referrerId },
            data: {
              referralCount: { increment: 1 },
              weeklyReferralCount: { increment: 1 }
            }
          });

          // Process referral payouts across all active tiers (Level 1, Level 2, and Level 3)
          await handleReferredUserUpgrade(newUser.id, selectedPlan!.id, tx);
        }

        return newUser;
      });

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
    }

    // 7. Free Registration (Price === 0)
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: `${fname.trim()} ${lname.trim()}`,
          username: cleanUsername,
          email: email.trim().toLowerCase(),
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
        await tx.activityLog.create({
          data: {
            action: 'SIGNUP_BONUS',
            description: `Received ₦${welcomeBonus} ${selectedPlan.name} sign-up bonus`,
            userId: newUser.id
          }
        });
      }

      if (referrerId) {
        // Create Referral Relation
        await tx.referral.create({
          data: {
            referrerId,
            referredId: newUser.id,
            paidPlanNames: []
          }
        });

        // Increment counts only, no commission paid immediately since referred plan is FREE
        await tx.user.update({
          where: { id: referrerId },
          data: {
            referralCount: { increment: 1 },
            weeklyReferralCount: { increment: 1 },
          }
        });
      }

      return newUser;
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    // Surface Prisma/DB errors clearly in dev
    const message = error?.code === 'P2002'
      ? 'An account with this email or username already exists.'
      : 'Internal Server Error. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
