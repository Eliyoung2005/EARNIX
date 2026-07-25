'use client';

export default function QuickActions({ username, plan }: { username: string, plan: string }) {
  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${username}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied to clipboard!');
  };

  const handleWithdraw = (type: string) => {
    alert(`${type} Withdrawals are currently locked for processing. Check back later.`);
  };

  return (
    <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plan !== 'FREE' && (
          <button onClick={() => handleWithdraw('Affiliate')} className="btn-primary" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
            Withdraw Affiliate Funds <span>→</span>
          </button>
        )}
        <button onClick={() => handleWithdraw('Task')} className="btn-pro" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-color-light)' }}>
          Withdraw Task Earnings <span>→</span>
        </button>
        {plan === 'PRO' && (
          <button onClick={handleCopyLink} className="btn-pro" style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-color-light)' }}>
            Copy Referral Link <span>📋</span>
          </button>
        )}
      </div>
    </div>
  );
}
