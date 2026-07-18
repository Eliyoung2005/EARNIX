'use client';

import { useState } from 'react';

export default function AdminCodeGeneration() {
  const [amount, setAmount] = useState(10);
  const [vendor, setVendor] = useState('vendor_john');

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Generate Activation Codes</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Create and assign new PRO Activation Codes to Vendors.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Generator Form */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="vendor" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Assign to Vendor</label>
              <select 
                id="vendor" 
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              >
                <option value="vendor_john">Vendor John (150 codes)</option>
                <option value="vendor_mike">Vendor Mike (45 codes)</option>
                <option value="vendor_sarah">Vendor Sarah (90 codes)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="amount" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Number of Codes to Generate</label>
              <input 
                type="number" 
                id="amount" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={500}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Each code holds a value of ₦500 (PRO Activation Fee).</p>
            </div>

            <button type="button" className="btn-primary" style={{ marginTop: '1rem', width: '100%', background: '#ff3b30', color: 'white' }}>
              Generate & Assign Codes
            </button>
          </form>
        </div>

        {/* Recent Batches */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Recently Generated Batches</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>50 Codes</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned to: Vendor John</p>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Jul 13, 2026</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>100 Codes</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned to: Vendor Sarah</p>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Jul 10, 2026</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>20 Codes</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned to: Vendor Mike</p>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Jul 08, 2026</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
