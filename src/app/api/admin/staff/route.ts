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

    const role = (session.user as any).role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Only Super Admins can perform this action.' }, { status: 403 });
    }

    const { userId, action, permissions, newPassword } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'UPDATE_PERMISSIONS') {
      if (!Array.isArray(permissions)) {
        return NextResponse.json({ error: 'Invalid permissions format' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { subAdminPermissions: permissions as any }
      });

      await prisma.activityLog.create({
        data: {
          action: 'UPDATED_PERMISSIONS',
          description: `Updated permissions for ${targetUser.username}`,
          userId: (session.user as any).id
        }
      });

      return NextResponse.json({ message: 'Permissions updated successfully' });
    } 
    
    else if (action === 'RESET_PASSWORD') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      await prisma.activityLog.create({
        data: {
          action: 'RESET_PASSWORD',
          description: `Reset password for ${targetUser.username}`,
          userId: (session.user as any).id
        }
      });

      return NextResponse.json({ message: 'Password has been successfully updated' });
    }
    
    else if (action === 'DELETE_USER') {
      // Delete the user completely from the database
      await prisma.user.delete({
        where: { id: userId }
      });

      await prisma.activityLog.create({
        data: {
          action: 'DELETED_STAFF',
          description: `Permanently deleted staff/vendor account: ${targetUser.username}`,
          userId: (session.user as any).id
        }
      });

      return NextResponse.json({ message: 'User account has been permanently deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Staff Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
