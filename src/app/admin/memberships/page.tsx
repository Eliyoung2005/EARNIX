'use client';
import { useState, useEffect } from 'react';
import { useCurrency } from '@/lib/CurrencyContext';

export default function MembershipsPage() {
  const { symbol, settings, taskLabel } = useCurrency();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/memberships?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const isUsd = settings?.affiliateCurrency === 'USD';
          const rate = settings?.usdExchangeRate || 1600;
          const mapped = data.map(p => {
            if (!isUsd) return p;
            return {
              ...p,
              price: parseFloat((p.price / rate).toFixed(2)),
              welcomeBonus: parseFloat((p.welcomeBonus / rate).toFixed(2)),
              dailyLoginBonus: parseFloat((p.dailyLoginBonus / rate).toFixed(2)),
              taskReward: parseFloat((p.taskReward / rate).toFixed(2)),
              referralCommission: parseFloat((p.referralCommission / rate).toFixed(2)),
              minTaskWithdrawal: parseFloat((p.minTaskWithdrawal / rate).toFixed(2)),
              minAffiliateWithdrawal: parseFloat((p.minAffiliateWithdrawal / rate).toFixed(2)),
            };
          });
          setPlans(mapped);
        } else {
          setPlans([]);
        }
        setLoading(false);
      });
  }, [settings]);

  const handleUpdate = async (plan: any) => {
    setUpdatingId(plan.id);
    const isUsd = settings?.affiliateCurrency === 'USD';
    const rate = settings?.usdExchangeRate || 1600;
    const planPayload = {
      ...plan,
      price: isUsd ? plan.price * rate : plan.price,
      welcomeBonus: isUsd ? plan.welcomeBonus * rate : plan.welcomeBonus,
      dailyLoginBonus: isUsd ? plan.dailyLoginBonus * rate : plan.dailyLoginBonus,
      taskReward: isUsd ? plan.taskReward * rate : plan.taskReward,
      referralCommission: isUsd ? plan.referralCommission * rate : plan.referralCommission,
      minTaskWithdrawal: isUsd ? plan.minTaskWithdrawal * rate : plan.minTaskWithdrawal,
      minAffiliateWithdrawal: isUsd ? plan.minAffiliateWithdrawal * rate : plan.minAffiliateWithdrawal,
    };

    try {
      const res = await fetch('/api/admin/memberships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planPayload)
      });
      if (!res.ok) throw new Error('Failed to update');
      alert('Plan updated successfully!');
      
      // Sync local state with fresh data from database
      const freshRes = await fetch(`/api/admin/memberships?t=${Date.now()}`, { cache: 'no-store' });
      const freshData = await freshRes.json();
      if (Array.isArray(freshData)) {
        const mapped = freshData.map(p => {
          if (!isUsd) return p;
          return {
            ...p,
            price: parseFloat((p.price / rate).toFixed(2)),
            welcomeBonus: parseFloat((p.welcomeBonus / rate).toFixed(2)),
            dailyLoginBonus: parseFloat((p.dailyLoginBonus / rate).toFixed(2)),
            taskReward: parseFloat((p.taskReward / rate).toFixed(2)),
            referralCommission: parseFloat((p.referralCommission / rate).toFixed(2)),
            minTaskWithdrawal: parseFloat((p.minTaskWithdrawal / rate).toFixed(2)),
            minAffiliateWithdrawal: parseFloat((p.minAffiliateWithdrawal / rate).toFixed(2)),
          };
        });
        setPlans(mapped);
      }
    } catch (err) {
      alert('Error updating plan');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChange = (id: string, field: string, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleActive = async (planId: string, newActiveState: boolean) => {
    const updatedPlan = plans.find(p => p.id === planId);
    if (!updatedPlan) return;

    const isUsd = settings?.affiliateCurrency === 'USD';
    const rate = settings?.usdExchangeRate || 1600;
    const planPayload = {
      ...updatedPlan,
      isActive: newActiveState,
      price: isUsd ? updatedPlan.price * rate : updatedPlan.price,
      welcomeBonus: isUsd ? updatedPlan.welcomeBonus * rate : updatedPlan.welcomeBonus,
      dailyLoginBonus: isUsd ? updatedPlan.dailyLoginBonus * rate : updatedPlan.dailyLoginBonus,
      taskReward: isUsd ? updatedPlan.taskReward * rate : updatedPlan.taskReward,
      referralCommission: isUsd ? updatedPlan.referralCommission * rate : updatedPlan.referralCommission,
      minTaskWithdrawal: isUsd ? updatedPlan.minTaskWithdrawal * rate : updatedPlan.minTaskWithdrawal,
      minAffiliateWithdrawal: isUsd ? updatedPlan.minAffiliateWithdrawal * rate : updatedPlan.minAffiliateWithdrawal,
    };

    setPlans(prev => prev.map(p => p.id === planId ? { ...p, isActive: newActiveState } : p));

    try {
      const res = await fetch('/api/admin/memberships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planPayload)
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (err) {
      alert('Failed to update plan status');
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading plans...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>Membership Plans</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enable or edit plans. Any enabled plan appears immediately on the landing page.</p>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {plans.map(plan => (
          <div key={plan.id} className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', border: `1px solid ${plan.isActive ? (plan.level > 1 ? 'var(--accent-gold)' : 'var(--success)') : 'rgba(255,255,255,0.1)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: plan.level > 1 ? 'var(--accent-gold)' : 'white' }}>{plan.name} PLAN</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={plan.isActive}
                  onChange={(e) => toggleActive(plan.id, e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--success)' }}
                />
                <span style={{ fontWeight: 'bold', color: plan.isActive ? 'var(--success)' : 'var(--text-secondary)' }}>
                  {plan.isActive ? 'Active' : 'Hidden'}
                </span>
              </label>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '35px' }}>{plan.description}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Activation Fee ({symbol})</label>
                <input type="number" value={plan.price} onChange={e => handleChange(plan.id, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Welcome Bonus ({symbol})</label>
                  <input type="number" value={plan.welcomeBonus} onChange={e => handleChange(plan.id, 'welcomeBonus', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Daily Login Bonus ({taskLabel})</label>
                  <input type="number" value={plan.dailyLoginBonus} onChange={e => handleChange(plan.id, 'dailyLoginBonus', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Task Reward ({symbol})</label>
                  <input type="number" value={plan.taskReward} onChange={e => handleChange(plan.id, 'taskReward', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Referral ({symbol})</label>
                  <input type="number" value={plan.referralCommission} onChange={e => handleChange(plan.id, 'referralCommission', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>Min Task Withdrawal ({symbol})</label>
                  <input type="number" value={plan.minTaskWithdrawal} onChange={e => handleChange(plan.id, 'minTaskWithdrawal', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>Min Affil Withdrawal ({symbol})</label>
                  <input type="number" value={plan.minAffiliateWithdrawal} onChange={e => handleChange(plan.id, 'minAffiliateWithdrawal', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
              </div>
              
              <button 
                onClick={() => handleUpdate(plan)} 
                disabled={updatingId === plan.id}
                className="btn-primary" 
                style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', background: plan.level > 1 ? 'var(--accent-gold)' : 'var(--accent-blue)', color: '#000', fontWeight: 'bold' }}
              >
                {updatingId === plan.id ? 'Saving...' : `Save ${plan.name} Settings`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
