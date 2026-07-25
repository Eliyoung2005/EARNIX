'use client';

import { useState, useTransition } from 'react';
import { updateAdSenseSettings } from './actions';

export default function AdSenseForm({ settings }: { settings: { adsenseEnabled: boolean, adsenseClientId: string | null } }) {
  const [enabled, setEnabled] = useState(settings?.adsenseEnabled || false);
  const [clientId, setClientId] = useState(settings?.adsenseClientId || '');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    startTransition(async () => {
      await updateAdSenseSettings({ adsenseEnabled: enabled, adsenseClientId: clientId });
      setMessage('Settings saved successfully!');
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {message && (
        <div style={{ padding: '0.8rem', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', borderRadius: '8px', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <input 
          type="checkbox" 
          checked={enabled} 
          onChange={(e) => setEnabled(e.target.checked)}
          style={{ accentColor: 'var(--success)', width: '20px', height: '20px' }} 
        />
        <span style={{ fontWeight: 'bold' }}>Enable Google AdSense Globally</span>
      </label>

      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AdSense Client ID (Publisher ID)</label>
        <input 
          type="text" 
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="e.g. ca-pub-XXXXXXXXXXXXXXXX" 
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
        />
      </div>

      <button type="submit" disabled={isPending} className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', opacity: isPending ? 0.7 : 1 }}>
        {isPending ? 'Saving...' : 'Save Configuration'}
      </button>
    </form>
  );
}
