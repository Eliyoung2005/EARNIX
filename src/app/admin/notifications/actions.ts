'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function updateWelcomePopupSettings(data: {
  welcomePopupEnabled: boolean;
  welcomePopupTitleFree: string;
  welcomePopupMessageFree: string;
  welcomePopupTitlePro: string;
  welcomePopupMessagePro: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    await prisma.platformSettings.update({
      where: { id: "1" },
      data: {
        welcomePopupEnabled: data.welcomePopupEnabled,
        welcomePopupTitleFree: data.welcomePopupTitleFree,
        welcomePopupMessageFree: data.welcomePopupMessageFree,
        welcomePopupTitlePro: data.welcomePopupTitlePro,
        welcomePopupMessagePro: data.welcomePopupMessagePro
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating welcome popup settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
