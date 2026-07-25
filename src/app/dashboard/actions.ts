'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function markWelcomePopupAsSeen() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = (session.user as any).id;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { hasSeenWelcomePopup: true }
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking welcome popup as seen:', error);
    return { success: false };
  }
}
