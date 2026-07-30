'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffManager({ subAdmins, vendors }: { subAdmins: any[], vendors: any[] }) {
  const [activeTab, setActiveTab] = useState<'SUB_ADMINS' | 'VENDORS'>('SUB_ADMINS');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handlePasswordReset = async (userId: string, username: string) => {
    const newPassword = prompt(`Enter a new password for ${username}:`);
    if (!newPassword) return; // Cancelled
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoadingId(userId);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'RESET_PASSWORD', newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Success! ${username}'s new password is now: ${newPassword}\nPlease communicate this to them securely.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`CRITICAL WARNING:\n\nAre you absolutely sure you want to permanently DELETE the account for ${username}?\n\nThis action cannot be undone.`)) return;

    setLoadingId(userId);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'DELETE_USER' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Account for ${username} has been permanently deleted.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setLoadingId(null);
    }
  };

  const handlePermissionToggle = async (userId: string, currentPerms: string[], permToToggle: string) => {
    setLoadingId(userId);
    let newPerms = [...currentPerms];
    
    if (newPerms.includes(permToToggle)) {
      newPerms = newPerms.filter(p => p !== permToToggle);
    } else {
      newPerms.push(permToToggle);
    }

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'UPDATE_PERMISSIONS', permissions: newPerms })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update permissions');
    } finally {
      setLoadingId(null);
    }
  };

  const AVAILABLE_PERMISSIONS = [
    { id: 'GENERATE_CODES', label: 'Can Generate Codes' },
    { id: 'UPLOAD_TASKS', label: 'Can Upload Tasks' },
    { id: 'APPROVE_WITHDRAWALS', label: 'Can Approve Withdrawals' },
    { id: 'MANAGE_USERS', label: 'Can Manage Users' },
    { id: 'SEND_NOTIFICATIONS', label: 'Can Send Notifications' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('SUB_ADMINS')}
          style={{ 
            flex: 1, padding: '1rem', borderRadius: '12px', fontSize: '1.25rem', fontWeight: 'bold',
            background: activeTab === 'SUB_ADMINS' ? 'var(--accent-blue)' : 'var(--surface-color)',
            color: activeTab === 'SUB_ADMINS' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'SUB_ADMINS' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: activeTab === 'SUB_ADMINS' ? '0 4px 15px rgba(10, 132, 255, 0.4)' : 'none'
          }}
        >
          Manage Sub-Admins
        </button>
        <button 
          onClick={() => setActiveTab('VENDORS')}
          style={{ 
            flex: 1, padding: '1rem', borderRadius: '12px', fontSize: '1.25rem', fontWeight: 'bold',
            background: activeTab === 'VENDORS' ? 'var(--accent-gold)' : 'var(--surface-color)',
            color: activeTab === 'VENDORS' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'VENDORS' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: activeTab === 'VENDORS' ? '0 4px 15px rgba(212, 175, 55, 0.4)' : 'none'
          }}
        >
          Monitor Code Vendors
        </button>
      </div>

      {activeTab === 'SUB_ADMINS' && (
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Sub-Admin Activity & Permissions</h2>
          
          {subAdmins.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No Sub-Admins found in the system.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Staff Member</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Permissions / Roles</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subAdmins.map(admin => (
                    <tr key={admin.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{admin.name || admin.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{admin.username} • {admin.email}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Added: {new Date(admin.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {AVAILABLE_PERMISSIONS.map(perm => {
                            const hasPerm = admin.subAdminPermissions.includes(perm.id);
                            return (
                              <label key={perm.id} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: loadingId === admin.id ? 0.5 : 1 }}>
                                <input 
                                  type="checkbox" 
                                  checked={hasPerm} 
                                  onChange={() => handlePermissionToggle(admin.id, admin.subAdminPermissions, perm.id)}
                                  disabled={loadingId === admin.id}
                                /> 
                                {perm.label}
                              </label>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handlePasswordReset(admin.id, admin.username)}
                            disabled={loadingId === admin.id}
                            style={{ padding: '0.5rem 1rem', background: '#0A5BFF', color: 'white', borderRadius: '8px', border: 'none', cursor: loadingId === admin.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 'bold', opacity: loadingId === admin.id ? 0.5 : 1 }}
                          >
                            Set New Password
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(admin.id, admin.username)}
                            disabled={loadingId === admin.id}
                            style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ff3b30', border: '1px solid #ff3b30', borderRadius: '8px', cursor: loadingId === admin.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 'bold', opacity: loadingId === admin.id ? 0.5 : 1 }}
                          >
                            Delete Account
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'VENDORS' && (
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Code Vendor Management</h2>
          
          {vendors.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No Vendors found in the system.</p>
          ) : (
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
                  {vendors.map(vendor => (
                    <tr key={vendor.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{vendor.name || vendor.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{vendor.username} • {vendor.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', display: 'block' }}>Codes Sold (Used): <strong style={{ color: 'var(--success)' }}>{vendor.assignedCoupons.filter((c:any) => c.status === 'USED').length}</strong></span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', display: 'block' }}>Unused Codes: <strong style={{ color: 'var(--warning)' }}>{vendor.assignedCoupons.filter((c:any) => c.status === 'UNUSED').length}</strong></span>
                        <span style={{ fontSize: '0.85rem', display: 'block' }}>Total Allocated: <strong>{vendor.assignedCoupons.length}</strong></span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handlePasswordReset(vendor.id, vendor.username)}
                            disabled={loadingId === vendor.id}
                            style={{ padding: '0.5rem 1rem', background: '#0A5BFF', color: 'white', borderRadius: '8px', border: 'none', cursor: loadingId === vendor.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 'bold', opacity: loadingId === vendor.id ? 0.5 : 1 }}
                          >
                            Set New Password
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(vendor.id, vendor.username)}
                            disabled={loadingId === vendor.id}
                            style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ff3b30', border: '1px solid #ff3b30', borderRadius: '8px', cursor: loadingId === vendor.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 'bold', opacity: loadingId === vendor.id ? 0.5 : 1 }}
                          >
                            Delete Account
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
