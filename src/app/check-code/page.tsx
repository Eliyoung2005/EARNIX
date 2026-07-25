'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CheckCodePage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'VALID' | 'INVALID' | 'USED'>('IDLE');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus('LOADING');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      if (!res.ok) throw new Error('Network error');
      
      const data = await res.json();
      setStatus(data.status as 'VALID' | 'INVALID' | 'USED');
    } catch (error) {
      console.error(error);
      setStatus('INVALID');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Header */}
      <nav className="container" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(10, 91, 255, 0.5)' }}>EARNIX</Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="bg-surface" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2rem', borderRadius: '16px', textAlign: 'center' }}>
          
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Check Coupon Code</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Verify the authenticity and status of a PRO Activation Coupon before purchasing it from a Vendor.</p>

          <form onSubmit={handleValidate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <input 
              type="text" 
              placeholder="e.g. ERX-A7B2-C9X4" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '2px solid rgba(255,255,255,0.2)', 
                background: 'rgba(0,0,0,0.3)', 
                color: 'var(--accent-gold)', 
                fontSize: '1.25rem',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: 'bold'
              }}
              required
            />

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={status === 'LOADING'}
              style={{ padding: '1rem', fontSize: '1.1rem', opacity: status === 'LOADING' ? 0.7 : 1 }}
            >
              {status === 'LOADING' ? 'Verifying...' : 'Validate Code'}
            </button>
          </form>

          {/* Status Results */}
          <div style={{ marginTop: '2rem', minHeight: '80px' }}>
            
            {status === 'VALID' && (
              <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', color: 'var(--success)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Valid & Available!</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>This coupon code is authentic and ready to be used for a PRO Upgrade.</p>
              </div>
            )}

            {status === 'USED' && (
              <div style={{ padding: '1.5rem', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid var(--accent-gold)', borderRadius: '8px', color: 'var(--accent-gold)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Already Redeemed</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>This coupon is authentic but has already been used by another account.</p>
              </div>
            )}

            {status === 'INVALID' && (
              <div style={{ padding: '1.5rem', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid #ff3b30', borderRadius: '8px', color: '#ff3b30' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Invalid Code</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>This coupon code does not exist in our system. Please check for typos.</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}
