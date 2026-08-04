'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useCurrency } from '@/lib/CurrencyContext';

interface Coupon {
  id: string;
  code: string;
  status: string;
  createdAt: Date;
  assignedVendorId: string | null;
  assignedVendor?: { id: string; username: string } | null;
  planId: string | null;
  plan?: { id: string; name: string } | null;
}

interface UsedCoupon {
  id: string;
  code: string;
  status: string;
  redeemedDate?: Date | null;
  assignedVendor?: { id?: string; name?: string | null; username: string } | null;
  redeemedBy?: { name?: string | null; username: string; email: string } | null;
  plan?: { id?: string; name?: string } | null;
}

interface Vendor {
  id: string;
  username: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface VendorStat {
  id: string;
  username: string;
  name?: string | null;
  plans: Record<string, { planName: string; available: number; sold: number; total: number }>;
  totalAvailable: number;
  totalSold: number;
  totalAssigned: number;
}

export default function CouponManager({ 
  initialCoupons, 
  usedCoupons = [], 
  vendors = [], 
  plans = [],
  vendorStats = [],
  userRole 
}: { 
  initialCoupons: Coupon[], 
  usedCoupons?: UsedCoupon[], 
  vendors?: Vendor[], 
  plans?: Plan[],
  vendorStats?: VendorStat[],
  userRole?: string 
}) {
  const { fmt } = useCurrency();
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
  const [planFilter, setPlanFilter] = useState('ALL');
  const [searchUsedQuery, setSearchUsedQuery] = useState('');
  const [allPlans, setAllPlans] = useState<Plan[]>(plans || []);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const router = useRouter();

  // Ensure plans list is populated and auto-select first paid plan
  useEffect(() => {
    fetch(`/api/plans?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAllPlans(data);
          const firstPaid = data.find((p: any) => p.name.toUpperCase() !== 'FREE' || p.price > 0) || data[0];
          if (firstPaid && !selectedPlanId) {
            setSelectedPlanId(firstPaid.id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Also auto-select from props if plans prop changes
  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlanId) {
      setAllPlans(plans);
      const firstPaid = plans.find((p: any) => p.name.toUpperCase() !== 'FREE' || p.price > 0) || plans[0];
      if (firstPaid) {
        setSelectedPlanId(firstPaid.id);
      }
    }
  }, [plans]);

  const getPlanColor = (planName?: string) => {
    if (!planName) return 'var(--text-secondary)';
    const upper = planName.toUpperCase();
    if (upper.includes('ELITE')) return '#a855f7';
    if (upper.includes('VIP')) return 'var(--accent-gold)';
    if (upper.includes('PRO')) return 'var(--accent-blue)';
    return 'var(--text-secondary)';
  };

  const handleGenerate = async () => {
    if (!selectedPlanId) {
      alert('Please select a Target Membership Plan before generating coupons.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, assignToId, planId: selectedPlanId })
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
    const vendorMatch = vendorFilter === 'ALL' ? true 
      : vendorFilter === 'UNASSIGNED' ? c.assignedVendorId === null 
      : c.assignedVendorId === vendorFilter;
    const planMatch = planFilter === 'ALL' ? true : c.planId === planFilter;
    return vendorMatch && planMatch;
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
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
              Target Plan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              value={selectedPlanId} 
              onChange={(e) => setSelectedPlanId(e.target.value)} 
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--accent-gold)', background: 'rgba(0,0,0,0.5)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              <option value="" disabled>-- Select Target Plan --</option>
              {(allPlans.filter(p => p.name.toUpperCase() !== 'FREE').length > 0
                ? allPlans.filter(p => p.name.toUpperCase() !== 'FREE')
                : allPlans
              ).map(p => (
                <option key={p.id} value={p.id} style={{ background: '#1e293b', color: 'white' }}>
                  {p.name} Plan {p.price > 0 ? `(${fmt(p.price)})` : ''}
                </option>
              ))}
            </select>
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
            <Zap size={16} /> Batch Assign Pool Codes to Vendor
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

      {/* ── VENDOR SALES & INVENTORY PERFORMANCE (PER PLAN) ── */}
      {vendorStats && vendorStats.length > 0 && (
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '16px', marginBottom: '3rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} /> Vendor Sales &amp; Inventory Breakdown (Per Plan)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                Monitor how many activation codes each vendor has sold per plan, how many remain available, and total allocations.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {vendorStats.map((v) => {
              const planEntries = Object.entries(v.plans);
              return (
                <div key={v.id} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'white' }}>
                        @{v.username}
                      </div>
                      {v.name && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.name}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Allocated</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{v.totalAssigned} codes</div>
                    </div>
                  </div>

                  {planEntries.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      No codes allocated to this vendor yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {planEntries.map(([planName, ps]) => {
                        const color = getPlanColor(planName);
                        return (
                          <div key={planName} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}30`, borderRadius: '8px', padding: '0.6rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color, background: `${color}18`, padding: '0.15rem 0.5rem', borderRadius: '4px', border: `1px solid ${color}40` }}>
                                {planName}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                              <div>
                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{ps.sold}</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Sold</span>
                              </div>
                              <div>
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{ps.available}</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Left</span>
                              </div>
                              <div>
                                <span style={{ color: 'white', fontWeight: 'bold' }}>{ps.total}</span> <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Total</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.08)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Total Sold: {v.totalSold}</span>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Total Left: {v.totalAvailable}</span>
                  </div>
                </div>
              );
            })}
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
                
                {coupon.plan?.name && (
                  <div style={{ fontSize: '0.7rem', color: getPlanColor(coupon.plan.name), fontWeight: 'bold', marginBottom: '0.35rem' }}>
                    {coupon.plan.name} PLAN
                  </div>
                )}

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter Plan:</label>
              <select 
                value={planFilter} 
                onChange={(e) => setPlanFilter(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Plans</option>
                {plans.filter(p => p.price > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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

                  {coupon.plan?.name && (
                    <div style={{ fontSize: '0.7rem', color: getPlanColor(coupon.plan.name), fontWeight: 'bold', background: `${getPlanColor(coupon.plan.name)}15`, padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.5rem', border: `1px solid ${getPlanColor(coupon.plan.name)}30` }}>
                      {coupon.plan.name} PLAN
                    </div>
                  )}
                  
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
                  <th style={{ padding: '0.75rem 1rem' }}>Plan</th>
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
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {coupon.plan?.name ? (
                        <span style={{ fontSize: '0.72rem', background: `${getPlanColor(coupon.plan.name)}15`, color: getPlanColor(coupon.plan.name), padding: '0.15rem 0.5rem', borderRadius: '50px', fontWeight: 'bold', border: `1px solid ${getPlanColor(coupon.plan.name)}30` }}>
                          {coupon.plan.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Legacy</span>
                      )}
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
