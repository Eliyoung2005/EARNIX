'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Coupon {
  id: string;
  code: string;
  status: string;
  createdAt: Date;
  assignedVendorId: string | null;
  assignedVendor?: { id: string; username: string } | null;
}

interface UsedCoupon {
  id: string;
  code: string;
  status: string;
  redeemedDate?: Date | null;
  assignedVendor?: { id?: string; name?: string | null; username: string } | null;
  redeemedBy?: { name?: string | null; username: string; email: string } | null;
}

interface Vendor {
  id: string;
  username: string;
}

export default function CouponManager({ 
  initialCoupons, 
  usedCoupons = [], 
  vendors = [], 
  userRole 
}: { 
  initialCoupons: Coupon[], 
  usedCoupons?: UsedCoupon[], 
  vendors?: Vendor[], 
  userRole?: string 
}) {
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [amount, setAmount] = useState(5);
  const [assignToId, setAssignToId] = useState('SELF');
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({});
  
  // Batch transfer states
  const [batchVendorId, setBatchVendorId] = useState('');
  const [batchAmount, setBatchAmount] = useState(5);

  // Filter states
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [searchUsedQuery, setSearchUsedQuery] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, assignToId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate coupons');

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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      alert(data.message || 'Coupon assigned successfully!');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBatchTransfer = async () => {
    if (!batchVendorId) {
      alert('Please select a vendor for batch transfer.');
      return;
    }
    if (batchAmount < 1) {
      alert('Please enter a valid amount.');
      return;
    }

    setBatchLoading(true);
    try {
      const res = await fetch('/api/admin/coupons/transfer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: batchAmount, targetVendorId: batchVendorId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Batch transfer failed');
      }

      alert(data.message || `Successfully transferred ${batchAmount} codes!`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBatchLoading(false);
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

  const poolCoupons = initialCoupons.filter(c => c.assignedVendorId === null);

  const filteredUnusedCoupons = initialCoupons.filter(c => {
    if (vendorFilter === 'ALL') return true;
    if (vendorFilter === 'UNASSIGNED') return c.assignedVendorId === null;
    return c.assignedVendorId === vendorFilter;
  });

  const filteredUsedCoupons = usedCoupons.filter(c => {
    if (!searchUsedQuery.trim()) return true;
    const q = searchUsedQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.redeemedBy?.username?.toLowerCase().includes(q) ||
      c.redeemedBy?.email?.toLowerCase().includes(q) ||
      c.assignedVendor?.username?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', gridColumn: '1 / -1' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Coupon Code Generator &amp; Vendor Assignment</h2>
      
      {/* ── GENERATE COUPONS SECTION ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>Generate Fresh Coupons</h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quantity</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))} 
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', width: '110px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assign Directly To</label>
            <select 
              value={assignToId} 
              onChange={(e) => setAssignToId(e.target.value)} 
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', appearance: 'none', cursor: 'pointer' }}
            >
              <option value="SELF">Myself (Super Admin)</option>
              <option value="UNASSIGNED">Leave Unassigned (Raw Pool Codes)</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>Vendor: @{v.username}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading} 
            className="btn-primary" 
            style={{ background: 'var(--accent-gold)', color: '#000', opacity: loading ? 0.7 : 1, marginTop: 'auto', padding: '0.75rem 1.5rem', fontWeight: 'bold' }}
          >
            {loading ? 'Generating...' : `Generate ${amount} Fresh Code(s)`}
          </button>
        </div>
      </div>

      {/* ── BATCH ASSIGNMENT SECTION (POOL CODES) ── */}
      {poolCoupons.length > 0 && vendors.length > 0 && (
        <div style={{ background: 'rgba(10, 91, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2.5rem', border: '1px solid rgba(10, 91, 255, 0.2)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚡ Batch Assign Pool Codes to Vendor
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select a vendor and number of unassigned pool codes to allocate. When assigned, each code is automatically regenerated into a fresh unique code for that vendor.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Vendor</label>
              <select 
                value={batchVendorId} 
                onChange={(e) => setBatchVendorId(e.target.value)} 
                style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', color: 'white' }}
              >
                <option value="" disabled>Select Vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>@{v.username}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Amount (Max: {poolCoupons.length})</label>
              <input 
                type="number" 
                min="1" 
                max={poolCoupons.length} 
                value={batchAmount} 
                onChange={(e) => setBatchAmount(Number(e.target.value))} 
                style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', color: 'white', width: '100px' }}
              />
            </div>

            <button
              onClick={handleBatchTransfer}
              disabled={batchLoading}
              style={{ background: 'var(--accent-blue)', color: '#fff', padding: '0.65rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: batchLoading ? 'not-allowed' : 'pointer', border: 'none', marginTop: 'auto', opacity: batchLoading ? 0.7 : 1 }}
            >
              {batchLoading ? 'Assigning...' : `Assign ${batchAmount} Codes to Vendor`}
            </button>
          </div>
        </div>
      )}

      {/* ── UNASSIGNED POOL CODES LIST ── */}
      {poolCoupons.length > 0 && vendors.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>Unassigned Pool ({poolCoupons.length} Raw Codes)</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Assigning any code below to a vendor automatically converts it into a freshly generated code unique to that vendor.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {poolCoupons.map((coupon) => (
              <div key={coupon.id} style={{ padding: '1rem', background: 'rgba(10, 91, 255, 0.08)', border: '1px solid rgba(10, 91, 255, 0.25)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-blue)', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  {coupon.code}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <select 
                    value={selectedVendors[coupon.code] || ''} 
                    onChange={(e) => setSelectedVendors({ ...selectedVendors, [coupon.code]: e.target.value })}
                    style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' }}
                  >
                    <option value="" disabled>Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>@{v.username}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => handleTransfer(coupon.code)}
                    style={{ background: 'var(--accent-blue)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                  >
                    Assign &amp; Generate Fresh Code
                  </button>
                  
                  {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                    <button
                      onClick={() => handleDelete(coupon.code)}
                      style={{ background: '#ff3b30', color: '#fff', padding: '0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
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

      {/* ── ALL UNUSED ACTIVE COUPONS (WITH VENDOR FILTER) ── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-secondary)', margin: 0 }}>
              Active Unused Coupons ({filteredUnusedCoupons.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              All active codes currently allocated to vendors or admins.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter Vendor:</label>
            <select 
              value={vendorFilter} 
              onChange={(e) => setVendorFilter(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Active Coupons ({initialCoupons.length})</option>
              <option value="UNASSIGNED">Unassigned Pool Only ({poolCoupons.length})</option>
              {vendors.map(v => {
                const vendorCount = initialCoupons.filter(c => c.assignedVendorId === v.id).length;
                return (
                  <option key={v.id} value={v.id}>@{v.username} ({vendorCount} codes)</option>
                );
              })}
            </select>
          </div>
        </div>
        
        {filteredUnusedCoupons.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No active unused coupons matching the selected filter.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
            {filteredUnusedCoupons.map((coupon) => {
              const vendorName = coupon.assignedVendor?.username 
                ? `@${coupon.assignedVendor.username}`
                : coupon.assignedVendorId ? 'Assigned Vendor' : 'Unassigned Pool';

              return (
                <div 
                  key={coupon.id} 
                  style={{ padding: '1rem', background: coupon.assignedVendorId ? 'rgba(212, 175, 55, 0.1)' : 'rgba(10, 91, 255, 0.08)', border: `1px solid ${coupon.assignedVendorId ? 'rgba(212, 175, 55, 0.3)' : 'rgba(10, 91, 255, 0.3)'}`, borderRadius: '8px', textAlign: 'center', position: 'relative' }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: coupon.assignedVendorId ? 'var(--accent-gold)' : 'var(--accent-blue)', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    {coupon.code}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: coupon.assignedVendorId ? 'var(--accent-gold)' : 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                    {vendorName}
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      color: 'white', 
                      padding: '0.35rem 0.75rem', 
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

                  {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                    <button
                      onClick={() => handleDelete(coupon.code)}
                      style={{ 
                        background: 'rgba(255, 59, 48, 0.15)', 
                        border: '1px solid #ff3b30', 
                        color: '#ff3b30', 
                        padding: '0.3rem 0.75rem', 
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
                    Created: {new Date(coupon.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── REDEEMED / USED COUPONS TRACKING SECTION ── */}
      {usedCoupons.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Redeemed / Used Coupon Log ({usedCoupons.length})
            </h3>
            
            <input 
              type="text"
              placeholder="Search redeemed codes, users, vendors..."
              value={searchUsedQuery}
              onChange={(e) => setSearchUsedQuery(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.85rem', width: '260px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Redeemed By</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Vendor Issuer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Redeemed Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsedCoupons.map((coupon) => (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                      {coupon.code}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'white' }}>
                      {coupon.redeemedBy ? (
                        <span>@{coupon.redeemedBy.username} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({coupon.redeemedBy.email})</span></span>
                      ) : 'Unknown'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {coupon.assignedVendor ? `@${coupon.assignedVendor.username}` : 'Direct Admin'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {coupon.redeemedDate ? new Date(coupon.redeemedDate).toLocaleString() : 'Used'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(40,199,111,0.15)', color: 'var(--success)', padding: '0.15rem 0.5rem', borderRadius: '50px', fontWeight: 'bold' }}>
                        USED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
