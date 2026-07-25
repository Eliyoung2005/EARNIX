'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateAdSenseSettings(data: { adsenseEnabled: boolean; adsenseClientId: string }) {
  await prisma.platformSettings.update({
    where: { id: "1" },
    data: {
      adsenseEnabled: data.adsenseEnabled,
      adsenseClientId: data.adsenseClientId || null,
    }
  });

  revalidatePath('/admin/adsense');
  revalidatePath('/'); // Revalidate where ads are shown
  return { success: true };
}
