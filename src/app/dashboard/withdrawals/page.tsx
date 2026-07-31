'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WithdrawalsPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [withdrawalType, setWithdrawalType] = useState<'AFFILIATE' | 'TASK'>('TASK');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeError, setUpgradeError] = useState<{message: string, nextPlan: string} | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: any = null;

    const fetchProfileData = async () => {
      try {
        const res = await fetch('/api/user/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProfile(data);
            if (data.plan === 'FREE') {
              setWithdrawalType('TASK');
            } else if (!profile) {
              setWithdrawalType('AFFILIATE');
            }
            setLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (status === 'authenticated') {
      fetchProfileData();
      intervalId = setInterval(fetchProfileData, 5000);

      const handleFocus = () => fetchProfileData();
      window.addEventListener('focus', handleFocus);

      return () => {
        isMounted = false;
        if (intervalId) clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading withdrawal portal...</div>;
  }

  const isFreePlan = profile?.plan === 'FREE';
  const availableBalance = withdrawalType === 'AFFILIATE' ? profile.affiliateBalance : profile.taskBalance;
  const minWithdrawal = withdrawalType === 'AFFILIATE' ? profile.minAffiliateWithdrawal : profile.minTaskWithdrawal;

  const isAffiliate = withdrawalType === 'AFFILIATE';
  const isPortalClosed = isAffiliate 
    ? profile?.affiliateWithdrawalOpen === false 
    : profile?.taskWithdrawalOpen === false;

  const isAutoMode = profile?.settings?.withdrawalPortalMode === 'AUTOMATIC';
  
  const openDateRaw = isAffiliate ? profile?.affiliateOpenDate : profile?.taskOpenDate;
  const closeDateRaw = isAffiliate ? profile?.affiliateCloseDate : profile?.taskCloseDate;

  const autoOpenSchedule = openDateRaw 
    ? new Date(openDateRaw).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : (profile?.settings?.autoOpenSchedule || 'Fridays at 8:00 AM');

  const autoCloseSchedule = closeDateRaw 
    ? new Date(closeDateRaw).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : (profile?.settings?.autoCloseSchedule || 'Sundays at 11:59 PM');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPortalClosed) {
      alert('The Withdrawal Portal is currently closed. Please check back later.');
      return;
    }
    setUpgradeError(null);
    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (withdrawalAmount < minWithdrawal) {
      alert(`Amount is below the minimum withdrawal limit of ₦${minWithdrawal}.`);
      return;
    }

    if (withdrawalAmount > availableBalance) {
      alert('Insufficient balance.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawalAmount, type: withdrawalType, pin })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'UpgradeRequired') {
          setUpgradeError({ message: data.message, nextPlan: data.nextPlan });
        } else {
          alert(data.error || 'Failed to submit withdrawal');
        }
        return;
      }

      alert('Withdrawal request submitted successfully!');
      setAmount('');
      setPin('');
      // Refresh profile to update balances
      const profileRes = await fetch('/api/user/profile');
      setProfile(await profileRes.json());
      
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Withdraw Funds</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Request a withdrawal to your local bank account. Please note the minimum limits specific to your <strong>{profile?.plan}</strong> plan.</p>

      {/* Withdrawal Portal Status Banner */}
      {isPortalClosed ? (
        <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid #ff3b30', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🔒</span>
          <div>
            <div style={{ fontWeight: 'bold', color: '#ff3b30', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{isAffiliate ? 'Affiliate' : 'Task'} Withdrawal Portal is Currently Closed</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {(isAffiliate ? profile?.affiliateWithdrawalReason : profile?.taskWithdrawalReason) || `The administrator has temporarily paused ${isAffiliate ? 'affiliate' : 'task earnings'} withdrawals for your plan. Please check back soon.`}
            </div>
          </div>
        </div>
      ) : isAutoMode ? (
        <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.4)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🗓️</span>
          <div>
            <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '1.05rem' }}>Automatic {isAffiliate ? 'Affiliate' : 'Task'} Withdrawal Schedule</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Portal Opens: <strong>{autoOpenSchedule}</strong> — Closes: <strong>{autoCloseSchedule}</strong>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Withdrawal Form */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {!isFreePlan && (
              <button 
                className={withdrawalType === 'AFFILIATE' ? 'btn-primary' : 'btn-pro'} 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px' }}
                onClick={() => setWithdrawalType('AFFILIATE')}
              >
                Affiliate Wallet
              </button>
            )}
            <button 
              className={withdrawalType === 'TASK' ? 'btn-primary' : 'btn-pro'} 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: withdrawalType === 'TASK' ? 'var(--accent-gold)' : 'transparent', color: withdrawalType === 'TASK' ? '#000' : 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={() => setWithdrawalType('TASK')}
            >
              Task + Bonus Wallet
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {!profile?.hasPin && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', color: 'var(--warning)', fontSize: '0.9rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>⚠️ Withdrawal PIN Required</strong>
                You must set your 4-digit security PIN in <Link href="/dashboard/settings" style={{ color: '#fff', textDecoration: 'underline' }}>Profile Settings</Link> before submitting a withdrawal request.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Available Balance</span>
              <span style={{ fontWeight: 'bold', color: withdrawalType === 'AFFILIATE' ? 'var(--accent-blue)' : 'var(--accent-gold)' }}>
                ₦{availableBalance?.toLocaleString()}
              </span>
            </div>

            {/* Welcome Bonus note — shown only on Task wallet */}
            {withdrawalType === 'TASK' && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(212,175,55,0.07)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🎁</span>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--accent-gold)' }}>Welcome Bonus Included:</strong> Your sign-up welcome bonus is part of this balance and can be withdrawn together with your task earnings once the minimum threshold is met.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Minimum Withdrawal</span>
              <span style={{ fontWeight: 'bold' }}>
                ₦{minWithdrawal?.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="amount" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Amount (₦)</label>
              <input 
                type="number" 
                id="amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount" 
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="pin" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--warning)' }}>4-Digit Withdrawal Security PIN</label>
              <input 
                type="password" 
                id="pin" 
                maxLength={4} 
                required 
                disabled={!profile?.hasPin}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••" 
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.5)', background: 'rgba(0,0,0,0.2)', color: 'white', letterSpacing: '4px', fontSize: '1.1rem' }}
              />
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ensure your bank details are correct in your profile settings before withdrawing.</p>
              <Link href="/dashboard/settings" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'underline' }}>View Profile Settings</Link>
            </div>

            <button 
              type="submit" 
              disabled={submitting || isPortalClosed || !profile?.hasPin} 
              className="btn-primary" 
              style={{ 
                marginTop: '1rem', 
                width: '100%', 
                background: (isPortalClosed || !profile?.hasPin) ? 'rgba(255,255,255,0.2)' : withdrawalType === 'TASK' ? 'var(--accent-gold)' : 'var(--accent-blue)', 
                color: (isPortalClosed || !profile?.hasPin) ? '#888' : withdrawalType === 'TASK' ? '#000' : '#fff',
                cursor: (isPortalClosed || !profile?.hasPin) ? 'not-allowed' : 'pointer'
              }}
            >
              {isPortalClosed ? 'Portal Closed' : !profile?.hasPin ? 'PIN Required in Profile' : submitting ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>

        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-blue)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Withdrawal Policy</h3>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.2rem' }}>
              <li>Payments are processed directly to your provided bank account.</li>
              <li>Please ensure your account name matches your registered name.</li>
              <li>Withdrawals usually take between 24-48 hours to reflect in your bank.</li>
            </ul>
          </div>
          
          <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>📞</div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Need Help?</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contact our 24/7 support team if you experience any issues.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Required Modal */}
      {upgradeError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="bg-surface animate-float-slow" style={{ padding: '3rem 2rem', borderRadius: '24px', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--accent-gold)', boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⭐</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Upgrade Required</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              {upgradeError.message}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Note: User must purchase a coupon code or upgrade via admin. For now, link them to support or plans page */}
              <Link href="/vendors" className="btn-pro" style={{ width: '100%', padding: '1rem', background: 'var(--accent-gold)', color: '#000', border: 'none' }}>
                Buy {upgradeError.nextPlan} Code
              </Link>
              <button onClick={() => setUpgradeError(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
