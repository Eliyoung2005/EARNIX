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
  welcomePopupLink: string;
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
        welcomePopupMessagePro: data.welcomePopupMessagePro,
        welcomePopupLink: data.welcomePopupLink.trim() || null,
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating welcome popup settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

export async function broadcastGlobalPopup(data: {
  title: string;
  message: string;
  link: string;
  targetAudience: string;
  targetEmail?: string;
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
    let targetUserId: string | null = null;
    if (data.targetAudience === 'SPECIFIC' && data.targetEmail) {
      const user = await prisma.user.findUnique({
        where: { email: data.targetEmail.trim() }
      });
      if (!user) {
        return { success: false, error: 'User with this email not found' };
      }
      targetUserId = user.id;
    }

    await prisma.notification.create({
      data: {
        title: data.title.trim(),
        message: data.message.trim(),
        link: data.link.trim() || null,
        targetAudience: data.targetAudience,
        targetUserId
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return { success: false, error: 'Failed to create broadcast' };
  }
}

export async function deleteBroadcast(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    await prisma.notification.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    return { success: false, error: 'Failed to delete' };
  }
}
