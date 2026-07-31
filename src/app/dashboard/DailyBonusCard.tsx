'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DailyBonusCard({ initialBonus = 50 }: { initialBonus?: number }) {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(initialBonus);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/claim-daily-bonus')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setClaimedToday(data.claimedToday);
          setBonusAmount(data.bonusAmount || initialBonus);
        }
      })
      .catch(err => console.error('Failed to load daily bonus status', err))
      .finally(() => setLoading(false));
  }, [initialBonus]);

  const handleClaim = async () => {
    if (claimedToday) return;

    setClaiming(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/claim-daily-bonus', {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim daily bonus');
      }

      setMessage(data.message);
      if (data.claimed) {
        setClaimedToday(true);
        router.refresh();
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div 
      className="bg-surface" 
      style={{ 
        padding: '1.5rem', 
        borderRadius: '16px', 
        borderLeft: '4px solid #10b981', 
        background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(0,0,0,0.3))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.1)',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎁</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              Daily Login Bonus (₦{bonusAmount})
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {claimedToday 
              ? `You claimed your ₦${bonusAmount} daily bonus today! Return tomorrow for your next reward.`
              : `Earn ₦${bonusAmount} cash credited directly to your withdrawable task balance every day!`}
          </p>
        </div>

        <div>
          {claimedToday ? (
            <button 
              disabled 
              style={{ 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#10b981', 
                border: '1px solid #10b981', 
                padding: '0.65rem 1.25rem', 
                borderRadius: '50px', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                cursor: 'default'
              }}
            >
              Claimed Today ✓
            </button>
          ) : (
            <button 
              onClick={handleClaim} 
              disabled={loading || claiming}
              className="btn-primary" 
              style={{ 
                background: '#10b981', 
                color: '#fff', 
                padding: '0.65rem 1.5rem', 
                borderRadius: '50px', 
                fontSize: '0.85rem', 
                fontWeight: 'bold',
                border: 'none',
                cursor: (loading || claiming) ? 'not-allowed' : 'pointer',
                opacity: (loading || claiming) ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              {claiming ? 'Claiming...' : `Claim ₦${bonusAmount} Daily Bonus`}
            </button>
          )}
        </div>
      </div>

      {message && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: message.includes('Success') ? '#10b981' : 'var(--accent-gold)', fontWeight: 'bold', margin: '0.75rem 0 0 0' }}>
          {message}
        </p>
      )}
    </div>
  );
}
