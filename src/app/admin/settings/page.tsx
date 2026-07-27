'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import WithdrawalPortalControl from '../withdrawals/WithdrawalPortalControl';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleToggle = async (field: string, value: boolean) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update setting');
    }
  };

  const handleSaveText = async (field: string, value: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      alert('Saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Platform Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Manage rewards, fees, and system-wide configurations.</p>

      <WithdrawalPortalControl />

      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', border: '1px dashed var(--accent-blue)', textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>Membership Plans Moved</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You can now manage all active plans (FREE, PRO, VIP, ELITE) dynamically in the new Membership Management tab.</p>
        <Link href="/admin/memberships" className="btn-primary">
          Go to Membership Management
        </Link>
      </div>

      {/* Withdrawal Rules */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Withdrawal Rules</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <input type="checkbox" checked={settings?.requireUpgradeForWithdrawal ?? true} onChange={(e) => handleToggle('requireUpgradeForWithdrawal', e.target.checked)} style={{ accentColor: 'var(--accent-gold)', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--accent-gold)' }}>Require Upgrade For Second Withdrawal</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>If enabled, users can only withdraw ONCE per wallet (Affiliate & Task) on their current plan. Their second attempt will require upgrading to the next plan.</span>
            </div>
          </label>
        </form>
      </div>

      {/* Global Notifications / Messages */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Automated Messages</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={e => e.preventDefault()}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>One-Time Registration Welcome Message (Free)</label>
            <textarea 
              value={settings?.welcomePopupMessageFree || ''}
              onChange={(e) => setSettings({ ...settings, welcomePopupMessageFree: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '80px' }}
            ></textarea>
          </div>

          <button onClick={() => handleSaveText('welcomePopupMessageFree', settings.welcomePopupMessageFree)} disabled={saving} className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start' }}>{saving ? 'Saving...' : 'Save Message'}</button>
        </form>
      </div>

      {/* System Maintenance */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid #ff3b30' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ff3b30' }}>System Maintenance</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={e => e.preventDefault()}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={settings?.maintenanceMode || false} onChange={e => handleToggle('maintenanceMode', e.target.checked)} style={{ accentColor: '#ff3b30', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: '#ff3b30' }}>Enable Maintenance Mode</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Locks all regular users out of the site and displays the maintenance screen. Admins can still log in.</span>
            </div>
          </label>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Maintenance Message / Reason</label>
            <input type="text" value={settings?.maintenanceMessage || ''} onChange={e => setSettings({...settings, maintenanceMessage: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <button onClick={() => handleSaveText('maintenanceMessage', settings.maintenanceMessage)} disabled={saving} className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start', background: '#ff3b30', color: 'white' }}>Update Maintenance Settings</button>
        </form>
      </div>

    </div>
  );
}
