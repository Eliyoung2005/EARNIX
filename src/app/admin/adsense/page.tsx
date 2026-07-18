'use client';

export default function AdSenseControls() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>AdSense Management</h1>

      {/* AdSense Revenue Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Estimated Earnings (Today)</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$42.50</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--success)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Estimated Earnings (This Month)</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$1,240.00</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Ad Impressions</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>145K</div>
        </div>
      </div>

      <div className="grid-responsive-2">
        {/* AdSense Configuration */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Global AdSense Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Control your platform-wide Google AdSense integration.</p>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--success)', width: '20px', height: '20px' }} />
              <span style={{ fontWeight: 'bold' }}>Enable Google AdSense Globally</span>
            </label>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AdSense Client ID (Publisher ID)</label>
              <input type="text" defaultValue="ca-pub-1234567890123456" placeholder="e.g. ca-pub-XXXXXXXXXXXXXXXX" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>

            <button type="button" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>Save Configuration</button>
          </form>
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
