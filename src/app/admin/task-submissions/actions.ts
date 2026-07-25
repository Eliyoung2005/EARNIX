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

export async function approveSubmission(submissionId: string) {
  await checkAdmin();

  try {
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: { task: true }
    });

    if (!submission || submission.status !== 'PENDING') {
      return { success: false, error: 'Invalid or already processed submission' };
    }

    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      prisma.taskSubmission.update({
        where: { id: submissionId },
        data: { status: 'APPROVED' }
      }),
      prisma.user.update({
        where: { id: submission.userId },
        data: {
          taskBalance: { increment: submission.task.reward },
          totalEarnings: { increment: submission.task.reward }
        }
      })
    ]);

    revalidatePath('/admin/task-submissions');
    return { success: true };
  } catch (error) {
    console.error('Error approving submission:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function rejectSubmission(submissionId: string) {
  await checkAdmin();

  try {
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission || submission.status !== 'PENDING') {
      return { success: false, error: 'Invalid or already processed submission' };
    }

    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: { status: 'REJECTED' }
    });

    revalidatePath('/admin/task-submissions');
    return { success: true };
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return { success: false, error: 'Internal server error' };
  }
}
