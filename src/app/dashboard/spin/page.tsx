'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UpgradeBannerButton from '../UpgradeBannerButton';
import { Disc, Lock, Gift, Zap, Trophy } from 'lucide-react';

export default function SpinWheelPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [walletChoice, setWalletChoice] = useState<'TASK' | 'AFFILIATE'>('TASK');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winResult, setWinResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/spin/wheel');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSpin = async () => {
    if (spinning || !status?.isEligible) return;

    setSpinning(true);
    setErrorMsg('');
    setWinResult(null);

    try {
      const res = await fetch('/api/spin/wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletChoice })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Spin failed');
      }

      // Calculate Rotation Angle
      // 5 segments = 72 degrees per segment
      const segmentAngle = 360 / 5;
      const winningIndex = data.winningIndex;
      
      const targetSegmentCenter = (winningIndex * segmentAngle) + (segmentAngle / 2);
      const extraRotations = 360 * 5; // 5 full spins
      const finalRotation = rotation + extraRotations + (360 - targetSegmentCenter);

      setRotation(finalRotation);

      // Wait for spin animation (4.2 seconds)
      setTimeout(() => {
        setSpinning(false);
        setWinResult(data);
        fetchStatus();
      }, 4200);

    } catch (err: any) {
      setSpinning(false);
      setErrorMsg(err.message || 'Spin failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading Spin &amp; Win Wheel...
      </div>
    );
  }

  const isEligible = status?.isEligible;
  const planName = status?.planName || 'FREE';
  const freeSpins = status?.freeSpinsRemaining || 0;
  const isFreeSpin = freeSpins > 0;
  const spinFee = status?.spinFee || 100;
  const taskBalance = status?.taskBalance || 0;
  const affiliateBalance = status?.affiliateBalance || 0;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem 0' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--accent-gold)', padding: '0.4rem 1.25rem', borderRadius: '50px', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: '900', marginBottom: '1rem' }}>
          <Disc size={18} /> VIP &amp; ELITE EXCLUSIVE SPIN &amp; WIN
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
          Spin &amp; Win Cash Wheel
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '560px', margin: '0 auto' }}>
          Upgrade to VIP or ELITE to receive <strong style={{ color: 'var(--accent-gold)' }}>3 FREE SPINS</strong>. All cash prizes won are added directly to your task balance!
        </p>
      </div>

      {/* Non-Eligible Access Lock Card (For FREE / PRO Users) */}
      {!isEligible ? (
        <div className="bg-surface" style={{ padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.35)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--accent-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
            <Lock size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
            Feature Locked for {planName} Members
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            The Spin &amp; Win Cash Wheel is exclusively available for <strong style={{ color: 'var(--accent-gold)' }}>VIP</strong> and <strong style={{ color: 'var(--accent-gold)' }}>ELITE</strong> membership plans. Upgrade your account today to unlock <strong style={{ color: 'var(--accent-gold)' }}>3 Free Spins</strong> and unlimited cash prizes!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <UpgradeBannerButton nextPlanName="VIP" price={1000} />
            <Link href="/vendors" style={{ padding: '0.9rem 1.75rem', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem' }}>
              Buy Activation Coupon
            </Link>
          </div>
        </div>
      ) : (
        
        /* Eligible VIP / ELITE Spin Wheel Interface */
        <div className="bg-surface" style={{ padding: '2.5rem 1.5rem', borderRadius: '24px', border: '1px solid rgba(10, 91, 255, 0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          
          {/* Status Badge: Free Spins vs Paid Spin Banner */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {isFreeSpin ? (
              <div style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', background: 'linear-gradient(135deg, rgba(40,199,111,0.2), rgba(40,199,111,0.05))', border: '1px solid rgba(40,199,111,0.5)', color: 'var(--success)', fontWeight: '900', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gift size={18} /> FREE SPINS REMAINING: {freeSpins} / 3
              </div>
            ) : (
              <div style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} /> Spin Fee: ₦{spinFee} per spin (Deducted from selected wallet)
              </div>
            )}
          </div>

          {/* Wallet Choice Selector (When Free Spins Are Used Up) */}
          {!isFreeSpin && (
            <div style={{ marginBottom: '2rem', padding: '1rem 1.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', width: '100%', maxWidth: '450px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '0.75rem' }}>
                Select Wallet for ₦{spinFee} Spin Fee Deduction:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setWalletChoice('TASK')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: walletChoice === 'TASK' ? '2px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.15)',
                    background: walletChoice === 'TASK' ? 'rgba(10,91,255,0.2)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <div>Task Wallet</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '2px' }}>₦{taskBalance.toLocaleString()}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWalletChoice('AFFILIATE')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: walletChoice === 'AFFILIATE' ? '2px solid var(--success)' : '1px solid rgba(255,255,255,0.15)',
                    background: walletChoice === 'AFFILIATE' ? 'rgba(40,199,111,0.2)' : 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <div>Affiliate Wallet</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '2px' }}>₦{affiliateBalance.toLocaleString()}</div>
                </button>
              </div>
            </div>
          )}

          {/* Top Pointer Indicator */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 30, marginBottom: '-25px' }}>
            <div style={{ width: '0', height: '0', borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: '35px solid var(--accent-gold)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))' }} />
          </div>

          {/* The Spinning Wheel Canvas SVG */}
          <div style={{ position: 'relative', width: '320px', height: '320px', margin: '0 auto 2rem' }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '10px solid rgba(212, 175, 55, 0.8)',
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.4), inset 0 0 20px rgba(0,0,0,0.8)',
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
              overflow: 'hidden',
              position: 'relative'
            }}>

              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                {/* 5 Segments: 72deg each */}
                <g>
                  {/* Segment 0: ₦200 */}
                  <path d="M 50 50 L 100 50 A 50 50 0 0 1 65.45 97.55 Z" fill="#1042a3" stroke="#0a0f1d" strokeWidth="0.5" />
                  {/* Segment 1: ₦500 */}
                  <path d="M 50 50 L 65.45 97.55 A 50 50 0 0 1 9.55 79.39 Z" fill="#d4af37" stroke="#0a0f1d" strokeWidth="0.5" />
                  {/* Segment 2: ₦150 */}
                  <path d="M 50 50 L 9.55 79.39 A 50 50 0 0 1 9.55 20.61 Z" fill="#28c76f" stroke="#0a0f1d" strokeWidth="0.5" />
                  {/* Segment 3: ₦1,000 */}
                  <path d="M 50 50 L 9.55 20.61 A 50 50 0 0 1 65.45 2.45 Z" fill="#ff9f43" stroke="#0a0f1d" strokeWidth="0.5" />
                  {/* Segment 4: ₦2,000 Jackpot */}
                  <path d="M 50 50 L 65.45 2.45 A 50 50 0 0 1 100 50 Z" fill="#ff3b30" stroke="#0a0f1d" strokeWidth="0.5" />
                </g>
              </svg>

              {/* Labels overlay */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <span style={{ position: 'absolute', top: '22%', right: '20%', color: 'white', fontWeight: '900', fontSize: '0.85rem' }}>₦200</span>
                <span style={{ position: 'absolute', bottom: '20%', right: '30%', color: 'black', fontWeight: '900', fontSize: '0.85rem' }}>₦500</span>
                <span style={{ position: 'absolute', bottom: '35%', left: '15%', color: 'white', fontWeight: '900', fontSize: '0.85rem' }}>₦150</span>
                <span style={{ position: 'absolute', top: '35%', left: '15%', color: 'black', fontWeight: '900', fontSize: '0.85rem' }}>₦1,000</span>
                <span style={{ position: 'absolute', top: '18%', left: '38%', color: 'white', fontWeight: '900', fontSize: '0.85rem' }}>₦2,000</span>
              </div>

            </div>

            {/* Center Cap */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)', border: '4px solid white', boxShadow: '0 0 20px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              EARNIX
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSpin}
            disabled={spinning}
            style={{
              padding: '1.25rem 3.5rem',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
              color: '#000',
              fontWeight: '900',
              fontSize: '1.2rem',
              border: 'none',
              cursor: spinning ? 'not-allowed' : 'pointer',
              opacity: spinning ? 0.7 : 1,
              boxShadow: '0 10px 30px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.3s ease',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {spinning ? 'SPINNING...' : isFreeSpin ? `SPIN FOR FREE (${freeSpins} LEFT)` : `SPIN NOW (FEE: ₦${spinFee})`}
          </button>

          {errorMsg && (
            <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)', color: '#ff3b30', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', maxWidth: '480px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {/* Win Announcement Modal */}
          {winResult && (
            <div style={{ marginTop: '2rem', padding: '1.75rem', borderRadius: '16px', background: 'rgba(40,199,111,0.12)', border: '1px solid rgba(40,199,111,0.4)', textAlign: 'center', width: '100%', maxWidth: '480px', animation: 'fadeIn 0.4s ease-in-out' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Trophy size={36} style={{ color: 'var(--accent-gold)' }} />
                <Gift size={36} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
                CONGRATULATIONS!
              </h3>
              <p style={{ color: 'var(--success)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                You won {winResult.prizeLabel}!
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                ₦{winResult.prizeAmount.toLocaleString()} has been added directly to your EARNIX task balance!
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
