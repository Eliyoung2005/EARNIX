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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
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
        This popup will be shown exactly once to newly registered users immediately when they log into their dashboard for the first time. You can configure different messages for FREE and PRO users.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* FREE Plan Settings */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white' }}>FREE Plan Message</h3>
          
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

        {/* PRO Plan Settings */}
        <div style={{ padding: '1.5rem', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>PRO Plan Message</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Title</label>
              <input 
                type="text" 
                name="welcomePopupTitlePro"
                value={formData.welcomePopupTitlePro}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Message</label>
              <textarea 
                name="welcomePopupMessagePro"
                value={formData.welcomePopupMessagePro}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px' }}
              ></textarea>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
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
