'use client';

import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
      
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', background: 'var(--surface-color)', padding: '4rem 2rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Animated Icon */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', marginBottom: '2rem', animation: 'pulse 2s infinite' }}>
          <span style={{ fontSize: '4rem' }}>🛠️</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '1rem', letterSpacing: '-1px' }}>System Maintenance</h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
          We are currently upgrading our servers to serve you better. We're adding exciting new features and optimizing performance. Please check back in a few hours!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <a 
            href="https://t.me/earnix_official" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ padding: '1rem 2rem', background: 'var(--accent-blue)', color: 'white', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', transition: 'transform 0.2s', width: '100%', maxWidth: '300px' }}
          >
            Join Telegram for Updates
          </a>
          
          <Link href="/login" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Admin Login
          </Link>
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
