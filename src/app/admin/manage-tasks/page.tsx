import { prisma } from '@/lib/prisma';
import ManageTasksClient from './ManageTasksClient';

export default async function AdminTasks() {
  const activeTasks = await prisma.task.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Manage Sponsored Tasks</h1>
      <ManageTasksClient initialTasks={activeTasks} />
    </div>
  );
}
