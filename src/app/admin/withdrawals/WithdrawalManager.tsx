'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WithdrawalManager({ withdrawals }: { withdrawals: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredWithdrawals = withdrawals.filter(req => {
    const term = searchTerm.toLowerCase();
    return (
      req.user.username.toLowerCase().includes(term) ||
      req.user.email.toLowerCase().includes(term) ||
      (req.user.bankName && req.user.bankName.toLowerCase().includes(term)) ||
      (req.user.accountName && req.user.accountName.toLowerCase().includes(term)) ||
      (req.user.accountNumber && req.user.accountNumber.toLowerCase().includes(term)) ||
      req.status.toLowerCase().includes(term) ||
      req.type.toLowerCase().includes(term) ||
      req.amount.toString().includes(term)
    );
  });

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;

    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, action })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update withdrawal');

      alert(data.message);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', margin: 0 }}>All Withdrawal Requests</h2>
        <input 
          type="text" 
          placeholder="Search history by name, account, amount..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            maxWidth: '350px',
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.2)', 
            background: 'rgba(0,0,0,0.3)', 
            color: 'white',
            fontSize: '0.9rem'
          }}
        />
      </div>
      
      {filteredWithdrawals.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No withdrawal requests found matching your search.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>User</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Amount</th>
                <th style={{ padding: '1rem' }}>Bank Details</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{req.user.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.user.email}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: req.type === 'AFFILIATE' ? 'var(--accent-blue)' : 'var(--accent-gold)' }}>
                    {req.type}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    ₦{req.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.9rem' }}>{req.user.bankName || 'N/A'}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{req.user.accountNumber || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.user.accountName || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'rgba(255,255,255,0.5)' }}>
                      {new Date(req.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      backgroundColor: req.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : (req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                      color: req.status === 'PENDING' ? 'var(--warning)' : (req.status === 'APPROVED' ? 'var(--success)' : 'var(--error)')
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleAction(req.id, 'APPROVE')}
                          disabled={loadingId === req.id}
                          style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', opacity: loadingId === req.id ? 0.5 : 1 }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'REJECT')}
                          disabled={loadingId === req.id}
                          style={{ background: 'var(--error)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', opacity: loadingId === req.id ? 0.5 : 1 }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
