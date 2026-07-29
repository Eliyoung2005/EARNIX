'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitTaskProof(taskId: string, proofUrl?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: 'Unauthorized. Please sign in to submit tasks.' };
  }

  const userId = (session.user as any).id;

  try {
    // Check if the task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    if (task.status !== 'ACTIVE') {
      return { success: false, error: 'This task is no longer active.' };
    }

    // Check existing submission status
    const existingSubmission = await prisma.taskSubmission.findFirst({
      where: { userId, taskId }
    });

    if (existingSubmission) {
      if (existingSubmission.status === 'PENDING') {
        return { success: false, error: 'Your proof for this task is already under review.' };
      }
      if (existingSubmission.status === 'APPROVED') {
        return { success: false, error: 'You have already completed this task.' };
      }

      // If status is REJECTED, allow re-submitting with updated proof
      if (task.requiresProof) {
        if (!proofUrl) return { success: false, error: 'Proof screenshot is required for this task.' };
        await prisma.taskSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            proofUrl,
            status: 'PENDING',
            createdAt: new Date()
          }
        });
      } else {
        await prisma.$transaction([
          prisma.taskSubmission.update({
            where: { id: existingSubmission.id },
            data: {
              status: 'APPROVED',
              createdAt: new Date()
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
    }

    // Create new submission
    if (task.requiresProof) {
      if (!proofUrl) return { success: false, error: 'Proof screenshot is required for this task.' };

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
  } catch (error: any) {
    console.error('Error submitting task proof:', error);
    return { success: false, error: error?.message || 'Failed to submit proof. Please try again later.' };
  }
}
