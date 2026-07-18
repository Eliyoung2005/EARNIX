'use client';

export default function VendorDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Vendor Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Manage your assigned Activation Codes and track your sales.</p>

      {/* Vendor Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Assigned Codes</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>150</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--success)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Codes Sold (Redeemed)</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>85</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Available Codes to Sell</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>65</div>
        </div>

      </div>

      {/* Vendor Profile Settings */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>Custom DM Message</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>This message will be pre-filled when users click your link from the Code Vendors page to chat with you.</p>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea 
            defaultValue="Hello! I would like to purchase an EARNIX PRO Activation Code."
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px' }}
          ></textarea>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>Save Message</button>
        </form>
      </div>

      {/* Code Management */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Your Activation Codes</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-pro" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Filter Available</button>
            <button className="btn-pro" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Filter Sold</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Coupon Code</th>
                <th style={{ padding: '1rem 0.5rem' }}>Value</th>
                <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                <th style={{ padding: '1rem 0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>ERX-A7B2-C9X4</td>
                <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>₦500</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={{ background: 'rgba(10, 91, 255, 0.2)', color: 'var(--accent-blue)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>AVAILABLE</span>
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Copy Code</button>
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>ERX-K3M8-P1Z5</td>
                <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>₦500</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={{ background: 'rgba(10, 91, 255, 0.2)', color: 'var(--accent-blue)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>AVAILABLE</span>
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Copy Code</button>
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: 0.5 }}>
                <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', fontSize: '1.1rem', textDecoration: 'line-through' }}>ERX-Q5W1-E6R9</td>
                <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>₦500</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>SOLD (REDEEMED)</span>
                </td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  Used by user@email.com
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
