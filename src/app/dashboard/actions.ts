'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { revalidatePath } from 'next/cache';

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
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error marking welcome popup as seen:', error);
    return { success: false };
  }
}

export async function dismissUpgradeThankYou() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const userId = (session.user as any).id;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { pendingUpgradeThankYou: null }
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error dismissing upgrade thank you:', error);
    return { success: false };
  }
}

