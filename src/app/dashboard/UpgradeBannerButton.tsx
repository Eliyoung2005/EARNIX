'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UpgradeBannerButton({ nextPlanName, price }: { nextPlanName: string; price: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setError('Please enter your activation coupon code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim(), targetPlanName: nextPlanName })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to upgrade plan.');
        setLoading(false);
        return;
      }

      // Reload page to display celebratory Thank You popup
      window.location.reload();
    } catch (err: any) {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
        style={{
          background: 'var(--accent-gold)',
          color: '#000',
          padding: '0.75rem 2rem',
          fontWeight: 'bold',
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Activate {nextPlanName} for ₦{price.toLocaleString()}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="bg-surface" style={{
            maxWidth: '460px',
            width: '100%',
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Upgrade to {nextPlanName}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
              Enter your verified <strong style={{ color: 'var(--accent-gold)' }}>{nextPlanName}</strong> Activation Coupon Code below to upgrade instantly.
            </p>

            {error && (
              <div style={{ padding: '0.8rem', background: 'rgba(255, 75, 75, 0.1)', border: '1px solid rgba(255, 75, 75, 0.3)', borderRadius: '8px', color: '#ff4b4b', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUpgrade}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Activation Coupon Code
                </label>
                <input
                  type="text"
                  placeholder={`Enter your ${nextPlanName} activation code`}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    fontSize: '1rem',
                    letterSpacing: '1px',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}
                  required
                />
                <div style={{ textAlign: 'center', marginTop: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <Link href="/vendors" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>
                    need coupon code?... click here
                  </Link>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                  <Link href="/validate-code" target="_blank" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                    verify code status
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    borderRadius: '50px',
                    background: 'var(--accent-gold)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  {loading ? 'Upgrading...' : 'Activate Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
