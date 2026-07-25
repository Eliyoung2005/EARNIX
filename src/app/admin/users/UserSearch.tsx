'use client';

import { useState, useEffect } from 'react';

interface UserResult {
  id: string;
  username: string;
  email: string;
  name: string;
  plan: string;
  role: string;
  totalEarnings: number;
  referralCount: number;
  createdAt: string;
}

export default function UserSearch({ viewerRole }: { viewerRole?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    if (!confirm(`Are you sure you want to promote/demote this user to ${newRole}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      setResults(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (userId: string, currentPlan: string, newPlan: string) => {
    if (currentPlan === newPlan) return;
    if (!confirm(`Are you sure you want to upgrade/downgrade this user to ${newPlan}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      setResults(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter a new password for this user (min 6 characters):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (!confirm('Are you absolutely sure you want to forcibly reset their password?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch plans on mount for the dropdown
    if (viewerRole === 'ADMIN') {
      fetch('/api/admin/memberships').then(res => res.json()).then(data => setPlans(data)).catch(console.error);
    }
  }, [viewerRole]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setResults(data.users || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>Search Database</h2>
      
      <input 
        type="text" 
        placeholder="Search by name, contact, username, or gmail..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ 
          width: '100%', 
          maxWidth: '600px',
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid rgba(255,255,255,0.2)', 
          background: 'rgba(0,0,0,0.3)', 
          color: 'white',
          fontSize: '1rem',
          marginBottom: '2rem'
        }}
      />

      {loading && <div style={{ color: 'var(--text-secondary)' }}>Searching...</div>}
      {error && <div style={{ color: '#ff3b30' }}>{error}</div>}

      {!loading && query.trim() !== '' && results.length === 0 && (
        <div style={{ color: 'var(--text-secondary)' }}>No users found matching "{query}".</div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {results.map(user => (
            <div key={user.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{user.name}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>@{user.username}</div>
                </div>
                {viewerRole === 'ADMIN' ? (
                  <select 
                    value={user.plan}
                    onChange={(e) => handlePlanChange(user.id, user.plan, e.target.value)}
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: user.plan !== 'FREE' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', 
                      color: user.plan !== 'FREE' ? '#000' : 'white', 
                      borderRadius: '50px', 
                      fontSize: '0.7rem', 
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name} style={{ background: '#000', color: p.level > 1 ? 'var(--accent-gold)' : 'white' }}>
                        {p.name} PLAN
                      </option>
                    ))}
                  </select>
                ) : (
                  <span style={{ padding: '0.25rem 0.75rem', background: user.plan !== 'FREE' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', color: user.plan !== 'FREE' ? '#000' : 'white', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {user.plan} PLAN
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <strong>Email:</strong> {viewerRole === 'ADMIN' ? user.email : '*******@***.com'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Role:</strong> 
                {viewerRole === 'ADMIN' ? (
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    <option value="USER">USER</option>
                    <option value="VENDOR">VENDOR</option>
                    <option value="SUB_ADMIN">SUB_ADMIN</option>
                    <option value="ADMIN">SUPER ADMIN</option>
                  </select>
                ) : (
                  <span>{user.role}</span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <strong>Total Earnings:</strong> ₦{user.totalEarnings.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <strong>Total Referrals:</strong> {user.referralCount}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '1rem' }}>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </div>

              {viewerRole === 'ADMIN' && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleResetPassword(user.id)}
                    style={{ 
                      width: '100%', 
                      padding: '0.6rem', 
                      background: 'rgba(255,59,48,0.1)', 
                      color: '#ff3b30', 
                      border: '1px solid rgba(255,59,48,0.3)', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    Force Reset Password
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
