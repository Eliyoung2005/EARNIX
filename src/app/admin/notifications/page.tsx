'use client';

import { useState } from 'react';

export default function AdminNotifications() {
  const [history, setHistory] = useState([
    { id: 1, title: 'Welcome to EARNIX', message: 'The new platform is live! Upgrade to PRO to earn more.', type: 'Info', date: 'Just now' }
  ]);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Broadcast Pop Notifications</h1>

      <div className="grid-1-1">
        
        {/* Send Notification Form */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Send Global Popup</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notification Title</label>
              <input type="text" placeholder="e.g. Server Maintenance" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notification Type</label>
              <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="Info">Info (Blue)</option>
                <option value="Success">Success (Green)</option>
                <option value="Warning">Warning (Gold)</option>
                <option value="Danger">Alert (Red)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Target Audience</label>
              <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="ALL">All Users</option>
                <option value="FREE">FREE Plan Users Only</option>
                <option value="PRO">PRO Plan Users Only</option>
                <option value="SPECIFIC">Specific User (Enter Email)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Message Body</label>
              <textarea placeholder="Type the message that will pop up on user screens..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '120px' }}></textarea>
            </div>

            <button className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>Broadcast Popup to All Users</button>
          </div>
        </div>

        {/* Notification History */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Previous Broadcasts</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map(item => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>{item.title}</h3>
                  <span style={{ fontSize: '0.75rem', background: 'var(--accent-blue)', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{item.type}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.message}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Sent: {item.date}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
