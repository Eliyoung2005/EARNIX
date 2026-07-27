'use client';

import { useState, useTransition } from 'react';
import { updateWelcomePopupSettings } from './actions';

export default function WelcomePopupSettingsForm({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    welcomePopupEnabled: settings.welcomePopupEnabled,
    welcomePopupTitleFree: settings.welcomePopupTitleFree,
    welcomePopupMessageFree: settings.welcomePopupMessageFree,
    welcomePopupTitlePro: settings.welcomePopupTitlePro,
    welcomePopupMessagePro: settings.welcomePopupMessagePro,
    welcomePopupLink: settings.welcomePopupLink || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: val,
      // Sync Pro fields so both are always identical
      ...(name === 'welcomePopupTitleFree' ? { welcomePopupTitlePro: val } : {}),
      ...(name === 'welcomePopupMessageFree' ? { welcomePopupMessagePro: val } : {}),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateWelcomePopupSettings(formData);
      if (result.success) {
        alert('Welcome popup settings saved successfully!');
      } else {
        alert('Error saving settings.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-blue)', margin: 0 }}>Registration Welcome Popup</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
          <input 
            type="checkbox" 
            name="welcomePopupEnabled"
            checked={formData.welcomePopupEnabled}
            onChange={handleChange}
            style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-blue)' }} 
          />
          Enable Welcome Popup
        </label>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        This popup is shown exactly once to newly registered users immediately after registration when they land on their dashboard, irrespective of which plan they selected.
      </p>
      
      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Message */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white' }}>Welcome Message (All Plans)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Title</label>
              <input 
                type="text" 
                name="welcomePopupTitleFree"
                value={formData.welcomePopupTitleFree}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Message</label>
              <textarea 
                name="welcomePopupMessageFree"
                value={formData.welcomePopupMessageFree}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px' }}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Clickable Link */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255, 200, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--accent-gold)' }}>Popup Action Link (Optional)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            When set, the popup button becomes a clickable link that directs users to this URL. Leave blank to keep the default dismiss behaviour.
          </p>
          <input 
            type="url"
            name="welcomePopupLink"
            value={formData.welcomePopupLink}
            onChange={handleChange}
            placeholder="https://example.com/promo  (leave blank to disable)"
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid rgba(255, 200, 0, 0.3)', 
              color: 'white',
              fontSize: '0.95rem'
            }} 
          />
          {formData.welcomePopupLink && (
            <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '0.5rem' }}>
              ✓ Button will link to: <strong>{formData.welcomePopupLink}</strong>
            </p>
          )}
        </div>

      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          type="submit" 
          disabled={isPending}
          className="btn-primary" 
          style={{ padding: '0.8rem 2rem', borderRadius: '50px', fontWeight: 'bold' }}
        >
          {isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
