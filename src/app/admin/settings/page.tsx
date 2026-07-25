'use client';

import { useState } from 'react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'FREE' | 'PRO'>('FREE');

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Platform Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Manage rewards, fees, and system-wide configurations.</p>

      {/* Plan Control Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('FREE')}
          style={{ 
            flex: 1, 
            padding: '1rem', 
            borderRadius: '12px', 
            fontSize: '1.25rem',
            fontWeight: 'bold',
            background: activeTab === 'FREE' ? '#ff3b30' : 'var(--surface-color)',
            color: activeTab === 'FREE' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'FREE' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'FREE' ? '0 4px 15px rgba(255, 59, 48, 0.4)' : 'none'
          }}
        >
          FREE Plan Controls
        </button>
        <button 
          onClick={() => setActiveTab('PRO')}
          style={{ 
            flex: 1, 
            padding: '1rem', 
            borderRadius: '12px', 
            fontSize: '1.25rem',
            fontWeight: 'bold',
            background: activeTab === 'PRO' ? 'var(--accent-gold)' : 'var(--surface-color)',
            color: activeTab === 'PRO' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'PRO' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'PRO' ? '0 4px 15px rgba(212, 175, 55, 0.4)' : 'none'
          }}
        >
          PRO Plan Controls
        </button>
      </div>

      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
        
        {/* FREE PLAN SETTINGS */}
        {activeTab === 'FREE' && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ff3b30' }}>FREE Plan Settings</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="freeWelcome" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Welcome Bonus (₦)</label>
              <input type="number" id="freeWelcome" defaultValue={50} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="freeTask" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Sponsored Task Reward (₦)</label>
              <input type="number" id="freeTask" defaultValue={80} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
            </div>



            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <input type="checkbox" id="enableFree" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
              <label htmlFor="enableFree" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Enable New FREE Registrations</label>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong style={{ color: 'white', fontSize: '1.1rem' }}>Withdrawal Portal (FREE)</strong>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Portal Mode</label>
                <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '1rem' }}>
                  <option value="MANUAL">Manual (Use Checkboxes below)</option>
                  <option value="SCHEDULED">Scheduled (Set Date & Time)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Scheduled Open Date</label>
                  <input type="datetime-local" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Scheduled Close Date</label>
                  <input type="datetime-local" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input type="checkbox" style={{ accentColor: 'var(--success)', width: '18px', height: '18px' }} />
                <span style={{ fontWeight: 'bold' }}>MANUAL: Enable Task Earnings Withdrawal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--success)', width: '18px', height: '18px' }} />
                <span style={{ fontWeight: 'bold' }}>MANUAL: Enable Affiliate Earnings Withdrawal</span>
              </label>
            </div>

            <button type="button" className="btn-primary" style={{ marginTop: '1rem', background: '#ff3b30', color: 'white' }}>Save FREE Plan Settings</button>
          </form>
        )}

        {/* PRO PLAN SETTINGS */}
        {activeTab === 'PRO' && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>PRO Plan Settings</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="proFee" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Activation Fee (₦)</label>
              <input type="number" id="proFee" defaultValue={500} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label htmlFor="proWelcome" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Welcome Bonus (₦)</label>
                <input type="number" id="proWelcome" defaultValue={100} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>

            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label htmlFor="proTask" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Sponsored Task Reward (₦)</label>
                <input type="number" id="proTask" defaultValue={120} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label htmlFor="proRef" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Referral Commission (₦)</label>
                <input type="number" id="proRef" defaultValue={250} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <input type="checkbox" id="enablePro" defaultChecked style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }} />
              <label htmlFor="enablePro" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Enable New PRO Registrations</label>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--accent-gold)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>Withdrawal Portal (PRO)</strong>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Portal Mode</label>
                <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '1rem' }}>
                  <option value="MANUAL">Manual (Use Checkboxes below)</option>
                  <option value="SCHEDULED">Scheduled (Set Date & Time)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Scheduled Open Date</label>
                  <input type="datetime-local" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Scheduled Close Date</label>
                  <input type="datetime-local" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--success)', width: '18px', height: '18px' }} />
                <span style={{ fontWeight: 'bold' }}>MANUAL: Enable Task Earnings Withdrawal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--success)', width: '18px', height: '18px' }} />
                <span style={{ fontWeight: 'bold' }}>MANUAL: Enable Affiliate Earnings Withdrawal</span>
              </label>
            </div>

            <button type="button" className="btn-primary" style={{ marginTop: '1rem', background: 'var(--accent-gold)', color: '#000' }}>Save PRO Plan Settings</button>
          </form>
        )}

      </div>

      {/* Global Notifications / Messages */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Automated Messages</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>One-Time Registration Welcome Message</label>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>This message pops up exactly once when a user logs in for the very first time.</p>
            <textarea 
              defaultValue="Welcome to EARNIX! We are thrilled to have you onboard. Please ensure you join our official Telegram channel for updates and set up your withdrawal bank details in the Profile Settings."
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '120px' }}
            ></textarea>
          </div>

          <button type="button" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start' }}>Save Messages</button>
        </form>
      </div>

      {/* System Maintenance */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid #ff3b30' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ff3b30' }}>System Maintenance</h2>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: '#ff3b30', width: '20px', height: '20px' }} />
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', color: '#ff3b30' }}>Enable Maintenance Mode</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Locks all regular users out of the site and displays the maintenance screen. Admins can still log in.</span>
            </div>
          </label>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Maintenance Message / Reason</label>
            <input type="text" defaultValue="We are currently upgrading our servers to serve you better. Please check back in a few hours." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <button type="button" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start', background: '#ff3b30', color: 'white' }}>Update Maintenance Settings</button>
        </form>
      </div>

    </div>
  );
}
