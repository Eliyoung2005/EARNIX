import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminSession';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can manage user roles.' }, { status: 403 });
    }

    const { userId, newRole } = await req.json();

    if (!userId || !['USER', 'VENDOR', 'ADMIN', 'SUB_ADMIN', 'SUPER_ADMIN'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid user ID or role format.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    
    await prisma.activityLog.create({
      data: {
        action: 'PROMOTED_USER',
        description: `Changed role of ${updatedUser.username} to ${newRole}`,
        userId: (session.user as any).id
      }
    });

    return NextResponse.json({ message: `Success! ${updatedUser.username} is now a ${newRole}.` });
  } catch (error: any) {
    console.error('Role Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
