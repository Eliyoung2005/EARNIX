import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    // STRICTLY SUPER ADMIN ONLY
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can reset user passwords.' }, { status: 403 });
    }

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Invalid user ID or password too short (min 6 chars).' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    await prisma.activityLog.create({
      data: {
        action: 'PASSWORD_RESET',
        description: `Super Admin manually reset the password for ${updatedUser.username}`,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({ message: `Success! ${updatedUser.username}'s password has been reset.` });
  } catch (error: any) {
    console.error('Password Reset Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
