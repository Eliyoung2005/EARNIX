'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitTaskProof(taskId: string, proofUrl?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const userId = (session.user as any).id;

  try {
    // Check if the task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    // Check if user already submitted this task
    const existingSubmission = await prisma.taskSubmission.findFirst({
      where: {
        userId,
        taskId
      }
    });

    if (existingSubmission) {
      return { success: false, error: 'You have already submitted proof for this task.' };
    }

    // Create the submission
    if (task.requiresProof) {
      if (!proofUrl) return { success: false, error: 'Proof URL is required for this task.' };
      
      await prisma.taskSubmission.create({
        data: {
          userId,
          taskId,
          proofUrl,
          status: 'PENDING'
        }
      });
    } else {
      // Auto-approve if no proof required
      await prisma.$transaction([
        prisma.taskSubmission.create({
          data: {
            userId,
            taskId,
            status: 'APPROVED'
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            taskBalance: { increment: task.reward },
            totalEarnings: { increment: task.reward }
          }
        })
      ]);
    }

    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Error submitting task proof:', error);
    return { success: false, error: 'Failed to submit proof. Please try again later.' };
  }
}
