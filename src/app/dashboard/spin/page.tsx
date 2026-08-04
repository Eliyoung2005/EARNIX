'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UpgradeBannerButton from '../UpgradeBannerButton';
import { Disc, Lock, Gift, Zap, Trophy } from 'lucide-react';
import { useCurrency } from '@/lib/CurrencyContext';

const SEGMENTS = [
  { index: 0, label: 200, startX: 50, startY: 0, endX: 85.36, endY: 14.64, tx: 63.4, ty: 17.7, mid: 22.5, color: '#1042a3', textColor: '#ffffff' },
  { index: 1, label: 500, startX: 85.36, startY: 14.64, endX: 100, endY: 50, tx: 82.3, ty: 36.6, mid: 67.5, color: '#d4af37', textColor: '#000000' },
  { index: 2, label: 'Try Again', startX: 100, startY: 50, endX: 85.36, endY: 85.36, tx: 82.3, ty: 63.4, mid: 112.5, color: '#6e7d88', textColor: '#ffffff' },
  { index: 3, label: 1000, startX: 85.36, startY: 85.36, endX: 50, endY: 100, tx: 63.4, ty: 82.3, mid: 157.5, color: '#ff9f43', textColor: '#000000' },
  { index: 4, label: 'Free Ticket', startX: 50, startY: 100, endX: 14.64, endY: 85.36, tx: 36.6, ty: 82.3, mid: 202.5, color: '#9b5de5', textColor: '#ffffff' },
  { index: 5, label: 2000, startX: 14.64, startY: 85.36, endX: 0, endY: 50, tx: 17.7, ty: 63.4, mid: 247.5, color: '#ff3b30', textColor: '#ffffff' },
  { index: 6, label: 150, startX: 0, startY: 50, endX: 14.64, endY: 14.64, tx: 17.7, ty: 36.6, mid: 292.5, color: '#28c76f', textColor: '#ffffff' },
  { index: 7, label: 'Try Again', startX: 14.64, startY: 14.64, endX: 50, endY: 0, tx: 36.6, ty: 17.7, mid: 337.5, color: '#6e7d88', textColor: '#ffffff' },
];

export default function SpinWheelPage() {
  const { fmt, fmtTask, symbol } = useCurrency();
  const router = useRouter();
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

      // Calculate Rotation Angle precisely so the pointer at top (0 degrees) matches winning index.
      const winningIndex = data.winningIndex;
      const midAngle = winningIndex * 45 + 22.5;
      const extraRotations = 360 * 5; // 5 full spins
      
      const currentAngle = rotation % 360;
      const targetAngle = (360 - midAngle) % 360;
      let diff = targetAngle - currentAngle;
      if (diff <= 0) diff += 360;
      const finalRotation = rotation + extraRotations + diff;

      setRotation(finalRotation);

      // Wait for spin animation (4.2 seconds)
      setTimeout(() => {
        setSpinning(false);
        setWinResult(data);
        fetchStatus();
        router.refresh();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('balance-updated'));
        }
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
          Upgrade to VIP or ELITE to receive <strong style={{ color: 'var(--accent-gold)' }}>Free Spins</strong>. All cash prizes won are added directly to your task balance!
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
            The Spin &amp; Win Cash Wheel is exclusively available for <strong style={{ color: 'var(--accent-gold)' }}>VIP</strong> and <strong style={{ color: 'var(--accent-gold)' }}>ELITE</strong> membership plans. Upgrade your account today to unlock <strong style={{ color: 'var(--accent-gold)' }}>Free Spins</strong> and unlimited cash prizes!
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
              <div style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', background: 'linear-gradient(135deg, rgba(155,93,229,0.2), rgba(155,93,229,0.05))', border: '1px solid rgba(155,93,229,0.5)', color: '#9b5de5', fontWeight: '900', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gift size={18} /> FREE SPINS REMAINING: {freeSpins}
              </div>
            ) : (
              <div style={{ padding: '0.6rem 1.5rem', borderRadius: '50px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} /> Spin Fee: {fmt(spinFee)} per spin (Deducted from selected wallet)
              </div>
            )}
          </div>

          {/* Wallet Choice Selector (When Free Spins Are Used Up) */}
          {!isFreeSpin && (
            <div style={{ marginBottom: '2rem', padding: '1rem 1.5rem', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', width: '100%', maxWidth: '450px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '0.75rem' }}>
                Select Wallet for {fmt(spinFee)} Spin Fee Deduction:
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '2px' }}>{fmtTask(taskBalance)}</div>
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '2px' }}>{fmt(affiliateBalance)}</div>
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

              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {SEGMENTS.map((seg) => (
                  <g key={seg.index}>
                    <path
                      d={`M 50 50 L ${seg.startX} ${seg.startY} A 50 50 0 0 1 ${seg.endX} ${seg.endY} Z`}
                      fill={seg.color}
                      stroke="#0a0f1d"
                      strokeWidth="0.75"
                    />
                    <text
                      x={seg.tx}
                      y={seg.ty}
                      fill={seg.textColor}
                      fontSize="3.8"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${seg.mid}, ${seg.tx}, ${seg.ty})`}
                    >
                      {typeof seg.label === 'number' ? fmtTask(seg.label) : seg.label}
                    </text>
                  </g>
                ))}
              </svg>

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
            {spinning ? 'SPINNING...' : isFreeSpin ? `SPIN FOR FREE (${freeSpins} LEFT)` : `SPIN NOW (FEE: ${fmt(spinFee)})`}
          </button>

          {errorMsg && (
            <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)', color: '#ff3b30', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', maxWidth: '480px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {/* Win Announcement Modal */}
          {winResult && (
            <div style={{ marginTop: '2rem', padding: '1.75rem', borderRadius: '16px', background: winResult.isTryAgain ? 'rgba(255,59,48,0.12)' : winResult.isFreeTicket ? 'rgba(155,93,229,0.12)' : 'rgba(40,199,111,0.12)', border: winResult.isTryAgain ? '1px solid rgba(255,59,48,0.4)' : winResult.isFreeTicket ? '1px solid rgba(155,93,229,0.4)' : '1px solid rgba(40,199,111,0.4)', textAlign: 'center', width: '100%', maxWidth: '480px', animation: 'fadeIn 0.4s ease-in-out' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {winResult.isTryAgain ? (
                  <span style={{ fontSize: '2rem' }}>😢</span>
                ) : winResult.isFreeTicket ? (
                  <Gift size={36} style={{ color: '#9b5de5' }} />
                ) : (
                  <Trophy size={36} style={{ color: 'var(--accent-gold)' }} />
                )}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
                {winResult.isTryAgain ? 'TRY AGAIN!' : winResult.isFreeTicket ? 'FREE TICKET WON!' : 'CONGRATULATIONS!'}
              </h3>
              <p style={{ color: winResult.isTryAgain ? '#ff3b30' : winResult.isFreeTicket ? '#9b5de5' : 'var(--success)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {winResult.isTryAgain ? 'You won nothing this time.' : winResult.isFreeTicket ? 'You won 1 Free Spin Ticket!' : `You won ${winResult.prizeLabel}!`}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {winResult.isTryAgain 
                  ? "Don't give up! Spin again to try your luck next time." 
                  : winResult.isFreeTicket 
                  ? 'Your free spin balance has been updated with +1 free spin.' 
                  : `${fmtTask(winResult.prizeAmount)} has been added directly to your EARNIX task balance!`}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
