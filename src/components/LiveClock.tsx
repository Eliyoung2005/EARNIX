'use client';

import { useState, useEffect } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div style={{ minWidth: '150px' }}></div>; // Prevent Hydration error

  const dateStr = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem', 
      color: 'var(--accent-gold)', 
      fontSize: '0.85rem', 
      fontWeight: 'bold', 
      background: 'rgba(212, 175, 55, 0.1)', 
      padding: '0.4rem 1rem', 
      borderRadius: '50px', 
      border: '1px solid rgba(212, 175, 55, 0.3)' 
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {dateStr} &nbsp;•&nbsp; {timeStr}
    </div>
  );
}
