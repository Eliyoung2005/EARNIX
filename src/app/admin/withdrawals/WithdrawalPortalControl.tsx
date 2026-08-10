'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/lib/CurrencyContext';

export default function WithdrawalPortalControl() {
  const { symbol } = useCurrency();
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Per-plan schedule input states: { [planId]: { affOpen, affClose, taskOpen, taskClose } }
  const [scheduleInputs, setScheduleInputs] = useState<Record<string, { affOpen: string; affClose: string; taskOpen: string; taskClose: string }>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(res => res.json()),
      fetch('/api/admin/memberships').then(res => res.json())
    ])
      .then(([settingsData, plansData]) => {
        setSettings(settingsData);
        if (Array.isArray(plansData)) {
          setPlans(plansData);
          // Pre-fill per-plan schedule inputs
          const inputs: Record<string, any> = {};
          plansData.forEach((plan: any) => {
            inputs[plan.id] = {
              affOpen: plan.affiliateScheduledOpenDate ? toLocalDatetimeInput(plan.affiliateScheduledOpenDate) : '',
              affClose: plan.affiliateScheduledCloseDate ? toLocalDatetimeInput(plan.affiliateScheduledCloseDate) : '',
              taskOpen: plan.taskScheduledOpenDate ? toLocalDatetimeInput(plan.taskScheduledOpenDate) : '',
              taskClose: plan.taskScheduledCloseDate ? toLocalDatetimeInput(plan.taskScheduledCloseDate) : '',
            };
          });
          setScheduleInputs(inputs);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load portal settings:', err);
        setLoading(false);
      });
  }, []);

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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.detail || errData?.error || 'Failed to update');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to update withdrawal portal settings: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
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

  const handleSavePlanSchedule = async (planId: string, portalType: 'affiliate' | 'task') => {
    const inputs = scheduleInputs[planId];
    if (!inputs) return;

    const openVal = portalType === 'affiliate' ? inputs.affOpen : inputs.taskOpen;
    const closeVal = portalType === 'affiliate' ? inputs.affClose : inputs.taskClose;
    const label = portalType === 'affiliate' ? 'Affiliate' : 'Task';

    if (!openVal || !closeVal) {
      alert(`Please set both an Open date/time and a Close date/time for ${label} withdrawals.`);
      return;
    }
    if (new Date(closeVal) <= new Date(openVal)) {
      alert('Close date/time must be after the Open date/time.');
      return;
    }

    const openISO = new Date(openVal).toISOString();
    const closeISO = new Date(closeVal).toISOString();

    const fields = portalType === 'affiliate'
      ? { affiliateScheduledOpenDate: openISO, affiliateScheduledCloseDate: closeISO }
      : { taskScheduledOpenDate: openISO, taskScheduledCloseDate: closeISO };

    await handleUpdatePlan(planId, fields);
    alert(`${label} schedule saved for this plan!`);
  };

  if (loading) return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Loading Portal Controls...</div>;

  const isAffiliateManualOpen = settings?.affiliatePortalOpenManual ?? true;
  const isTaskManualOpen = settings?.taskPortalOpenManual ?? true;

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid rgba(10, 91, 255, 0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Withdrawal Portal Control
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Set each plan to <strong>Manual</strong> (toggle ON/OFF) or <strong>Automatic</strong> (scheduled open/close) independently for Affiliate and Task wallets.
        </p>
      </div>

      {/* Global Master Kill Switches */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: isAffiliateManualOpen ? 'rgba(10,91,255,0.1)' : 'rgba(255,59,48,0.1)', borderRadius: '12px', border: `1px solid ${isAffiliateManualOpen ? 'var(--accent-blue)' : '#ff3b30'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
          <input 
            type="checkbox" 
            checked={isAffiliateManualOpen} 
            onChange={(e) => handleUpdateSettings({ affiliatePortalOpenManual: e.target.checked })} 
            style={{ width: '22px', height: '22px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
          />
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isAffiliateManualOpen ? 'var(--accent-blue)' : '#ff3b30', display: 'block' }}>
              Affiliate Master: {isAffiliateManualOpen ? 'ON' : 'OFF'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {isAffiliateManualOpen ? 'Global kill switch is off. Per-plan rules apply.' : 'ALL affiliate withdrawals are blocked system-wide.'}
            </span>
          </div>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: isTaskManualOpen ? 'rgba(212,175,55,0.1)' : 'rgba(255,59,48,0.1)', borderRadius: '12px', border: `1px solid ${isTaskManualOpen ? 'var(--accent-gold)' : '#ff3b30'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
          <input 
            type="checkbox" 
            checked={isTaskManualOpen} 
            onChange={(e) => handleUpdateSettings({ taskPortalOpenManual: e.target.checked })} 
            style={{ width: '22px', height: '22px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
          />
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isTaskManualOpen ? 'var(--accent-gold)' : '#ff3b30', display: 'block' }}>
              Task Master: {isTaskManualOpen ? 'ON' : 'OFF'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {isTaskManualOpen ? 'Global kill switch is off. Per-plan rules apply.' : 'ALL task withdrawals are blocked system-wide.'}
            </span>
          </div>
        </label>
      </div>

      {/* Per-Plan Controls */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Per-Plan Withdrawal Controls
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {plans.map((plan) => {
          const affMode = plan.affiliatePortalMode || 'MANUAL';
          const taskMode = plan.taskPortalMode || 'MANUAL';
          const affOpen = plan.affiliateWithdrawalOpen ?? plan.withdrawalPortalOpen ?? true;
          const taskOpen = plan.taskWithdrawalOpen ?? plan.withdrawalPortalOpen ?? true;
          const inputs = scheduleInputs[plan.id] || { affOpen: '', affClose: '', taskOpen: '', taskClose: '' };

          return (
            <div key={plan.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
              {/* Plan Name */}
              <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {plan.name} Plan
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* ===== AFFILIATE PORTAL SECTION ===== */}
                <div style={{ padding: '1rem', background: 'rgba(10,91,255,0.05)', borderRadius: '10px', border: '1px solid rgba(10,91,255,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)', fontSize: '0.95rem' }}>Affiliate Portal</span>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '50px', padding: '0.2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdatePlan(plan.id, { affiliatePortalMode: 'MANUAL' })}
                        style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: 'none', background: affMode === 'MANUAL' ? 'var(--accent-blue)' : 'transparent', color: affMode === 'MANUAL' ? '#fff' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePlan(plan.id, { affiliatePortalMode: 'AUTOMATIC' })}
                        style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: 'none', background: affMode === 'AUTOMATIC' ? 'var(--accent-gold)' : 'transparent', color: affMode === 'AUTOMATIC' ? '#000' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  {affMode === 'MANUAL' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: affOpen ? 'rgba(10,91,255,0.1)' : 'rgba(255,59,48,0.1)', padding: '0.5rem 0.7rem', borderRadius: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={affOpen} 
                        onChange={(e) => handleUpdatePlan(plan.id, { affiliateWithdrawalOpen: e.target.checked })} 
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: affOpen ? 'var(--accent-blue)' : '#ff3b30' }}>
                        {affOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </label>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'block', marginBottom: '0.2rem', fontWeight: 'bold' }}>Opens On</label>
                        <input
                          type="datetime-local"
                          value={inputs.affOpen}
                          onChange={(e) => setScheduleInputs(prev => ({ ...prev, [plan.id]: { ...prev[plan.id], affOpen: e.target.value } }))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(10,91,255,0.4)', color: 'white', colorScheme: 'dark', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#ff3b30', display: 'block', marginBottom: '0.2rem', fontWeight: 'bold' }}>Closes On</label>
                        <input
                          type="datetime-local"
                          value={inputs.affClose}
                          onChange={(e) => setScheduleInputs(prev => ({ ...prev, [plan.id]: { ...prev[plan.id], affClose: e.target.value } }))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,59,48,0.4)', color: 'white', colorScheme: 'dark', fontSize: '0.8rem' }}
                        />
                      </div>
                      {inputs.affClose && inputs.affOpen && new Date(inputs.affClose) <= new Date(inputs.affOpen) && (
                        <p style={{ color: '#ff3b30', fontSize: '0.72rem', fontWeight: 'bold', margin: 0 }}>
                          <AlertTriangle size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />
                          Close must be after Open.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSavePlanSchedule(plan.id, 'affiliate')}
                        disabled={saving || !inputs.affOpen || !inputs.affClose || (!!inputs.affOpen && !!inputs.affClose && new Date(inputs.affClose) <= new Date(inputs.affOpen))}
                        className="btn-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', marginTop: '0.25rem' }}
                      >
                        Save Schedule
                      </button>
                    </div>
                  )}
                </div>

                {/* ===== TASK PORTAL SECTION ===== */}
                <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.05)', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '0.95rem' }}>Task Portal</span>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '50px', padding: '0.2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdatePlan(plan.id, { taskPortalMode: 'MANUAL' })}
                        style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: 'none', background: taskMode === 'MANUAL' ? 'var(--accent-gold)' : 'transparent', color: taskMode === 'MANUAL' ? '#000' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
                      >
                        Manual
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePlan(plan.id, { taskPortalMode: 'AUTOMATIC' })}
                        style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: 'none', background: taskMode === 'AUTOMATIC' ? 'var(--accent-gold)' : 'transparent', color: taskMode === 'AUTOMATIC' ? '#000' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  {taskMode === 'MANUAL' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: taskOpen ? 'rgba(212,175,55,0.1)' : 'rgba(255,59,48,0.1)', padding: '0.5rem 0.7rem', borderRadius: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={taskOpen} 
                        onChange={(e) => handleUpdatePlan(plan.id, { taskWithdrawalOpen: e.target.checked })} 
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: taskOpen ? 'var(--accent-gold)' : '#ff3b30' }}>
                        {taskOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </label>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.2rem', fontWeight: 'bold' }}>Opens On</label>
                        <input
                          type="datetime-local"
                          value={inputs.taskOpen}
                          onChange={(e) => setScheduleInputs(prev => ({ ...prev, [plan.id]: { ...prev[plan.id], taskOpen: e.target.value } }))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.4)', color: 'white', colorScheme: 'dark', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#ff3b30', display: 'block', marginBottom: '0.2rem', fontWeight: 'bold' }}>Closes On</label>
                        <input
                          type="datetime-local"
                          value={inputs.taskClose}
                          onChange={(e) => setScheduleInputs(prev => ({ ...prev, [plan.id]: { ...prev[plan.id], taskClose: e.target.value } }))}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,59,48,0.4)', color: 'white', colorScheme: 'dark', fontSize: '0.8rem' }}
                        />
                      </div>
                      {inputs.taskClose && inputs.taskOpen && new Date(inputs.taskClose) <= new Date(inputs.taskOpen) && (
                        <p style={{ color: '#ff3b30', fontSize: '0.72rem', fontWeight: 'bold', margin: 0 }}>
                          <AlertTriangle size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />
                          Close must be after Open.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSavePlanSchedule(plan.id, 'task')}
                        disabled={saving || !inputs.taskOpen || !inputs.taskClose || (!!inputs.taskOpen && !!inputs.taskClose && new Date(inputs.taskClose) <= new Date(inputs.taskOpen))}
                        className="btn-pro"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', marginTop: '0.25rem', background: 'var(--accent-gold)', color: '#000', border: 'none', fontWeight: 'bold' }}
                      >
                        Save Schedule
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Min limits row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Min Affiliate ({symbol})</label>
                  <input 
                    type="number"
                    value={plan.minAffiliateWithdrawal ?? 1000}
                    onChange={(e) => { const val = parseFloat(e.target.value); setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, minAffiliateWithdrawal: isNaN(val) ? 0 : val } : p)); }}
                    onBlur={(e) => handleUpdatePlan(plan.id, { minAffiliateWithdrawal: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Min Task ({symbol})</label>
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

      {saving && <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '1rem', textAlign: 'right' }}>Saving changes...</div>}
    </div>
  );
}
