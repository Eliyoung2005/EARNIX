'use client';

import { useState, useEffect } from 'react';

export default function ReferralsClient({
  username,
  referralCount,
  weeklyReferralCount,
  affiliateBalance,
  planName
}: {
  username: string;
  referralCount: number;
  weeklyReferralCount: number;
  affiliateBalance: number;
  planName: string;
}) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

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
      alert(`Your Stable Referral Link:\n${stableLink}`);
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
              Your Stable Invite Link
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Works on any mobile device or computer worldwide. Anyone who registers via this link becomes your referral.
            </p>
          </div>
          <span style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '50px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            ● Active Worldwide
          </span>
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
            <span>💬</span> Share on WhatsApp
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
            <span>✈️</span> Share on Telegram
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
            ₦{affiliateBalance.toLocaleString()}
          </div>
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
            <strong style={{ color: '#fff' }}>Earn automatically:</strong> Whenever someone registers and activates a paid plan, upgraded members automatically earn instant referral commissions in their Affiliate Balance. (Note: FREE plan accounts track referral counts but do not earn cash referral commissions until upgraded to a paid plan).
          </li>
        </ol>
      </div>

    </div>
  );
}
