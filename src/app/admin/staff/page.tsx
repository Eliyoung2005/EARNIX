'use client';

import { useState } from 'react';

export default function StaffManagement() {
  const [activeTab, setActiveTab] = useState<'SUB_ADMINS' | 'VENDORS'>('SUB_ADMINS');

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Staff & Vendor Monitoring</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Monitor performance, set permissions, and manage passwords for Sub-Admins and Vendors.</p>

      {/* View Control Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('SUB_ADMINS')}
          style={{ 
            flex: 1, 
            padding: '1rem', 
            borderRadius: '12px', 
            fontSize: '1.25rem',
            fontWeight: 'bold',
            background: activeTab === 'SUB_ADMINS' ? 'var(--accent-blue)' : 'var(--surface-color)',
            color: activeTab === 'SUB_ADMINS' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'SUB_ADMINS' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'SUB_ADMINS' ? '0 4px 15px rgba(10, 132, 255, 0.4)' : 'none'
          }}
        >
          Manage Sub-Admins
        </button>
        <button 
          onClick={() => setActiveTab('VENDORS')}
          style={{ 
            flex: 1, 
            padding: '1rem', 
            borderRadius: '12px', 
            fontSize: '1.25rem',
            fontWeight: 'bold',
            background: activeTab === 'VENDORS' ? 'var(--accent-gold)' : 'var(--surface-color)',
            color: activeTab === 'VENDORS' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'VENDORS' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'VENDORS' ? '0 4px 15px rgba(212, 175, 55, 0.4)' : 'none'
          }}
        >
          Monitor Code Vendors
        </button>
      </div>

      {activeTab === 'SUB_ADMINS' && (
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Sub-Admin Activity & Permissions</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Staff Member</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Activity Stats</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Permissions / Roles</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>Sarah Jenkins</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>sarah@earnix.com</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Codes Generated: <strong style={{ color: 'var(--success)' }}>1,500</strong></span>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Tasks Uploaded: <strong>0</strong></span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" defaultChecked /> Can Generate Codes</label>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" /> Can Upload Tasks</label>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" /> Can Approve Withdrawals</label>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', background: '#ff3b30', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reset Password</button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>Task Manager John</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>john@earnix.com</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Codes Generated: <strong>0</strong></span>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Tasks Uploaded: <strong style={{ color: 'var(--accent-gold)' }}>45</strong></span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" /> Can Generate Codes</label>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" defaultChecked /> Can Upload Tasks</label>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" /> Can Approve Withdrawals</label>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', background: '#ff3b30', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reset Password</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'VENDORS' && (
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Code Vendor Performance Monitoring</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Vendor Name</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Sales Performance</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Code Inventory</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>CryptoJudy</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>judy@crypto.com</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Codes Sold (Used): <strong style={{ color: 'var(--success)' }}>340</strong></span>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Revenue Generated: <strong>₦170,000</strong></span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Unsold Codes: <strong style={{ color: 'var(--warning)' }}>60</strong></span>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Total Allocated: <strong>400</strong></span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', background: '#ff3b30', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reset Password</button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>Mike_Hustle</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>mike@hustle.com</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Codes Sold (Used): <strong style={{ color: 'var(--success)' }}>12</strong></span>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Revenue Generated: <strong>₦6,000</strong></span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Unsold Codes: <strong style={{ color: '#ff3b30' }}>88</strong></span>
                    <span style={{ fontSize: '0.85rem', display: 'block' }}>Total Allocated: <strong>100</strong></span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ padding: '0.5rem 1rem', background: '#ff3b30', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reset Password</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
