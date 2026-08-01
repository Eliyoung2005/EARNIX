'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare } from 'lucide-react';

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

      {/* Official Support Channels */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={20} /> Support Contacts &amp; Help Channels
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Configure official EARNIX customer support email and WhatsApp support contact link displayed across user dashboards, withdrawal pages, and public screens.
        </p>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={e => e.preventDefault()}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'white', marginBottom: '0.4rem' }}>
              Official Support Email Address
            </label>
            <input 
              type="email"
              value={settings?.supportEmail ?? 'Supportearnix@gmail.com'}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              placeholder="e.g. Supportearnix@gmail.com"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={16} style={{ color: '#25D366' }} /> WhatsApp Support Link / Phone Number
            </label>
            <input 
              type="text"
              value={settings?.whatsappSupport ?? ''}
              onChange={(e) => setSettings({ ...settings, whatsappSupport: e.target.value })}
              placeholder="e.g. https://wa.me/2348012345678 or 2348012345678"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
              Enter full WhatsApp link (e.g. https://wa.me/234...) or WhatsApp phone number with country code.
            </span>
          </div>

          <button 
            onClick={async () => {
              setSaving(true);
              try {
                await fetch('/api/admin/settings', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    supportEmail: settings?.supportEmail || 'Supportearnix@gmail.com',
                    whatsappSupport: settings?.whatsappSupport || ''
                  })
                });
                alert('Support contacts saved successfully!');
              } catch (err) {
                console.error(err);
                alert('Failed to save support contacts');
              } finally {
                setSaving(false);
              }
            }} 
            disabled={saving} 
            className="btn-primary" 
            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start', background: '#10b981', color: 'black' }}
          >
            {saving ? 'Saving...' : 'Save Support Channels'}
          </button>
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
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 'bold' }}>
              Maintenance Statement / Announcement for Users
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Write your custom statement below. This message will be displayed directly to public users on the maintenance screen when Maintenance Mode is active.
            </p>
            <textarea 
              rows={4}
              value={settings?.maintenanceMessage || ''} 
              onChange={e => setSettings({...settings, maintenanceMessage: e.target.value})} 
              placeholder="e.g. We are currently carrying out scheduled system maintenance and server upgrades. All user funds are 100% safe. Please check back in a few hours!"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }} 
            />
          </div>

          <button onClick={() => handleSaveText('maintenanceMessage', settings.maintenanceMessage)} disabled={saving} className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start', background: '#ff3b30', color: 'white' }}>Update Maintenance Settings</button>
        </form>
      </div>

    </div>
  );
}
