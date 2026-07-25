import { prisma } from '@/lib/prisma';
import WelcomePopupSettingsForm from './WelcomePopupSettingsForm';

export default async function AdminNotifications() {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "1" } });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Broadcast Pop Notifications</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Welcome Popup Settings (1-Time Pop) */}
        {settings && <WelcomePopupSettingsForm settings={settings} />}

        <div className="grid-1-1">
          {/* Send Notification Form */}
          <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Send Global Popup (Manual)</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notification Title</label>
                <input type="text" placeholder="e.g. Server Maintenance" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notification Type</label>
                <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                  <option value="Info">Info (Blue)</option>
                  <option value="Success">Success (Green)</option>
                  <option value="Warning">Warning (Gold)</option>
                  <option value="Danger">Alert (Red)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Target Audience</label>
                <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                  <option value="ALL">All Users</option>
                  <option value="FREE">FREE Plan Users Only</option>
                  <option value="PRO">PRO Plan Users Only</option>
                  <option value="SPECIFIC">Specific User (Enter Email)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Message Body</label>
                <textarea placeholder="Type the message that will pop up on user screens..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '120px' }}></textarea>
              </div>

              <button className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>Broadcast Popup</button>
            </div>
          </div>

          {/* Notification History */}
          <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Previous Broadcasts</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>Welcome to EARNIX</h3>
                  <span style={{ fontSize: '0.75rem', background: 'var(--accent-blue)', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>Info</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>The new platform is live! Upgrade to PRO to earn more.</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Sent: Just now</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
