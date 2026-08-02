export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionRole = (session.user as any).role;
    if (sessionRole !== 'ADMIN' && sessionRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can delete accounts.' }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }

    // Prevent deleting oneself
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: 'You cannot delete your own Super Admin account!' }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Delete user (Cascade will handle related task submissions, activity logs, etc.)
    await prisma.user.delete({
      where: { id: userId }
    });

    await prisma.activityLog.create({
      data: {
        action: 'DELETED_USER_ACCOUNT',
        description: `Super Admin permanently deleted account for @${userToDelete.username}`,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({
      message: `User account @${userToDelete.username} deleted permanently.`
    });

  } catch (error: any) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
