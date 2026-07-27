'use client';

import { useState, useEffect } from 'react';

export default function WithdrawalPortalControl() {
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Separate state for the schedule datetime inputs so we can save on blur/button
  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(res => res.json()),
      fetch('/api/admin/memberships').then(res => res.json())
    ])
      .then(([settingsData, plansData]) => {
        setSettings(settingsData);
        if (Array.isArray(plansData)) setPlans(plansData);

        // Pre-fill datetime inputs from saved scheduled dates
        if (settingsData?.scheduledFreeOpenDate) {
          setOpenDate(toLocalDatetimeInput(settingsData.scheduledFreeOpenDate));
        }
        if (settingsData?.scheduledFreeCloseDate) {
          setCloseDate(toLocalDatetimeInput(settingsData.scheduledFreeCloseDate));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load portal settings:', err);
        setLoading(false);
      });
  }, []);

  // Convert ISO string → "YYYY-MM-DDTHH:mm" for datetime-local input
  function toLocalDatetimeInput(iso: string) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const handleUpdateSettings = async (updatedFields: any) => {
    setSettings((prev: any) => ({ ...prev, ...updatedFields }));
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (err) {
      console.error(err);
      alert('Failed to update withdrawal portal settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!openDate || !closeDate) {
      alert('Please set both an Open date/time and a Close date/time.');
      return;
    }
    const openISO = new Date(openDate).toISOString();
    const closeISO = new Date(closeDate).toISOString();
    if (new Date(closeDate) <= new Date(openDate)) {
      alert('Close date/time must be after the Open date/time.');
      return;
    }
    await handleUpdateSettings({
      scheduledFreeOpenDate: openISO,
      scheduledFreeCloseDate: closeISO,
      scheduledProOpenDate: openISO,
      scheduledProCloseDate: closeISO,
      autoOpenSchedule: new Date(openDate).toLocaleString('en-NG', { weekday: 'long', hour: '2-digit', minute: '2-digit' }),
      autoCloseSchedule: new Date(closeDate).toLocaleString('en-NG', { weekday: 'long', hour: '2-digit', minute: '2-digit' }),
    });
    alert('Automatic schedule saved! The portal will open and close at those times.');
  };

  const handleUpdatePlan = async (planId: string, updatedFields: any) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updatedFields } : p));
    setSaving(true);
    try {
      const res = await fetch('/api/admin/memberships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: planId, ...updatedFields })
      });
      if (!res.ok) throw new Error('Failed to update membership plan');
    } catch (err) {
      console.error(err);
      alert('Failed to update plan settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Loading Portal Controls...</div>;

  const mode = settings?.withdrawalPortalMode || 'MANUAL';
  const isManualOpen = settings?.portalOpenManual ?? true;

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid rgba(10, 91, 255, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Withdrawal Portal &amp; Plan Control
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Configure whether withdrawals are open manually or automatically, and set rules for each plan.
          </p>
        </div>
        
        {/* Mode Selector */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '50px', padding: '0.3rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            type="button"
            onClick={() => handleUpdateSettings({ withdrawalPortalMode: 'MANUAL' })}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '50px', border: 'none', background: mode === 'MANUAL' ? 'var(--accent-blue)' : 'transparent', color: mode === 'MANUAL' ? '#fff' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Manual Mode
          </button>
          <button
            type="button"
            onClick={() => handleUpdateSettings({ withdrawalPortalMode: 'AUTOMATIC' })}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '50px', border: 'none', background: mode === 'AUTOMATIC' ? 'var(--accent-gold)' : 'transparent', color: mode === 'AUTOMATIC' ? '#000' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Automatic Mode
          </button>
        </div>
      </div>

      {/* ===== MANUAL MODE ===== */}
      {mode === 'MANUAL' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Master Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.25rem', background: isManualOpen ? 'rgba(40, 199, 111, 0.1)' : 'rgba(255, 59, 48, 0.1)', borderRadius: '12px', border: `1px solid ${isManualOpen ? 'var(--success)' : '#ff3b30'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
            <input 
              type="checkbox" 
              checked={isManualOpen} 
              onChange={(e) => handleUpdateSettings({ portalOpenManual: e.target.checked })} 
              style={{ width: '24px', height: '24px', accentColor: isManualOpen ? 'var(--success)' : '#ff3b30', cursor: 'pointer' }}
            />
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isManualOpen ? 'var(--success)' : '#ff3b30', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
                {isManualOpen ? 'Master Portal is OPEN' : 'Master Portal is CLOSED'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isManualOpen
                  ? 'Users are allowed to access the withdrawal form unless their specific plan is disabled below.'
                  : 'All user withdrawal requests are blocked immediately across the platform.'}
              </span>
            </div>
          </label>

          {/* Individual Plan Toggles */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Individual Plan Withdrawal Control &amp; Limits
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {plans.map((plan) => {
                const isOpen = plan.withdrawalPortalOpen ?? true;
                return (
                  <div key={plan.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${isOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,59,48,0.3)'}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={isOpen} 
                        onChange={(e) => handleUpdatePlan(plan.id, { withdrawalPortalOpen: e.target.checked })} 
                        style={{ width: '20px', height: '20px', accentColor: isOpen ? 'var(--accent-gold)' : '#ff3b30', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontWeight: 'bold', color: isOpen ? 'var(--accent-gold)' : '#ff3b30', display: 'block', fontSize: '1.05rem' }}>
                          {plan.name} Plan
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {isOpen ? 'Allowed to withdraw' : 'Blocked from withdrawing'}
                        </span>
                      </div>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Min Affiliate (₦)</label>
                        <input 
                          type="number"
                          value={plan.minAffiliateWithdrawal ?? 1000}
                          onChange={(e) => { const val = parseFloat(e.target.value); setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, minAffiliateWithdrawal: isNaN(val) ? 0 : val } : p)); }}
                          onBlur={(e) => handleUpdatePlan(plan.id, { minAffiliateWithdrawal: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Min Task (₦)</label>
                        <input 
                          type="number"
                          value={plan.minTaskWithdrawal ?? 3500}
                          onChange={(e) => { const val = parseFloat(e.target.value); setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, minTaskWithdrawal: isNaN(val) ? 0 : val } : p)); }}
                          onBlur={(e) => handleUpdatePlan(plan.id, { minTaskWithdrawal: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      ) : (
        /* ===== AUTOMATIC MODE ===== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Automatic Schedule — Set Open &amp; Close Date/Time
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              The withdrawal portal will automatically open at the <strong style={{ color: 'var(--success)' }}>Open</strong> time and close at the <strong style={{ color: '#ff3b30' }}>Close</strong> time. Users will be shown the schedule on their dashboard.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              
              {/* Open datetime */}
              <div style={{ background: 'rgba(40,199,111,0.05)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(40,199,111,0.25)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.75rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Portal Opens On
                </label>
                <input 
                  type="datetime-local"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(40,199,111,0.4)', color: 'white', fontSize: '0.95rem', colorScheme: 'dark' }}
                />
                {openDate && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.4rem' }}>
                    ✓ {new Date(openDate).toLocaleString('en-NG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {/* Close datetime */}
              <div style={{ background: 'rgba(255,59,48,0.05)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,59,48,0.25)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#ff3b30', marginBottom: '0.75rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Portal Closes On
                </label>
                <input 
                  type="datetime-local"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,59,48,0.4)', color: 'white', fontSize: '0.95rem', colorScheme: 'dark' }}
                />
                {closeDate && (
                  <p style={{ fontSize: '0.8rem', color: '#ff3b30', marginTop: '0.4rem' }}>
                    ✓ {new Date(closeDate).toLocaleString('en-NG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            {/* Current saved schedule */}
            {(settings?.scheduledFreeOpenDate || settings?.scheduledFreeCloseDate) && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'white' }}>Currently Saved:</strong>{' '}
                Opens {settings.scheduledFreeOpenDate ? new Date(settings.scheduledFreeOpenDate).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                {' '}→ Closes {settings.scheduledFreeCloseDate ? new Date(settings.scheduledFreeCloseDate).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={saving || !openDate || !closeDate}
              style={{ marginTop: '1.25rem', padding: '0.85rem 2rem', borderRadius: '50px', border: 'none', background: 'var(--accent-gold)', color: '#000', fontWeight: 'bold', fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {saving ? 'Saving Schedule...' : 'Save Automatic Schedule'}
            </button>
          </div>

          {/* Plan limits still visible in auto mode */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
              Plan Withdrawal Limits (apply in both modes)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {plans.map((plan) => (
                <div key={plan.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem' }}>{plan.name} Plan</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Min Affiliate (₦)</label>
                      <input type="number" value={plan.minAffiliateWithdrawal ?? 1000}
                        onChange={(e) => { const val = parseFloat(e.target.value); setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, minAffiliateWithdrawal: isNaN(val) ? 0 : val } : p)); }}
                        onBlur={(e) => handleUpdatePlan(plan.id, { minAffiliateWithdrawal: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Min Task (₦)</label>
                      <input type="number" value={plan.minTaskWithdrawal ?? 3500}
                        onChange={(e) => { const val = parseFloat(e.target.value); setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, minTaskWithdrawal: isNaN(val) ? 0 : val } : p)); }}
                        onBlur={(e) => handleUpdatePlan(plan.id, { minTaskWithdrawal: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {saving && <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '1rem', textAlign: 'right' }}>Saving changes...</div>}
    </div>
  );
}
