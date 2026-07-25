'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  
  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function createNewTask(data: {
  title: string;
  description: string;
  platform: string;
  reward: number;
  link: string;
  requiresProof: boolean;
  targetPlan: string;
}) {
  await checkAdmin();

  try {
    await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        platform: data.platform,
        reward: data.reward,
        link: data.link,
        requiresProof: data.requiresProof,
        targetPlan: data.targetPlan,
        status: 'ACTIVE'
      }
    });

    revalidatePath('/admin/manage-tasks');
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function deleteTask(taskId: string) {
  await checkAdmin();

  try {
    await prisma.task.delete({
      where: { id: taskId }
    });

    revalidatePath('/admin/manage-tasks');
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}
