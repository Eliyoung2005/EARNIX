'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/lib/CurrencyContext';

interface UserResult {
  id: string;
  username: string;
  email: string;
  name: string;
  plan: string;
  role: string;
  taskBalance?: number;
  affiliateBalance?: number;
  totalEarnings: number;
  referralCount: number;
  createdAt: string;
}

export default function UserSearch({ viewerRole }: { viewerRole?: string }) {
  const { fmt, symbol } = useCurrency();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserResult | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    email: '',
    taskBalance: 0,
    affiliateBalance: 0,
    planName: '',
    role: '',
    password: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  const isSuperAdmin = viewerRole === 'ADMIN' || viewerRole === 'SUPER_ADMIN';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    // Fetch active membership plans for dropdowns
    fetch('/api/admin/memberships')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlans(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
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
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle Instant Plan Change from Dropdown
  const handlePlanChange = async (userId: string, currentPlan: string, newPlan: string) => {
    if (currentPlan === newPlan) return;
    
    // Update local state immediately for instant feedback
    setResults(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    
    try {
      const res = await fetch('/api/admin/users/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPlan })
      });
      const data = await res.json();
      if (!res.ok) {
        // Revert on error
        setResults(prev => prev.map(u => u.id === userId ? { ...u, plan: currentPlan } : u));
        throw new Error(data.error);
      }
      showToast(`✓ Updated plan to ${newPlan} PLAN successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    }
  };

  // Handle Instant Role Change from Dropdown
  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    
    setResults(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      });
      const data = await res.json();
      if (!res.ok) {
        setResults(prev => prev.map(u => u.id === userId ? { ...u, role: currentRole } : u));
        throw new Error(data.error);
      }
      showToast(`✓ Changed role to ${newRole} successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  // Open Edit Modal
  const openEditModal = (user: UserResult) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      taskBalance: user.taskBalance || 0,
      affiliateBalance: user.affiliateBalance || 0,
      planName: user.plan || 'FREE',
      role: user.role || 'USER',
      password: ''
    });
  };

  // Submit Edit User Details
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);
    try {
      const res = await fetch('/api/admin/users/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          ...editFormData
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state with edited details
      setResults(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: editFormData.name,
        username: editFormData.username,
        email: editFormData.email,
        taskBalance: editFormData.taskBalance,
        affiliateBalance: editFormData.affiliateBalance,
        plan: editFormData.planName,
        role: editFormData.role
      } : u));

      showToast(`✓ User details for @${editFormData.username} updated!`);
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete User Account
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`DANGER: Are you sure you want to PERMANENTLY DELETE user @${username}? This action cannot be undone!`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResults(prev => prev.filter(u => u.id !== userId));
      showToast(`✓ Permanently deleted user @${username}`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', position: 'relative' }}>
      
      {/* Success Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--success)', color: '#000', padding: '1rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 9999, animation: 'fadeIn 0.3s ease' }}>
          {toastMessage}
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Search Database &amp; Manage Accounts
      </h2>
      
      <input 
        type="text" 
        placeholder="Search by name, contact, username, or gmail..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ 
          width: '100%', 
          maxWidth: '600px',
          padding: '1rem 1.25rem', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.2)', 
          background: 'rgba(0,0,0,0.4)', 
          color: 'white',
          fontSize: '1rem',
          marginBottom: '2rem',
          outline: 'none'
        }}
      />

      {loading && <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Searching user records...</div>}
      {error && <div style={{ color: '#ff3b30', marginBottom: '1rem' }}>{error}</div>}

      {!loading && query.trim() !== '' && results.length === 0 && (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>No users found matching "{query}".</div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {results.map(user => {
            const isPaid = user.plan !== 'FREE';
            return (
              <div key={user.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: `1px solid ${isPaid ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                
                {/* Header: Name, Username & Plan Dropdown */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, color: 'white' }}>{user.name}</h3>
                    <div style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 'bold' }}>@{user.username}</div>
                  </div>

                  {/* Plan Selector Dropdown */}
                  <select 
                    value={user.plan}
                    onChange={(e) => handlePlanChange(user.id, user.plan, e.target.value)}
                    style={{ 
                      padding: '0.35rem 0.75rem', 
                      background: isPaid ? 'var(--accent-gold)' : 'rgba(255,255,255,0.12)', 
                      color: isPaid ? '#000' : 'white', 
                      borderRadius: '50px', 
                      fontSize: '0.75rem', 
                      fontWeight: '900',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name} style={{ background: '#0a0f1d', color: p.price > 0 ? 'var(--accent-gold)' : 'white' }}>
                        {p.name} PLAN
                      </option>
                    ))}
                    {!plans.some(p => p.name === 'FREE') && <option value="FREE" style={{ background: '#0a0f1d', color: 'white' }}>FREE PLAN</option>}
                    {!plans.some(p => p.name === 'PRO') && <option value="PRO" style={{ background: '#0a0f1d', color: 'var(--accent-gold)' }}>PRO PLAN</option>}
                    {!plans.some(p => p.name === 'VIP') && <option value="VIP" style={{ background: '#0a0f1d', color: 'var(--accent-gold)' }}>VIP PLAN</option>}
                    {!plans.some(p => p.name === 'ELITE') && <option value="ELITE" style={{ background: '#0a0f1d', color: 'var(--accent-gold)' }}>ELITE PLAN</option>}
                  </select>
                </div>
                
                {/* Details */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Email:</strong> {user.email}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>Role:</strong> 
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                    style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    <option value="USER">USER</option>
                    <option value="VENDOR">VENDOR</option>
                    <option value="SUB_ADMIN">SUB_ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                  <div>Task Bal: <strong style={{ color: 'var(--accent-blue)' }}>{fmt(user.taskBalance || 0)}</strong></div>
                  <div>Affiliate Bal: <strong style={{ color: 'var(--success)' }}>{fmt(user.affiliateBalance || 0)}</strong></div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                  Joined: {new Date(user.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                {/* Super Admin Actions Bar */}
                {isSuperAdmin && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.85rem', display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button 
                      onClick={() => openEditModal(user)}
                      style={{ 
                        flex: 1,
                        padding: '0.5rem 0.75rem', 
                        background: 'rgba(10, 91, 255, 0.15)', 
                        color: 'var(--accent-blue)', 
                        border: '1px solid rgba(10, 91, 255, 0.4)', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit Details
                    </button>

                    <button 
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      style={{ 
                        padding: '0.5rem 0.75rem', 
                        background: 'rgba(255,59,48,0.15)', 
                        color: '#ff3b30', 
                        border: '1px solid rgba(255,59,48,0.4)', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#0d1527', border: '1px solid rgba(10,91,255,0.4)', borderRadius: '20px', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                Edit Account Details: <span style={{ color: 'var(--accent-gold)' }}>@{editingUser.username}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Username</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--accent-blue)', display: 'block', marginBottom: '0.3rem' }}>Task Balance ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.taskBalance}
                    onChange={(e) => setEditFormData({ ...editFormData, taskBalance: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(10,91,255,0.3)', color: 'white', fontWeight: 'bold' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--success)', display: 'block', marginBottom: '0.3rem' }}>Affiliate Balance ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.affiliateBalance}
                    onChange={(e) => setEditFormData({ ...editFormData, affiliateBalance: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(40,199,111,0.3)', color: 'white', fontWeight: 'bold' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.3rem' }}>Membership Plan</label>
                  <select
                    value={editFormData.planName}
                    onChange={(e) => setEditFormData({ ...editFormData, planName: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 'bold' }}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name} style={{ background: '#0a0f1d' }}>{p.name} PLAN</option>
                    ))}
                    {!plans.some(p => p.name === 'FREE') && <option value="FREE" style={{ background: '#0a0f1d' }}>FREE PLAN</option>}
                    {!plans.some(p => p.name === 'PRO') && <option value="PRO" style={{ background: '#0a0f1d' }}>PRO PLAN</option>}
                    {!plans.some(p => p.name === 'VIP') && <option value="VIP" style={{ background: '#0a0f1d' }}>VIP PLAN</option>}
                    {!plans.some(p => p.name === 'ELITE') && <option value="ELITE" style={{ background: '#0a0f1d' }}>ELITE PLAN</option>}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                  >
                    <option value="USER" style={{ background: '#0a0f1d' }}>USER</option>
                    <option value="VENDOR" style={{ background: '#0a0f1d' }}>VENDOR</option>
                    <option value="SUB_ADMIN" style={{ background: '#0a0f1d' }}>SUB_ADMIN</option>
                    <option value="SUPER_ADMIN" style={{ background: '#0a0f1d' }}>SUPER ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#ff3b30', display: 'block', marginBottom: '0.3rem' }}>
                  Reset Password (Leave blank to keep current password)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '50px', background: 'var(--accent-blue)', color: 'white', border: 'none', fontWeight: 'bold', cursor: editLoading ? 'not-allowed' : 'pointer', opacity: editLoading ? 0.7 : 1 }}
                >
                  {editLoading ? 'Saving...' : 'Save User Details'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
