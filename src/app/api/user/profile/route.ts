import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        membership: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = await prisma.platformSettings.findFirst();

    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bankName: user.bankName || '',
      accountName: user.accountName || '',
      accountNumber: user.accountNumber || '',
      hasPin: !!user.withdrawalPin,
      role: user.role,
      plan: user.membership?.name || 'FREE',
      affiliateBalance: user.affiliateBalance,
      taskBalance: user.taskBalance,
      minAffiliateWithdrawal: user.membership?.minAffiliateWithdrawal || 5000,
      minTaskWithdrawal: user.membership?.minTaskWithdrawal || 2000,
      planWithdrawalOpen: user.membership?.withdrawalPortalOpen ?? true,
      settings: settings || {},
    });
  } catch (error: any) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Failed to load profile details' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { action, bankName, accountName, accountNumber, currentPin, newPin } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle bank details update
    if (action === 'updateBank') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          bankName: bankName || '',
          accountName: accountName || '',
          accountNumber: accountNumber || '',
        },
      });

      return NextResponse.json({ message: 'Withdrawal bank details updated successfully!' });
    }

    // Handle withdrawal PIN setup / update
    if (action === 'updatePin') {
      if (!newPin || !/^\d{4}$/.test(newPin)) {
        return NextResponse.json({ error: 'New PIN must be exactly 4 digits.' }, { status: 400 });
      }

      // If user already has a pin set, verify current PIN
      if (user.withdrawalPin) {
        if (!currentPin) {
          return NextResponse.json({ error: 'Please enter your current PIN to change it.' }, { status: 400 });
        }
        const isValid = await bcrypt.compare(currentPin, user.withdrawalPin);
        if (!isValid) {
          return NextResponse.json({ error: 'Incorrect current PIN.' }, { status: 400 });
        }
      }

      const hashedPin = await bcrypt.hash(newPin, 10);

      await prisma.user.update({
        where: { id: userId },
        data: {
          withdrawalPin: hashedPin,
        },
      });

      return NextResponse.json({ message: 'Withdrawal PIN updated successfully!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile details' }, { status: 500 });
  }
}
