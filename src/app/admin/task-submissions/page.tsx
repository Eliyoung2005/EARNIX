import { prisma } from '@/lib/prisma';
import SubmissionListClient from './SubmissionListClient';

export const dynamic = 'force-dynamic';

export default async function AdminTaskSubmissions() {
  const pendingSubmissions = await prisma.taskSubmission.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { name: true, username: true } },
      task: { select: { title: true, reward: true, platform: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Review Task Proofs</h1>
        <div style={{ background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold' }}>
          {pendingSubmissions.length} Pending
        </div>
      </div>

      <SubmissionListClient submissions={pendingSubmissions} />
    </div>
  );
}
