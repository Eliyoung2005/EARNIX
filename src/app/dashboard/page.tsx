export default function DashboardOverview() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Welcome back, John!</h1>
        <span style={{ padding: '0.3rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>FREE PLAN</span>
      </div>

      {/* Upgrade Banner for FREE Users */}
      <div style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(10, 91, 255, 0.1))', border: '1px solid var(--accent-gold)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Upgrade to PRO</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Unlock Daily Login Bonuses, higher Task Earnings, and ₦250 Referral Commissions!</p>
        </div>
        <button className="btn-primary" style={{ background: 'var(--accent-gold)', color: '#000', padding: '0.75rem 2rem', fontWeight: 'bold', borderRadius: '50px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)', border: 'none' }}>
          Activate PRO for ₦500
        </button>
      </div>

      {/* Wallet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Total Balance */}
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Affiliate Balance</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₦4,500</div>
          <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.5rem' }}>+₦250 from referrals today</p>
        </div>

        {/* Task Earnings */}
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Task Earnings Balance</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>₦1,200</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Minimum withdrawal: ₦3,500</p>
        </div>

      </div>

      {/* Quick Actions & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
              Withdraw Affiliate Funds <span>→</span>
            </button>
            <button className="btn-pro" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-color-light)' }}>
              Withdraw Task Earnings <span>→</span>
            </button>
            <button className="btn-pro" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-color-light)' }}>
              Copy Referral Link <span>📋</span>
            </button>
          </div>
        </div>

        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Referral Bonus</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Today, 10:45 AM</p>
              </div>
              <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>+₦250</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Sponsored Task (TikTok)</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yesterday, 14:20 PM</p>
              </div>
              <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>+₦120</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Daily Login Bonus</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yesterday, 08:00 AM</p>
              </div>
              <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>+₦50</div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
