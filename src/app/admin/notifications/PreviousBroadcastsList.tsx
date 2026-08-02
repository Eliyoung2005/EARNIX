'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBroadcast } from './actions';
import { Trash2, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function PreviousBroadcastsList({ broadcasts }: { broadcasts: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this broadcast notification? It will stop popping up for users.')) {
      return;
    }

    startTransition(async () => {
      const res = await deleteBroadcast(id);
      if (res.success) {
        alert('Broadcast notification deleted successfully.');
        router.refresh();
      } else {
        alert('Failed to delete broadcast.');
      }
    });
  };

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Previous Broadcasts ({broadcasts.length})</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {broadcasts.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No previous popup broadcasts found.
          </p>
        ) : (
          broadcasts.map(item => (
            <div 
              key={item.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem', 
                padding: '1.25rem', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '12px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>{item.title}</h3>
                  <span style={{ 
                    display: 'inline-block',
                    fontSize: '0.75rem', 
                    background: item.targetAudience === 'ALL' ? 'var(--accent-blue)' : (item.targetAudience === 'PRO' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.15)'), 
                    color: item.targetAudience === 'PRO' ? '#000' : '#fff',
                    fontWeight: 'bold',
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '50px',
                    marginTop: '0.25rem'
                  }}>
                    Audience: {item.targetAudience}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.25rem 0' }}>
                {item.message}
              </p>

              {item.link && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                  <LinkIcon size={12} />
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    {item.link} <ExternalLink size={10} />
                  </a>
                </div>
              )}

              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>
                Sent: {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
