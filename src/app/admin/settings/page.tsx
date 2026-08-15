'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Send } from 'lucide-react';

import WithdrawalPortalControl from '../withdrawals/WithdrawalPortalControl';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [rateSource, setRateSource] = useState<string | null>(null);
  const [rateTimestamp, setRateTimestamp] = useState<string | null>(null);

  const fetchLiveRate = async () => {
    setFetchingRate(true);
    try {
      const res = await fetch('/api/settings/exchange-rate');
      const data = await res.json();
      if (data.rate) {
        setSettings((prev: any) => ({ ...prev, usdExchangeRate: Math.round(data.rate * 100) / 100 }));
        setRateSource(data.source);
        setRateTimestamp(new Date(data.timestamp).toLocaleString());
      } else {
        alert('Could not fetch live rate. Please enter manually.');
      }
    } catch {
      alert('Network error fetching live rate.');
    } finally {
      setFetchingRate(false);
    }
  };

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

      {/* Daily Login Bonus */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎁 Daily Login Bonus
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Set the default daily login bonus awarded to users. This applies to users on plans where no per-plan bonus is configured.
          Per-plan bonuses can be set in <a href="/admin/memberships" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Membership Plans</a>.
          The unit (ERX pts or ₦) is determined by the Task Earnings Mode below.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'white', marginBottom: '0.4rem' }}>
              Default Daily Login Bonus (ERX / ₦)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={settings?.defaultDailyLoginBonus ?? 50}
              onChange={(e) => setSettings((prev: any) => ({ ...prev, defaultDailyLoginBonus: parseFloat(e.target.value) || 0 }))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'white', fontSize: '1rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
              This value is used when a user's plan has no daily bonus set (e.g. FREE plan).
            </span>
          </div>

          <button
            onClick={async () => {
              setSaving(true);
              try {
                await fetch('/api/admin/settings', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ defaultDailyLoginBonus: settings?.defaultDailyLoginBonus ?? 50 })
                });
                alert('Daily login bonus updated! Users will see the new amount immediately.');
              } catch {
                alert('Failed to save.');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            style={{
              padding: '0.75rem 1.75rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            {saving ? 'Saving...' : 'Save Default Bonus'}
          </button>
        </div>
      </div>

      {/* Withdrawal Rules */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Withdrawal Rules</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <input type="checkbox" checked={settings?.blockFreeWithdrawal ?? true} onChange={(e) => handleToggle('blockFreeWithdrawal', e.target.checked)} style={{ accentColor: 'var(--accent-gold)', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--accent-gold)' }}>Block Free Members From Withdrawing</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>If enabled, FREE plan users will be blocked from initiating any withdrawals and will be prompted to upgrade to PRO.</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <input type="checkbox" checked={settings?.requireUpgradeForWithdrawal ?? true} onChange={(e) => handleToggle('requireUpgradeForWithdrawal', e.target.checked)} style={{ accentColor: 'var(--accent-gold)', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--accent-gold)' }}>Require Upgrade For Second Withdrawal</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>If enabled, users can only withdraw ONCE per wallet (Affiliate & Task) on their current plan. Their second attempt will require upgrading to the next plan.</span>
            </div>
          </label>
        </form>
      </div>

      {/* VTU Data & Airtime Controls */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>VTU &amp; Data Buying Controls</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <input type="checkbox" checked={settings?.enableVtuData ?? true} onChange={(e) => handleToggle('enableVtuData', e.target.checked)} style={{ accentColor: 'var(--accent-gold)', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--accent-gold)' }}>Enable VTU Data &amp; Airtime Purchases</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>If disabled, users will not be able to purchase any VTU (Airtime or Data) and will see a notice that the VTU portal is currently closed.</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <input type="checkbox" checked={settings?.vtuDataButtonClaimable ?? true} onChange={(e) => handleToggle('vtuDataButtonClaimable', e.target.checked)} style={{ accentColor: 'var(--accent-gold)', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--accent-gold)' }}>Make VTU Purchase Button Claimable (Active)</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>If disabled, the purchase submit button in the VTU portal will be disabled and non-clickable (not claimable).</span>
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
          Configure official EARNIX customer support email, WhatsApp, and Telegram contact links displayed across user dashboards, withdrawal pages, and public screens.
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

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Send size={16} style={{ color: '#0088cc' }} /> Telegram Support Link / Username
            </label>
            <input 
              type="text"
              value={settings?.telegramSupport ?? ''}
              onChange={(e) => setSettings({ ...settings, telegramSupport: e.target.value })}
              placeholder="e.g. @EarnixSupport or https://t.me/EarnixSupport"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
              Enter a Telegram @username or full t.me link. Leave blank to hide this button.
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
                    whatsappSupport: settings?.whatsappSupport || '',
                    telegramSupport: settings?.telegramSupport || ''
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

          <button onClick={() => handleSaveText('welcomePopupMessageFree', settings.welcomePopupMessageFree)} disabled={saving} className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>{saving ? 'Saving...' : 'Save Message (Free)'}</button>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>One-Time Plan Upgrade Welcome Message (Pro)</label>
            <textarea 
              value={settings?.welcomePopupMessagePro || ''}
              onChange={(e) => setSettings({ ...settings, welcomePopupMessagePro: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '80px' }}
            ></textarea>
          </div>

          <button onClick={() => handleSaveText('welcomePopupMessagePro', settings.welcomePopupMessagePro)} disabled={saving} className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>{saving ? 'Saving...' : 'Save Message (Pro)'}</button>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Welcome Popup Action / Redirect Link (Optional)</label>
            <input 
              type="text" 
              value={settings?.welcomePopupLink || ''}
              onChange={(e) => setSettings({ ...settings, welcomePopupLink: e.target.value })}
              placeholder="e.g. https://t.me/your_official_channel"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
              Add a URL to display a &quot;Join / Claim Now&quot; button inside the Welcome Popup redirecting users there.
            </span>
          </div>

          <button onClick={() => handleSaveText('welcomePopupLink', settings.welcomePopupLink)} disabled={saving} className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start' }}>{saving ? 'Saving...' : 'Save Link'}</button>
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

      {/* Currency & Earnings Mode */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           Currency & Earnings Mode
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Switch the platform display currency and task earnings format. When switching to USD, all Naira values will be automatically converted using the exchange rate below.
        </p>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={e => e.preventDefault()}>
          {/* Affiliate Currency */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem' }}>
                Affiliate Currency
              </label>
              <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, affiliateCurrency: 'NGN' })}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: settings?.affiliateCurrency === 'NGN' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(0,0,0,0.25)',
                    color: settings?.affiliateCurrency === 'NGN' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                    border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ₦ Naira (NGN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettings({ ...settings, affiliateCurrency: 'USD' });
                    fetchLiveRate();
                  }}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: settings?.affiliateCurrency === 'USD' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(0,0,0,0.25)',
                    color: settings?.affiliateCurrency === 'USD' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                    border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  $ Dollar (USD)
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem' }}>
                USD Exchange Rate (1 USD = ? NGN)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={settings?.usdExchangeRate ?? 1600}
                onChange={(e) => setSettings({ ...settings, usdExchangeRate: parseFloat(e.target.value) || 1600 })}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'white', fontSize: '0.95rem'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={fetchLiveRate}
                  disabled={fetchingRate}
                  style={{
                    padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 'bold',
                    background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: '#a855f7', cursor: fetchingRate ? 'wait' : 'pointer', transition: 'all 0.2s',
                    opacity: fetchingRate ? 0.6 : 1
                  }}
                >
                  {fetchingRate ? '⏳ Fetching...' : ' Fetch Live Rate'}
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
                Current: ₦1 = ${(1 / (settings?.usdExchangeRate || 1600)).toFixed(6)} USD
                {rateSource && <> · Source: <strong style={{ color: '#a855f7' }}>{rateSource}</strong></>}
                {rateTimestamp && <> · Updated: {rateTimestamp}</>}
              </span>
            </div>
          </div>

          {/* Task Earnings Mode */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem' }}>
                Task Earnings Mode
              </label>
              <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, taskEarningsMode: 'CASH' })}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: settings?.taskEarningsMode === 'CASH' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(0,0,0,0.25)',
                    color: settings?.taskEarningsMode === 'CASH' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                    border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                   Cash
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, taskEarningsMode: 'POINTS' })}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: settings?.taskEarningsMode === 'POINTS' ? 'rgba(168, 85, 247, 0.35)' : 'rgba(0,0,0,0.25)',
                    color: settings?.taskEarningsMode === 'POINTS' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                    border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⭐ ERX
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem' }}>
                ERX Conversion Rate (1 NGN = ? ERX)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={settings?.pointsConversionRate ?? 1}
                onChange={(e) => setSettings({ ...settings, pointsConversionRate: parseFloat(e.target.value) || 1 })}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'white', fontSize: '0.95rem'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
                Example: If rate is 2, then ₦500 task reward = 1,000 ERX
              </span>
            </div>
          </div>

          {/* Elite MLM Downstream Referral Commission Percentages */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem' }}>
                Elite Level 2 Referral Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings?.eliteTier2CommissionPercent ?? 5.0}
                onChange={(e) => setSettings({ ...settings, eliteTier2CommissionPercent: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'white', fontSize: '0.95rem'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
                Percentage of package price earned when Level 1 referrals refer others (Level 2).
              </span>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem' }}>
                Elite Level 3 Referral Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings?.eliteTier3CommissionPercent ?? 2.0}
                onChange={(e) => setSettings({ ...settings, eliteTier3CommissionPercent: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'white', fontSize: '0.95rem'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'block' }}>
                Percentage of package price earned when Level 2 referrals refer others (Level 3).
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              setSaving(true);
              try {
                await fetch('/api/admin/settings', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    affiliateCurrency: settings?.affiliateCurrency || 'NGN',
                    usdExchangeRate: settings?.usdExchangeRate || 1600,
                    taskEarningsMode: settings?.taskEarningsMode || 'CASH',
                    pointsConversionRate: settings?.pointsConversionRate || 1,
                    eliteTier2CommissionPercent: settings?.eliteTier2CommissionPercent !== undefined ? Number(settings.eliteTier2CommissionPercent) : 5.0,
                    eliteTier3CommissionPercent: settings?.eliteTier3CommissionPercent !== undefined ? Number(settings.eliteTier3CommissionPercent) : 2.0,
                  })
                });
                alert('Currency, earnings & elite MLM referral settings saved!');
              } catch (err) {
                console.error(err);
                alert('Failed to save settings');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="btn-primary"
            style={{ padding: '0.85rem 1.5rem', borderRadius: '10px', fontWeight: 'bold', alignSelf: 'flex-start', background: '#a855f7', color: 'white', fontSize: '0.95rem' }}
          >
            {saving ? 'Saving...' : ' Save Settings'}
          </button>
        </form>
      </div>

    </div>
  );
}
