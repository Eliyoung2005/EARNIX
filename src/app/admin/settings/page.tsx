'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSettings() {

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Platform Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Manage rewards, fees, and system-wide configurations.</p>

      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', border: '1px dashed var(--accent-blue)', textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>Membership Plans Moved</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You can now manage all active plans (FREE, PRO, VIP, ELITE) dynamically in the new Membership Management tab.</p>
        <Link href="/admin/memberships" className="btn-primary">
          Go to Membership Management
        </Link>
      </div>

      {/* Global Notifications / Messages */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Automated Messages</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>One-Time Registration Welcome Message</label>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>This message pops up exactly once when a user logs in for the very first time.</p>
            <textarea 
              defaultValue="Welcome to EARNIX! We are thrilled to have you onboard. Please ensure you join our official Telegram channel for updates and set up your withdrawal bank details in the Profile Settings."
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '120px' }}
            ></textarea>
          </div>

          <button type="button" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start' }}>Save Messages</button>
        </form>
      </div>

      {/* System Maintenance */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid #ff3b30' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ff3b30' }}>System Maintenance</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: '#ff3b30', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: '#ff3b30' }}>Enable Maintenance Mode</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Locks all regular users out of the site and displays the maintenance screen. Admins can still log in.</span>
            </div>
          </label>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Maintenance Message / Reason</label>
            <input type="text" defaultValue="We are currently upgrading our servers to serve you better. Please check back in a few hours." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <button type="button" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start', background: '#ff3b30', color: 'white' }}>Update Maintenance Settings</button>
        </form>
      </div>

    </div>
  );
}
