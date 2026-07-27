'use client';

import { useState, useEffect } from 'react';

export default function QuickActions({ username, plan }: { username: string, plan: string }) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const stableLink = `${origin || ''}/register?ref=${username}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(stableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert(`Your referral link:\n${stableLink}`);
    }
  };

  const handleWithdraw = (type: string) => {
    alert(`${type} Withdrawals are currently locked for processing. Check back later.`);
  };

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Quick Actions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plan !== 'FREE' && (
          <button onClick={() => handleWithdraw('Affiliate')} className="btn-primary" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px' }}>
            Withdraw Affiliate Funds <span>→</span>
          </button>
        )}
        <button onClick={() => handleWithdraw('Task')} className="btn-pro" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-color-light)', padding: '1rem', borderRadius: '12px' }}>
          Withdraw Task Earnings <span>→</span>
        </button>

        {/* Stable Referral Link Section - Available for ALL users on any device */}
        <div style={{
          marginTop: '0.5rem',
          padding: '1.25rem',
          borderRadius: '12px',
          background: 'rgba(192, 132, 252, 0.06)',
          border: '1px solid rgba(192, 132, 252, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>
              Your Stable Referral Link
            </span>
            <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '600' }}>
              Works anywhere worldwide
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(0,0,0,0.4)',
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <input
              type="text"
              readOnly
              value={stableLink}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ddd',
                fontSize: '0.85rem',
                width: '100%',
                outline: 'none',
                paddingLeft: '0.25rem'
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                background: copied ? '#22c55e' : 'linear-gradient(135deg, #d8b4fe 0%, #c084fc 50%, #a855f7 100%)',
                color: '#000',
                border: 'none',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? 'Copied! ✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
