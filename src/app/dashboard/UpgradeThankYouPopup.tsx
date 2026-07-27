'use client';

import { useState } from 'react';
import { dismissUpgradeThankYou } from './actions';

export default function UpgradeThankYouPopup({ planName }: { planName: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  if (!isVisible) return null;

  const handleDismiss = async () => {
    setIsSaving(true);
    setIsVisible(false);
    try {
      await dismissUpgradeThankYou();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      padding: '1.5rem'
    }}>
      <div className="bg-surface" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '3rem 2rem',
        borderRadius: '24px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(212, 175, 55, 0.25)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        position: 'relative',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)'
      }}>
        <button
          onClick={handleDismiss}
          disabled={isSaving}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
          title="Dismiss"
        >
          ×
        </button>

        <div style={{
          width: '90px',
          height: '90px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.5)'
        }}>
          <span style={{ fontSize: '3rem' }}>👑</span>
        </div>

        <div style={{
          display: 'inline-block',
          padding: '0.4rem 1.2rem',
          background: 'rgba(212, 175, 55, 0.2)',
          color: 'var(--accent-gold)',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: '900',
          letterSpacing: '1px',
          marginBottom: '1rem',
          border: '1px solid rgba(212, 175, 55, 0.4)'
        }}>
          {planName.toUpperCase()} PLAN UNLOCKED
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', color: 'white' }}>
          Thank You For Upgrading!
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Congratulations! Your EARNIX membership has been successfully upgraded to the <strong style={{ color: 'var(--accent-gold)' }}>{planName}</strong> plan. You are now ready to maximize your daily income!
        </p>

        <div style={{
          textAlign: 'left',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '1.2rem 1.5rem',
          borderRadius: '16px',
          marginBottom: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
            <span>Higher Daily Task Payouts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
            <span>Priority Withdrawal Processing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
            <span>Access to Premium High-Reward Tasks</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '1.2rem',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
          }}
        >
          {isSaving ? 'Loading...' : 'Start Earning More Now'}
        </button>
      </div>
    </div>
  );
}
