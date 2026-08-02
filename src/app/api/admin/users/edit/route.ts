export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionRole = (session.user as any).role;
    if (sessionRole !== 'ADMIN' && sessionRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can edit user account details.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, name, username, email, taskBalance, affiliateBalance, planName, role, password } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (username !== undefined && username.trim() !== existingUser.username) {
      const unameExists = await prisma.user.findUnique({ where: { username: username.trim() } });
      if (unameExists && unameExists.id !== userId) {
        return NextResponse.json({ error: 'Username already taken by another account.' }, { status: 400 });
      }
      updateData.username = username.trim();
    }

    if (email !== undefined && email.trim() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (emailExists && emailExists.id !== userId) {
        return NextResponse.json({ error: 'Email address already registered to another user.' }, { status: 400 });
      }
      updateData.email = email.trim();
    }

    if (taskBalance !== undefined) updateData.taskBalance = parseFloat(taskBalance) || 0;
    if (affiliateBalance !== undefined) updateData.affiliateBalance = parseFloat(affiliateBalance) || 0;
    if (role !== undefined) updateData.role = role;

    if (planName) {
      const targetPlan = await prisma.membershipPlan.findUnique({
        where: { name: planName }
      });
      if (targetPlan) {
        updateData.planId = targetPlan.id;
      }
    }

    if (password && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        taskBalance: true,
        affiliateBalance: true,
        role: true,
        membership: { select: { name: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'EDITED_USER_ACCOUNT',
        description: `Super Admin modified account details for @${updatedUser.username}`,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({
      message: `User details for @${updatedUser.username} updated successfully!`,
      user: {
        ...updatedUser,
        plan: updatedUser.membership?.name || 'FREE'
      }
    });

  } catch (error: any) {
    console.error('Edit User Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
