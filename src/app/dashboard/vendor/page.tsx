'use client';

import { useState, useEffect } from 'react';

export default function VendorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAssigned: 0, soldCount: 0, availableCount: 0 });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');
  const [customGreeting, setCustomGreeting] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/vendor/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStats(data.stats || { totalAssigned: 0, soldCount: 0, availableCount: 0 });
          setCoupons(data.coupons || []);
          setCustomGreeting(data.vendor?.customGreeting || 'Hello! I would like to purchase an EARNIX PRO Activation Code.');
        }
      })
      .catch(err => console.error('Failed to load vendor dashboard', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveGreeting = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/vendor/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customGreeting }),
      });
      if (res.ok) {
        setMessage('Custom WhatsApp DM message saved successfully!');
      } else {
        setMessage('Failed to save message.');
      }
    } catch (err) {
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied activation code ${code} to clipboard!`);
  };

  const filteredCoupons = coupons.filter(c => {
    if (filter === 'AVAILABLE') return c.status === 'UNUSED';
    if (filter === 'SOLD') return c.status === 'USED';
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Vendor Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Manage your assigned Activation Codes and track your live sales performance.</p>

      {/* Vendor Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Assigned Codes</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalAssigned}</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--success)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Codes Sold (Redeemed)</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.soldCount}</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Available Codes to Sell</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{stats.availableCount}</div>
        </div>

      </div>

      {/* Vendor Profile Settings */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>Custom WhatsApp DM Message</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>This message will be pre-filled when users click your link from the Verified Code Vendors page to chat with you.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea 
            value={customGreeting}
            onChange={(e) => setCustomGreeting(e.target.value)}
            placeholder="Hello! I would like to purchase an EARNIX PRO Activation Code."
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px', fontSize: '1rem' }}
          />
          {message && (
            <p style={{ color: message.includes('success') ? 'var(--success)' : '#ff3b30', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {message}
            </p>
          )}
          <button 
            type="button" 
            onClick={handleSaveGreeting} 
            disabled={saving}
            className="btn-primary" 
            style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem', background: 'var(--accent-gold)', color: '#000', fontWeight: 'bold', border: 'none' }}
          >
            {saving ? 'Saving...' : 'Save Message'}
          </button>
        </div>
      </div>

      {/* Code Management */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Your Activation Codes</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setFilter('ALL')}
              className={filter === 'ALL' ? 'btn-primary' : 'btn-pro'} 
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: filter === 'ALL' ? 'var(--accent-gold)' : 'transparent', color: filter === 'ALL' ? '#000' : 'white', border: filter === 'ALL' ? 'none' : '1px solid rgba(255,255,255,0.2)' }}
            >
              All ({coupons.length})
            </button>
            <button 
              onClick={() => setFilter('AVAILABLE')}
              className={filter === 'AVAILABLE' ? 'btn-primary' : 'btn-pro'} 
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: filter === 'AVAILABLE' ? 'var(--accent-blue)' : 'transparent', color: 'white', border: filter === 'AVAILABLE' ? 'none' : '1px solid rgba(255,255,255,0.2)' }}
            >
              Available ({stats.availableCount})
            </button>
            <button 
              onClick={() => setFilter('SOLD')}
              className={filter === 'SOLD' ? 'btn-primary' : 'btn-pro'} 
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: filter === 'SOLD' ? 'var(--success)' : 'transparent', color: 'white', border: filter === 'SOLD' ? 'none' : '1px solid rgba(255,255,255,0.2)' }}
            >
              Sold ({stats.soldCount})
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>Loading activation codes...</p>
        ) : filteredCoupons.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No activation codes found matching this filter.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Coupon Code</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Value</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Action / Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map(coupon => (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: coupon.status === 'USED' ? 0.7 : 1 }}>
                    <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--accent-gold)', textDecoration: coupon.status === 'USED' ? 'line-through' : 'none' }}>
                      {coupon.code}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>
                      ₦{coupon.value || 4000}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {coupon.status === 'UNUSED' ? (
                        <span style={{ background: 'rgba(10, 91, 255, 0.2)', color: 'var(--accent-blue)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          AVAILABLE
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          SOLD (REDEEMED)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {coupon.status === 'UNUSED' ? (
                        <button 
                          onClick={() => copyToClipboard(coupon.code)}
                          className="btn-primary" 
                          style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                        >
                          Copy Code
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Used by @{coupon.redeemedBy?.username || 'user'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
