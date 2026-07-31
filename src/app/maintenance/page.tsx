'use client';

import { useState, useEffect } from 'react';

export default function MaintenancePage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/maintenance')
      .then(res => res.json())
      .then(data => {
        if (data?.maintenanceMessage) {
          setMessage(data.maintenanceMessage);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
      
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', background: 'var(--surface-color)', padding: '4rem 2rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Animated Icon */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '2rem', animation: 'pulse 2s infinite' }}>
          <span style={{ fontSize: '4rem' }}>🛠️</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '1rem', letterSpacing: '-1px' }}>
          System Maintenance & Upgrade
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          We are currently carrying out scheduled system maintenance and platform upgrades to enhance your experience, improve security, and roll out exciting new features.
        </p>

        {message && (
          <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
            <strong>Update Note:</strong> {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <a 
            href="https://t.me/earnix_official" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ padding: '1rem 2rem', background: 'var(--accent-blue)', color: 'white', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', transition: 'transform 0.2s', width: '100%', maxWidth: '300px' }}
          >
            Join Telegram for Updates
          </a>
        </div>

      </div>

      {/* Basic Keyframes for Pulse Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
      `}} />

    </div>
  );
}
