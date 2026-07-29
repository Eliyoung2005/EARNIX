'use client';

import { useState, useEffect } from 'react';

export default function WithdrawalPortalControl() {
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Datetime input states for Affiliate and Task schedules
  const [affiliateOpenDate, setAffiliateOpenDate] = useState('');
  const [affiliateCloseDate, setAffiliateCloseDate] = useState('');
  const [taskOpenDate, setTaskOpenDate] = useState('');
  const [taskCloseDate, setTaskCloseDate] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(res => res.json()),
      fetch('/api/admin/memberships').then(res => res.json())
    ])
      .then(([settingsData, plansData]) => {
        setSettings(settingsData);
        if (Array.isArray(plansData)) setPlans(plansData);

        // Pre-fill datetime inputs from saved scheduled dates
        const affOpen = settingsData?.scheduledAffiliateOpenDate || settingsData?.scheduledFreeOpenDate;
        const affClose = settingsData?.scheduledAffiliateCloseDate || settingsData?.scheduledFreeCloseDate;
        const taskOpen = settingsData?.scheduledTaskOpenDate || settingsData?.scheduledFreeOpenDate;
        const taskClose = settingsData?.scheduledTaskCloseDate || settingsData?.scheduledFreeCloseDate;

        if (affOpen) setAffiliateOpenDate(toLocalDatetimeInput(affOpen));
        if (affClose) setAffiliateCloseDate(toLocalDatetimeInput(affClose));
        if (taskOpen) setTaskOpenDate(toLocalDatetimeInput(taskOpen));
        if (taskClose) setTaskCloseDate(toLocalDatetimeInput(taskClose));

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

  const handleSaveAffiliateSchedule = async () => {
    if (!affiliateOpenDate || !affiliateCloseDate) {
      alert('Please set both an Open date/time and a Close date/time for Affiliate withdrawals.');
      return;
    }
    if (new Date(affiliateCloseDate) <= new Date(affiliateOpenDate)) {
      alert('Close date/time must be after the Open date/time.');
      return;
    }
    const openISO = new Date(affiliateOpenDate).toISOString();
    const closeISO = new Date(affiliateCloseDate).toISOString();
    await handleUpdateSettings({
      scheduledAffiliateOpenDate: openISO,
      scheduledAffiliateCloseDate: closeISO,
    });
    alert('Affiliate withdrawal schedule saved successfully!');
  };

  const handleSaveTaskSchedule = async () => {
    if (!taskOpenDate || !taskCloseDate) {
      alert('Please set both an Open date/time and a Close date/time for Task withdrawals.');
      return;
    }
    if (new Date(taskCloseDate) <= new Date(taskOpenDate)) {
      alert('Close date/time must be after the Open date/time.');
      return;
    }
    const openISO = new Date(taskOpenDate).toISOString();
    const closeISO = new Date(taskCloseDate).toISOString();
    await handleUpdateSettings({
      scheduledTaskOpenDate: openISO,
      scheduledTaskCloseDate: closeISO,
    });
    alert('Task (Non-Affiliate) withdrawal schedule saved successfully!');
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
  const isAffiliateManualOpen = settings?.affiliatePortalOpenManual ?? true;
  const isTaskManualOpen = settings?.taskPortalOpenManual ?? true;

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid rgba(10, 91, 255, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Withdrawal Portal Control (Affiliate &amp; Task Separated)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Independent controls &amp; automatic schedules for <strong>Affiliate Earnings</strong> and <strong>Task Earnings</strong> per membership plan.
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
          
          {/* Master Toggles Grid (Affiliate vs Task) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Affiliate Master Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: isAffiliateManualOpen ? 'rgba(10, 91, 255, 0.1)' : 'rgba(255, 59, 48, 0.1)', borderRadius: '12px', border: `1px solid ${isAffiliateManualOpen ? 'var(--accent-blue)' : '#ff3b30'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
              <input 
                type="checkbox" 
                checked={isAffiliateManualOpen} 
                onChange={(e) => handleUpdateSettings({ affiliatePortalOpenManual: e.target.checked })} 
                style={{ width: '24px', height: '24px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
              />
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isAffiliateManualOpen ? 'var(--accent-blue)' : '#ff3b30', display: 'block' }}>
                  Affiliate Portal: {isAffiliateManualOpen ? 'OPEN' : 'CLOSED'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {isAffiliateManualOpen ? 'Affiliate withdrawals are accessible.' : 'All affiliate withdrawals are blocked.'}
                </span>
              </div>
            </label>

            {/* Task Master Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: isTaskManualOpen ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 59, 48, 0.1)', borderRadius: '12px', border: `1px solid ${isTaskManualOpen ? 'var(--accent-gold)' : '#ff3b30'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
              <input 
                type="checkbox" 
                checked={isTaskManualOpen} 
                onChange={(e) => handleUpdateSettings({ taskPortalOpenManual: e.target.checked })} 
                style={{ width: '24px', height: '24px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
              />
              <div>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isTaskManualOpen ? 'var(--accent-gold)' : '#ff3b30', display: 'block' }}>
                  Task (Non-Affiliate) Portal: {isTaskManualOpen ? 'OPEN' : 'CLOSED'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {isTaskManualOpen ? 'Task earnings withdrawals are accessible.' : 'All task earnings withdrawals are blocked.'}
                </span>
              </div>
            </label>
          </div>

          {/* Individual Plan Toggles */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Per-Plan Withdrawal Controls &amp; Limits
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
              {plans.map((plan) => {
                const affOpen = plan.affiliateWithdrawalOpen ?? plan.withdrawalPortalOpen ?? true;
                const taskOpen = plan.taskWithdrawalOpen ?? plan.withdrawalPortalOpen ?? true;

                return (
                  <div key={plan.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                      {plan.name} Plan
                    </div>

                    {/* Affiliate toggle per plan */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', background: affOpen ? 'rgba(10,91,255,0.1)' : 'rgba(255,59,48,0.1)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={affOpen} 
                        onChange={(e) => handleUpdatePlan(plan.id, { affiliateWithdrawalOpen: e.target.checked })} 
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: affOpen ? 'var(--accent-blue)' : '#ff3b30' }}>
                        Affiliate: {affOpen ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </label>

                    {/* Task toggle per plan */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', background: taskOpen ? 'rgba(212,175,55,0.1)' : 'rgba(255,59,48,0.1)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={taskOpen} 
                        onChange={(e) => handleUpdatePlan(plan.id, { taskWithdrawalOpen: e.target.checked })} 
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: taskOpen ? 'var(--accent-gold)' : '#ff3b30' }}>
                        Task / Non-Affiliate: {taskOpen ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </label>

                    {/* Min limits */}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Affiliate Schedule Card */}
          <div style={{ background: 'rgba(10, 91, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(10, 91, 255, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Affiliate Withdrawal Schedule
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Set when Affiliate withdrawals automatically open and close.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-blue)', display: 'block', marginBottom: '0.5rem' }}>
                  Affiliate Opens On
                </label>
                <input 
                  type="datetime-local"
                  value={affiliateOpenDate}
                  onChange={(e) => setAffiliateOpenDate(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(10, 91, 255, 0.4)', color: 'white', colorScheme: 'dark' }}
                />
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ff3b30', display: 'block', marginBottom: '0.5rem' }}>
                  Affiliate Closes On
                </label>
                <input 
                  type="datetime-local"
                  value={affiliateCloseDate}
                  onChange={(e) => setAffiliateCloseDate(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,59,48,0.4)', color: 'white', colorScheme: 'dark' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAffiliateSchedule}
              disabled={saving || !affiliateOpenDate || !affiliateCloseDate}
              className="btn-primary"
              style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
            >
              Save Affiliate Schedule
            </button>
          </div>

          {/* Task Schedule Card */}
          <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Task (Non-Affiliate) Withdrawal Schedule
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Set when Task &amp; Bonus earnings withdrawals automatically open and close.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem' }}>
                  Task Opens On
                </label>
                <input 
                  type="datetime-local"
                  value={taskOpenDate}
                  onChange={(e) => setTaskOpenDate(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212, 175, 55, 0.4)', color: 'white', colorScheme: 'dark' }}
                />
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ff3b30', display: 'block', marginBottom: '0.5rem' }}>
                  Task Closes On
                </label>
                <input 
                  type="datetime-local"
                  value={taskCloseDate}
                  onChange={(e) => setTaskCloseDate(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,59,48,0.4)', color: 'white', colorScheme: 'dark' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveTaskSchedule}
              disabled={saving || !taskOpenDate || !taskCloseDate}
              className="btn-pro"
              style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', fontSize: '0.85rem', background: 'var(--accent-gold)', color: '#000', border: 'none', fontWeight: 'bold' }}
            >
              Save Task Schedule
            </button>
          </div>

          {/* Plan Limits */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
              Plan Minimum Limits (Applies to all modes)
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
