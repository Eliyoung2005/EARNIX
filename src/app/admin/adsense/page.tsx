import { prisma } from '@/lib/prisma';
import AdSenseForm from './AdSenseForm';

export const dynamic = 'force-dynamic';

export default async function AdSenseControls() {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "1" } });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>AdSense Management</h1>

      {/* AdSense Revenue Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Estimated Earnings (Today)</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$0.00</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--success)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Estimated Earnings (This Month)</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$0.00</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Ad Impressions</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>0</div>
        </div>
      </div>

      <div className="grid-responsive-2">
        {/* AdSense Configuration */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Global AdSense Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Control your platform-wide Google AdSense integration.</p>
          
          <AdSenseForm settings={{ adsenseEnabled: settings?.adsenseEnabled || false, adsenseClientId: settings?.adsenseClientId || '' }} />
        </div>

        {/* Ad Placement Codes */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Manual Ad Placements</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Paste your specific ad unit codes here to inject them into the platform.</p>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Dashboard Banner Ad Unit (Slot ID)</label>
              <input type="text" placeholder="e.g. 1234567890" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sponsored Task Inline Ad Unit (Slot ID)</label>
              <input type="text" placeholder="e.g. 0987654321" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>

            <button type="button" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start' }}>Save Ad Placements</button>
          </form>
        </div>

      </div>
    </div>
  );
}
