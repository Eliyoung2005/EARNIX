'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useCurrency } from '@/lib/CurrencyContext';

export default function ReferralsClient({
  username,
  referralCount,
  weeklyReferralCount,
  affiliateBalance,
  planName,
  referrals = []
}: {
  username: string;
  referralCount: number;
  weeklyReferralCount: number;
  affiliateBalance: number;
  planName: string;
  referrals?: Array<{ id: string, name?: string | null, username: string, email: string, plan: string, createdAt: Date | string }>;
}) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'paid' | 'free'>('paid');
  const { fmt, currencyName } = useCurrency();

  const paidReferrals = referrals.filter(r => r.plan !== 'FREE');
  const freeReferrals = referrals.filter(r => r.plan === 'FREE');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const stableLink = `${origin || ''}/register?ref=${username}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(stableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert(`Your Referral Link:\n${stableLink}`);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join EARNIX today and start earning daily income! Use my invite link to register now: ${stableLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `Join EARNIX today and start earning daily income! Register here:`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(stableLink)}&text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Universal Stable Referral Link Banner */}
      <div className="bg-surface" style={{
        padding: '2rem',
        borderRadius: '20px',
        border: '1px solid rgba(192, 132, 252, 0.3)',
        background: 'linear-gradient(135deg, rgba(26, 16, 60, 0.95) 0%, rgba(19, 13, 42, 0.98) 100%)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.35rem' }}>
              Your Invite Link
            </h2>
          </div>
        </div>

        {/* Link input + Copy button */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.5)',
          padding: '0.75rem',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.15)',
          alignItems: 'center'
        }}>
          <input
            type="text"
            readOnly
            value={stableLink}
            style={{
              flex: 1,
              minWidth: '220px',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              paddingLeft: '0.5rem',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#22c55e' : 'linear-gradient(135deg, #d8b4fe 0%, #c084fc 50%, #a855f7 100%)',
              color: '#000',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '110px'
            }}
          >
            {copied ? 'Copied! ✓' : 'Copy Link'}
          </button>
        </div>

        {/* Quick Social Share Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleShareWhatsApp}
            style={{
              background: 'rgba(37, 211, 102, 0.15)',
              border: '1px solid #25D366',
              color: '#25D366',
              padding: '0.6rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <MessageSquare size={16} /> Share on WhatsApp
          </button>
          <button
            onClick={handleShareTelegram}
            style={{
              background: 'rgba(0, 136, 204, 0.15)',
              border: '1px solid #0088cc',
              color: '#0088cc',
              padding: '0.6rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Send size={16} /> Share on Telegram
          </button>
        </div>
      </div>

      {/* Referral Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="bg-surface" style={{
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Total Referrals
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
            {referralCount}
          </div>
        </div>

        <div className="bg-surface" style={{
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Weekly Referrals
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-blue)' }}>
            {weeklyReferralCount}
          </div>
        </div>

        <div className="bg-surface" style={{
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(192, 132, 252, 0.3)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Affiliate Balance
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#c084fc' }}>
            {fmt(affiliateBalance)}
          </div>
        </div>
      </div>

      {/* Referral List Tabs */}
      <div className="bg-surface" style={{
        padding: '2rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(26, 16, 60, 0.4)'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.25rem', color: '#fff' }}>
          My Referral Network
        </h3>

        {/* Tab Header */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('paid')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'paid' ? '#c084fc' : 'var(--text-secondary)',
              borderBottom: activeTab === 'paid' ? '2px solid #c084fc' : 'none',
              paddingBottom: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Paid Packages ({paidReferrals.length})
          </button>
          <button
            onClick={() => setActiveTab('free')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'free' ? '#c084fc' : 'var(--text-secondary)',
              borderBottom: activeTab === 'free' ? '2px solid #c084fc' : 'none',
              paddingBottom: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Free Packages ({freeReferrals.length})
          </button>
        </div>

        {/* List Content */}
        <div>
          {activeTab === 'paid' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {paidReferrals.map(ref => (
                <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#fff', display: 'block' }}>{ref.name || 'No Name'} (@{ref.username})</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Registered on {new Date(ref.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    background: 'rgba(192, 132, 252, 0.2)',
                    color: '#c084fc',
                    fontWeight: 'bold'
                  }}>{ref.plan}</span>
                </div>
              ))}
              {paidReferrals.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem' }}>No paid package referrals yet.</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {freeReferrals.map(ref => (
                <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#fff', display: 'block' }}>{ref.name || 'No Name'} (@{ref.username})</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Registered on {new Date(ref.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)',
                    fontWeight: 'bold'
                  }}>FREE PLAN</span>
                </div>
              ))}
              {freeReferrals.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem' }}>No free package referrals yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-surface" style={{
        padding: '1.75rem',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>
          How Referrals Work
        </h3>
        <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
          <li>
            <strong style={{ color: '#fff' }}>Copy your link:</strong> Your invite link contains your unique referral code (<code style={{ color: '#c084fc' }}>{username}</code>).
          </li>
          <li>
            <strong style={{ color: '#fff' }}>Share anywhere:</strong> Post it on WhatsApp, Telegram, Facebook, or send it directly to friends.
          </li>
          <li>
            <strong style={{ color: '#fff' }}>Earn automatically:</strong> Whenever someone registers and activates a paid plan, upgraded members automatically earn instant referral commissions in their Affiliate Balance. (Note: FREE plan accounts track referral counts but do not earn {currencyName.toLowerCase()} referral commissions until upgraded to a paid plan).
          </li>
        </ol>
      </div>

    </div>
  );
}
