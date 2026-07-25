import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TaskListClient from './TaskListClient';
import { redirect } from 'next/navigation';

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { membership: { select: { name: true } } }
  });

  const tasks = await prisma.task.findMany({
    where: { 
      status: 'ACTIVE',
      OR: [
        { targetPlan: 'ALL' },
        { targetPlan: dbUser?.membership?.name || 'FREE' }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  const userSubmissions = await prisma.taskSubmission.findMany({
    where: { userId },
    select: { taskId: true, status: true }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Sponsored Tasks</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Complete daily tasks to earn extra money. Upload a screenshot as proof of completion.</p>
      
      <TaskListClient tasks={tasks} userSubmissions={userSubmissions} />
    </div>
  );
}
