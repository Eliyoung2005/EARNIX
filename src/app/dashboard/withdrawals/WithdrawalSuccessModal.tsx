'use client';

import { ThumbsUp, Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight, Wallet, Download, Share2 } from 'lucide-react';

interface WithdrawalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  type: 'AFFILIATE' | 'TASK';
  date?: Date | string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export default function WithdrawalSuccessModal({
  isOpen,
  onClose,
  amount,
  type,
  date = new Date(),
  bankName,
  accountNumber,
  accountName,
}: WithdrawalSuccessModalProps) {
  if (!isOpen) return null;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format Date & Time cleanly
  const formattedFullDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const walletLabel = type === 'AFFILIATE' ? 'Affiliate Wallet' : 'Task + Bonus Wallet';
  const refCode = `WD-${Math.floor(100000 + Math.random() * 900000)}`;

  const downloadReceipt = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 700);

    // Draw Top Decorative Bar
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#10b981');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 10);

    // Draw Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EARNIX DIGITAL RECEIPT', 300, 60);

    ctx.fillStyle = '#34d399';
    ctx.font = '800 16px sans-serif';
    ctx.fillText('✓ WITHDRAWAL SUCCESSFUL', 300, 100);

    // Draw Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(50, 130);
    ctx.lineTo(550, 130);
    ctx.stroke();

    // Draw Amount Withdrawn
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('AMOUNT WITHDRAWN', 300, 170);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`, 300, 230);

    // Draw Detail Box Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(50, 270, 500, 320);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(50, 270, 500, 320);

    // Detail Fields Helper
    const drawRow = (label: string, value: string, y: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, 80, y);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value, 520, y);
    };

    drawRow('Date', formattedFullDate, 320);
    drawRow('Time', formattedTime, 370);
    drawRow('Source Wallet', walletLabel, 420);
    drawRow('Destination', bankName ? `${bankName} (${accountNumber})` : 'N/A', 470);
    drawRow('Ref Code', refCode, 520);
    drawRow('Status', 'PAID / PROCESSED', 570);

    // Draw Footer Message
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'italic 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for choosing EARNIX - SoftLife & Stress-Free Earnings', 300, 640);

    // Create Download Link
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `EARNIX-Receipt-${refCode}.png`;
    link.href = dataUrl;
    link.click();
  };

  const shareReceipt = async () => {
    const text = `💸 *EARNIX Withdrawal Successful!* 💸\n\n• *Amount:* ₦${amount.toLocaleString('en-NG')}\n• *Wallet:* ${walletLabel}\n• *Ref Code:* ${refCode}\n• *Date:* ${formattedFullDate} at ${formattedTime}\n\nJoin EARNIX today for softlife & stress-free earnings!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EARNIX Withdrawal Receipt',
          text: text,
        });
      } catch (err) {
        console.error('Sharing failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert('Receipt details copied to clipboard! You can paste and share it anywhere.');
      } catch (err) {
        alert('Failed to copy to clipboard.');
      }
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15), transparent 70%), radial-gradient(ellipse at bottom, rgba(10, 91, 255, 0.1), transparent 70%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '24px',
          padding: '2.25rem 1.75rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.2)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top bar */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #10b981, #3b82f6, #10b981)'
          }}
        />

        {/* Hero Thumbs Up Icon Container */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
          {/* Animated Background Ring Glow */}
          <div 
            style={{
              position: 'absolute',
              inset: '-12px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0) 70%)',
              animation: 'pulseGlow 2s infinite ease-in-out',
              pointerEvents: 'none'
            }}
          />
          <div 
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/earnix-logo.jpg" alt="Earnix Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Main Title & Status Badge */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '0.3rem 0.9rem',
              borderRadius: '50px',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '0.65rem'
            }}
          >
            <CheckCircle2 size={13} /> Request Submitted
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
            Withdrawal Successful!
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.88rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Your withdrawal request has been received and is queued for instant processing.
          </p>
        </div>

        {/* Amount Display Card */}
        <div 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>
            Amount Withdrawn
          </span>
          <div style={{ fontSize: '2.25rem', fontWeight: '900', color: '#10b981', letterSpacing: '-0.5px' }}>
            ₦{amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Detail Breakdown Grid */}
        <div 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '1rem 1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            fontSize: '0.84rem'
          }}
        >
          {/* Date & Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} style={{ color: '#3b82f6' }} /> Date &amp; Time
            </span>
            <span style={{ color: '#ffffff', fontWeight: '600', textAlign: 'right' }}>
              {formattedFullDate}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} style={{ color: '#f59e0b' }} /> Timestamp
            </span>
            <span style={{ color: '#f59e0b', fontWeight: '700' }}>
              {formattedTime}
            </span>
          </div>

          {/* Source Wallet */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wallet size={14} style={{ color: '#10b981' }} /> Source Wallet
            </span>
            <span style={{ color: '#ffffff', fontWeight: '600' }}>
              {walletLabel}
            </span>
          </div>

          {/* Target Bank Info if available */}
          {(bankName || accountNumber) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} style={{ color: '#a855f7' }} /> Destination
              </span>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>
                {bankName ? bankName : ''} {accountNumber ? `(${accountNumber})` : ''}
              </span>
            </div>
          )}

          {/* Reference ID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem', marginTop: '0.1rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Ref Code</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {refCode}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <button
            onClick={downloadReceipt}
            style={{
              padding: '0.8rem',
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s'
            }}
          >
            <Download size={16} /> Download
          </button>
          
          <button
            onClick={shareReceipt}
            style={{
              padding: '0.8rem',
              borderRadius: '50px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#3b82f6',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s'
            }}
          >
            <Share2 size={16} /> Share Receipt
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.9rem',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'transform 0.15s ease, boxShadow 0.15s ease'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Great, Got It <ArrowRight size={18} />
        </button>

        {/* Inline styles for keyframe animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
        `}} />
      </div>
    </div>
  );
}
