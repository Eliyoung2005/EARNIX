'use client';

import { useState } from 'react';
import { approveSubmission, rejectSubmission } from './actions';
import { useCurrency } from '@/lib/CurrencyContext';

type Submission = {
  id: string;
  proofUrl: string | null;
  createdAt: Date;
  user: { name: string; username: string };
  task: { title: string; reward: number; platform: string };
};

export default function SubmissionListClient({ submissions }: { submissions: Submission[] }) {
  const { fmt } = useCurrency();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (confirm('Approve this submission? The user will be credited.')) {
      setProcessingId(id);
      await approveSubmission(id);
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Reject this submission? It will be marked as rejected.')) {
      setProcessingId(id);
      await rejectSubmission(id);
      setProcessingId(null);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="bg-surface" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>There are no pending task submissions to review.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      {submissions.map((sub) => (
        <div key={sub.id} className="bg-surface" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Proof Image */}
          <div style={{ height: '250px', backgroundColor: '#000', position: 'relative' }}>
            <img 
              src={sub.proofUrl || ''} 
              alt="Task Proof" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Pending Review
            </div>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{sub.task.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sub.task.platform} • {fmt(sub.task.reward)}</p>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Submitted by</p>
              <p style={{ fontWeight: 'bold' }}>{sub.user.name} <span style={{ color: 'var(--text-secondary)' }}>(@{sub.user.username})</span></p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {new Date(sub.createdAt).toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => handleReject(sub.id)}
                disabled={processingId === sub.id}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.3)', fontWeight: 'bold', cursor: processingId === sub.id ? 'not-allowed' : 'pointer' }}
              >
                {processingId === sub.id ? 'Processing...' : 'Reject'}
              </button>
              <button 
                onClick={() => handleApprove(sub.id)}
                disabled={processingId === sub.id}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'var(--accent-blue)', color: 'white', border: 'none', fontWeight: 'bold', cursor: processingId === sub.id ? 'not-allowed' : 'pointer' }}
              >
                {processingId === sub.id ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
