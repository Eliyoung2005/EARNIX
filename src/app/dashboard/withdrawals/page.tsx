'use client';

import { useState } from 'react';

export default function WithdrawalsPage() {
  const [withdrawalType, setWithdrawalType] = useState<'AFFILIATE' | 'TASK'>('AFFILIATE');

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Withdraw Funds</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Request a withdrawal to your local bank account. Please note the minimum limits.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Withdrawal Form */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className={withdrawalType === 'AFFILIATE' ? 'btn-primary' : 'btn-pro'} 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px' }}
              onClick={() => setWithdrawalType('AFFILIATE')}
            >
              Affiliate Wallet
            </button>
            <button 
              className={withdrawalType === 'TASK' ? 'btn-primary' : 'btn-pro'} 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: withdrawalType === 'TASK' ? 'var(--accent-gold)' : 'transparent', color: withdrawalType === 'TASK' ? '#000' : 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={() => setWithdrawalType('TASK')}
            >
              Task Wallet
            </button>
          </div>

          {/* Mock toggle for UI testing */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" defaultChecked={false} onChange={(e) => {
                const form = document.getElementById('withdrawal-form');
                const closedMsg = document.getElementById('closed-message');
                if (form && closedMsg) {
                  form.style.display = e.target.checked ? 'none' : 'flex';
                  closedMsg.style.display = e.target.checked ? 'flex' : 'none';
                }
              }} /> 
              Simulate Portal Closed
            </label>
          </div>

          <form id="withdrawal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Available Balance</span>
              <span style={{ fontWeight: 'bold', color: withdrawalType === 'AFFILIATE' ? 'var(--accent-blue)' : 'var(--accent-gold)' }}>
                {withdrawalType === 'AFFILIATE' ? '₦4,500' : '₦1,200'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Minimum Withdrawal</span>
              <span style={{ fontWeight: 'bold' }}>
                {withdrawalType === 'AFFILIATE' ? '₦1,000' : '₦3,500'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="amount" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Amount (₦)</label>
              <input 
                type="number" 
                id="amount" 
                placeholder="Enter amount" 
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>

            {/* Note: Bank details are now pulled from Profile Settings */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Withdrawing to saved bank details:</p>
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Access Bank - 0123456789 (John Doe)</p>
              <a href="/dashboard/settings" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'underline' }}>Change Bank Details</a>
            </div>

            <button type="button" className="btn-primary" style={{ marginTop: '1rem', width: '100%', background: withdrawalType === 'TASK' ? 'var(--accent-gold)' : 'var(--accent-blue)', color: withdrawalType === 'TASK' ? '#000' : '#fff' }}>
              Request Withdrawal
            </button>
          </form>

          {/* Closed Portal Message */}
          <div id="closed-message" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: '12px' }}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ff3b30', marginBottom: '0.5rem' }}>Withdrawal Portal Closed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The {withdrawalType} withdrawal portal is not open at this time. Please check the official Telegram channel for the next automated withdrawal schedule.</p>
            <button disabled style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', border: 'none', cursor: 'not-allowed', fontWeight: 'bold' }}>
              Withdrawal Disabled
            </button>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Withdrawal History</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>₦2,500 (Affiliate)</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Jul 12, 2026</p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>PAID</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>₦3,500 (Task)</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Jul 01, 2026</p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>PAID</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
