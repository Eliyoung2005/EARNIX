'use client';
import { useState, useEffect } from 'react';

export default function MembershipsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/memberships')
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (plan: any) => {
    setUpdatingId(plan.id);
    try {
      const res = await fetch('/api/admin/memberships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (!res.ok) throw new Error('Failed to update');
      alert('Plan updated successfully!');
    } catch (err) {
      alert('Error updating plan');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChange = (id: string, field: string, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading plans...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>Membership Plans</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enable or edit plans. Any disabled plans will be hidden from users.</p>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {plans.map(plan => (
          <div key={plan.id} className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', border: `1px solid ${plan.isActive ? (plan.level > 1 ? 'var(--accent-gold)' : 'var(--success)') : 'rgba(255,255,255,0.1)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: plan.level > 1 ? 'var(--accent-gold)' : 'white' }}>{plan.name} PLAN</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={plan.isActive}
                  onChange={(e) => handleChange(plan.id, 'isActive', e.target.checked)}
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
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Activation Fee (₦)</label>
                <input type="number" value={plan.price} onChange={e => handleChange(plan.id, 'price', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Welcome Bonus (₦)</label>
                  <input type="number" value={plan.welcomeBonus} onChange={e => handleChange(plan.id, 'welcomeBonus', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Daily Login (₦)</label>
                  <input type="number" value={plan.dailyLoginBonus} onChange={e => handleChange(plan.id, 'dailyLoginBonus', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Task Reward (₦)</label>
                  <input type="number" value={plan.taskReward} onChange={e => handleChange(plan.id, 'taskReward', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 'bold' }}>Referral (₦)</label>
                  <input type="number" value={plan.referralCommission} onChange={e => handleChange(plan.id, 'referralCommission', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
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
