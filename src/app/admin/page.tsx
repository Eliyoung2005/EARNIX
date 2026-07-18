'use client';

export default function AdminOverview() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Platform Overview</h1>

      {/* Admin Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #ff3b30' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Users</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>1,245</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--text-secondary)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Free Users</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>925</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>PRO Users</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>320</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Code Vendors</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>15</div>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--warning)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Daily Tasks Performed</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>1,842</div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <span style={{ color: '#ff3b30' }}>FREE: 1,200</span>
            <span style={{ color: 'var(--accent-gold)' }}>PRO: 642</span>
          </div>
        </div>

      </div>

      {/* Super Admin Financial Overview */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Financial Overview (Super Admin Only)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Platform Inflow</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₦1,250,000</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Total money from PRO activations</p>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--success)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Paid Out</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₦450,000</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Total successful withdrawals</p>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #ff3b30' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Unpaid (Pending Wallets)</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₦300,000</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>User balances yet to be withdrawn</p>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Net Profit</p>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>₦500,000</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Platform retained earnings</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Pending Actions */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#ff3b30' }}>Action Required</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Pending Task Proofs</span>
              <span style={{ background: '#ff3b30', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>24</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>Pending Withdrawals</span>
              <span style={{ background: '#ff3b30', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>12</span>
            </div>
          </div>
        </div>

        {/* System Health / Quick Logs */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Activity Logs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>• Admin created 50 new coupon codes (10 mins ago)</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>• New Vendor "vendor_mike" added (1 hr ago)</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>• 12 Withdrawals approved (3 hrs ago)</p>
          </div>
        </div>

        {/* Top Referrers (Admin View) */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Top Referrers (All Time)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>CryptoJudy</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>judy@crypto.com</p>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>145 Refs</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Ifec_Earns</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ifec@earnix.com</p>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>89 Refs</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>Mike_Hustle</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>mike@hustle.com</p>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>54 Refs</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
