'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/lib/CurrencyContext';

export default function DailyBonusCard({ initialBonus = 50 }: { initialBonus?: number }) {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [activeStreak, setActiveStreak] = useState(0);
  const [dayIndexInCycle, setDayIndexInCycle] = useState(1);
  const [baseBonus, setBaseBonus] = useState(initialBonus);
  const [taskEarningsMode, setTaskEarningsMode] = useState<string>('CASH');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { fmtTask, taskLabel } = useCurrency();

  useEffect(() => {
    fetch('/api/user/claim-daily-bonus')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setClaimedToday(data.claimedToday);
          setActiveStreak(data.activeStreak || 0);
          setDayIndexInCycle(data.dayIndexInCycle || 1);
          setBaseBonus(data.baseBonus ?? initialBonus);
          setTaskEarningsMode(data.taskEarningsMode || 'CASH');
        }
      })
      .catch(err => console.error('Failed to load daily bonus status', err))
      .finally(() => setLoading(false));
  }, [initialBonus]);

  const isPoints = taskEarningsMode === 'POINTS';

  // Format the bonus display — API already returns the display value (points or cash)
  const formatBonus = (amount: number) => {
    if (isPoints) return `${amount.toLocaleString()} ERX`;
    return fmtTask(amount);
  };

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
        setActiveStreak(data.newStreak || activeStreak + 1);
        if (data.dayIndexInCycle) setDayIndexInCycle(data.dayIndexInCycle);
        if (data.taskEarningsMode) setTaskEarningsMode(data.taskEarningsMode);
        router.refresh();
      }
    } catch (err: any) {
      setMessage(err.message || 'An error occurred.');
    } finally {
      setClaiming(false);
    }
  };

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div
      className="bg-surface"
      style={{
        padding: '1.75rem',
        borderRadius: '16px',
        borderLeft: '4px solid #10b981',
        background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(0,0,0,0.35))',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.12)',
        marginBottom: '2rem'
      }}
    >
      {/* Header & Streak Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              Daily Login Bonus
            </h3>
            <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.18)', color: '#10b981', padding: '0.2rem 0.75rem', borderRadius: '50px', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              {activeStreak} Day Streak
            </span>
            {isPoints && (
              <span style={{ fontSize: '0.72rem', background: 'rgba(212, 175, 55, 0.18)', color: 'var(--accent-gold)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 'bold', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                ERX POINTS
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
            {claimedToday
              ? `You claimed your Day ${dayIndexInCycle} bonus today! Return tomorrow to keep your streak going.`
              : `Claim your Day ${dayIndexInCycle} bonus of ${formatBonus(baseBonus)} today! Log in every day to grow your streak.`}
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
                padding: '0.65rem 1.35rem',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'default'
              }}
            >
              Claimed Today
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
              {claiming ? 'Claiming...' : `Claim Day ${dayIndexInCycle} — ${formatBonus(baseBonus)}`}
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Streak Calendar Grid */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.75rem' }}>
          7-Day Login Calendar Cycle
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '0.6rem' }}>
          {days.map((dayNum) => {
            const isCurrent = dayNum === dayIndexInCycle;
            const isCompleted = claimedToday
              ? dayNum <= dayIndexInCycle
              : dayNum < dayIndexInCycle;

            let bgColor = 'rgba(255,255,255,0.04)';
            let borderColor = 'rgba(255,255,255,0.1)';
            let textColor = 'var(--text-secondary)';

            if (isCompleted) {
              bgColor = 'rgba(16, 185, 129, 0.2)';
              borderColor = 'rgba(16, 185, 129, 0.5)';
              textColor = '#10b981';
            } else if (isCurrent) {
              bgColor = 'rgba(212, 175, 55, 0.15)';
              borderColor = 'var(--accent-gold)';
              textColor = 'var(--accent-gold)';
            }

            return (
              <div
                key={dayNum}
                style={{
                  background: bgColor,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: '12px',
                  padding: '0.6rem 0.4rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: textColor }}>
                  Day {dayNum}
                </span>

                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isCompleted ? '#10b981' : isCurrent ? 'var(--accent-gold)' : 'white' }}>
                  {isPoints ? `${baseBonus.toLocaleString()} ERX` : fmtTask(baseBonus)}
                </span>

                <span style={{ fontSize: '0.65rem', color: textColor, fontWeight: 'bold' }}>
                  {isCompleted ? 'Done' : isCurrent ? (claimedToday ? 'Done' : 'Today') : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {message && (
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: message.includes('credited') ? '#10b981' : 'var(--accent-gold)', fontWeight: 'bold', padding: '0.75rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
