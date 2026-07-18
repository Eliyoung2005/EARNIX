'use client';

export default function UserProfile() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Profile Settings</h1>

      <div className="grid-responsive-2">
        
        {/* Personal Details */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Personal Information</h2>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>First Name</label>
                <input type="text" defaultValue="John" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Last Name</label>
                <input type="text" defaultValue="Doe" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
              <input type="email" defaultValue="john@example.com" disabled style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
            </div>

            <button className="btn-primary" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>Save Changes</button>
          </form>
        </div>

        {/* Bank Details */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-blue)' }}>Withdrawal Details</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Set your bank details ahead of time. Ensure these details are correct before the withdrawal portal opens.</p>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bank Name</label>
                <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                  <option value="">Select Bank...</option>
                  <option value="access">Access Bank</option>
                  <option value="gtb">Guaranty Trust Bank (GTB)</option>
                  <option value="zenith">Zenith Bank</option>
                  <option value="uba">United Bank for Africa (UBA)</option>
                  <option value="first">First Bank</option>
                  <option value="opay">OPay</option>
                  <option value="palmpay">PalmPay</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Account Number</label>
                <input type="text" maxLength={10} placeholder="e.g. 0123456789" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Account Name</label>
                <input type="text" placeholder="e.g. John Doe" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
            </div>

            <button type="button" className="btn-pro" style={{ padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start' }}>Save Bank Details</button>
          </form>
        </div>

        {/* Security Settings (PIN) */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--warning)' }}>Security & Withdrawal PIN</h2>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current Withdrawal PIN</label>
              <input type="password" maxLength={4} placeholder="••••" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', letterSpacing: '4px' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>New PIN</label>
                <input type="password" maxLength={4} placeholder="e.g. 1234" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', letterSpacing: '4px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Confirm New PIN</label>
                <input type="password" maxLength={4} placeholder="e.g. 1234" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', letterSpacing: '4px' }} />
              </div>
            </div>

            <button className="btn-pro" style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', borderColor: 'var(--warning)', color: 'var(--warning)' }}>Update PIN</button>
            
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Change Account Password</label>
              <button type="button" className="btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white' }}>Request Password Reset Link</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
