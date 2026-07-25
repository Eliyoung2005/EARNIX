'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Coupon {
  id: string;
  code: string;
  status: string;
  createdAt: Date;
  assignedVendorId: string | null;
}

interface Vendor {
  id: string;
  username: string;
}

export default function CouponManager({ initialCoupons, vendors = [], userRole }: { initialCoupons: Coupon[], vendors?: Vendor[], userRole?: string }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(5);
  const [assignToId, setAssignToId] = useState('SELF');
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, assignToId })
      });
      
      if (!res.ok) throw new Error('Failed to generate coupons');

      alert(`Successfully generated ${amount} new coupons!`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (couponCode: string) => {
    const targetVendorId = selectedVendors[couponCode];
    if (!targetVendorId) {
      alert('Please select a vendor first.');
      return;
    }

    try {
      const res = await fetch('/api/admin/coupons/transfer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, targetVendorId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Transfer failed');
      }

      alert('Coupon transferred successfully!');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Coupon Code copied: ' + code);
  };

  const handleDelete = async (couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete coupon');
      }

      alert('Coupon deleted successfully!');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const myCoupons = initialCoupons.filter(c => c.assignedVendorId !== null);
  const poolCoupons = initialCoupons.filter(c => c.assignedVendorId === null);

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', gridColumn: '1 / -1' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Coupon Code Management</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="number" 
          min="1" 
          max="50" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))} 
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', width: '100px' }}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading} 
          className="btn-primary" 
          style={{ background: 'var(--accent-gold)', color: '#000', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Generating...' : `Generate ${amount} Coupons`}
        </button>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Assign Generated Codes To:
        </label>
        <select 
          value={assignToId} 
          onChange={(e) => setAssignToId(e.target.value)} 
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', maxWidth: '300px', appearance: 'none', cursor: 'pointer' }}
        >
          <option value="SELF">Myself (Super Admin)</option>
          <option value="UNASSIGNED">Leave Unassigned (Raw Codes)</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.username}</option>
          ))}
        </select>
      </div>

      {poolCoupons.length > 0 && vendors.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>Unassigned Pool (Raw Codes)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {poolCoupons.map((coupon) => (
              <div key={coupon.id} style={{ padding: '1rem', background: 'rgba(10, 91, 255, 0.1)', border: '1px solid rgba(10, 91, 255, 0.3)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-blue)', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  {coupon.code}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  <select 
                    value={selectedVendors[coupon.code] || ''} 
                    onChange={(e) => setSelectedVendors({ ...selectedVendors, [coupon.code]: e.target.value })}
                    style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="" disabled>Select Vendor to Assign</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.username}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => handleTransfer(coupon.code)}
                    style={{ background: 'var(--accent-blue)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                  >
                    Transfer Coupon
                  </button>
                  
                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(coupon.code)}
                      style={{ background: '#ff3b30', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', border: 'none', marginTop: '0.25rem' }}
                    >
                      Delete Code
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Your Assigned Coupons</h3>
        
        {myCoupons.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>You have no unused coupons available.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {myCoupons.map((coupon) => (
              <div 
                key={coupon.id} 
                style={{ padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', textAlign: 'center', position: 'relative' }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  {coupon.code}
                </div>
                
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  style={{ 
                    background: 'rgba(212, 175, 55, 0.2)', 
                    border: '1px solid var(--accent-gold)', 
                    color: 'var(--accent-gold)', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copy Code
                </button>

                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(coupon.code)}
                    style={{ 
                      background: 'rgba(255, 59, 48, 0.2)', 
                      border: '1px solid #ff3b30', 
                      color: '#ff3b30', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      width: '100%',
                      marginTop: '0.5rem'
                    }}
                  >
                    Delete Code
                  </button>
                )}

                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Generated: {new Date(coupon.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
