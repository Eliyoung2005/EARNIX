'use client';

import { useState } from 'react';

export default function AdminUsers() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'FREE', refs: 2, refEarnings: '₦0', taskEarnings: '₦1200', joined: '2026-07-10' },
    { id: 2, name: 'Ifec', email: 'ifec@earnix.com', plan: 'PRO', refs: 45, refEarnings: '₦11,250', taskEarnings: '₦71,200', joined: '2026-07-02' },
    { id: 3, name: 'CryptoJudy', email: 'judy@crypto.com', plan: 'PRO', refs: 12, refEarnings: '₦3,000', taskEarnings: '₦35,100', joined: '2026-07-05' },
  ]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Manage Users</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" placeholder="Search by name or email..." style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '250px' }} />
          <button className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px' }}>Search</button>
        </div>
      </div>

      <div className="bg-surface" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>User Info</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Plan</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Referrals</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Task Earnings</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>Ref Earnings</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Joined: {user.joined}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '50px', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      background: user.plan === 'PRO' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.1)',
                      color: user.plan === 'PRO' ? 'var(--accent-gold)' : 'white'
                    }}>
                      {user.plan}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.refs}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-blue)', fontWeight: 'bold' }}>{user.taskEarnings}</td>
                  <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: 'bold' }}>{user.refEarnings}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Edit
                      </button>
                      <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.3)', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-surface" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '16px', border: '1px solid var(--accent-gold)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Edit User: {selectedUser.name}</h2>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" defaultValue={selectedUser.name} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
                <input type="email" defaultValue={selectedUser.email} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Role</label>
                  <select defaultValue="USER" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                    <option value="USER">Standard User</option>
                    <option value="VENDOR">Code Vendor</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Membership Plan</label>
                  <select defaultValue={selectedUser.plan} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                    <option value="FREE">FREE</option>
                    <option value="PRO">PRO</option>
                  </select>
                </div>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-pro" style={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>Cancel</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
