import { prisma } from '@/lib/prisma';
import ManageTasksClient from './ManageTasksClient';

export const dynamic = 'force-dynamic';

export default async function AdminTasks() {
  const distinctUsers = await prisma.taskSubmission.findMany({
    where: { status: 'APPROVED' },
    distinct: ['userId'],
    select: { userId: true }
  });
  const totalUniqueUsers = distinctUsers.length;

  const totalTasksCompleted = await prisma.taskSubmission.count({
    where: { status: 'APPROVED' }
  });

  const activeTasks = await prisma.task.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { submissions: { where: { status: 'APPROVED' } } }
      }
    }
  });

  const tasksWithStats = activeTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    platform: task.platform,
    reward: task.reward,
    link: task.link,
    requiresProof: task.requiresProof,
    targetPlan: task.targetPlan,
    submissionCount: task._count.submissions
  }));

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Manage Sponsored Tasks</h1>
      <ManageTasksClient 
        initialTasks={tasksWithStats} 
        globalStats={{
          totalUniqueUsers,
          totalTasksCompleted
        }}
      />
    </div>
  );
}
