'use client';

import { ThumbsUp, Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight, Wallet, Download, Share2, KeyRound, Hash } from 'lucide-react';

interface WithdrawalSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  type: 'AFFILIATE' | 'TASK';
  date?: Date | string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  referenceCode?: string;
  sessionId?: string;
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
  referenceCode,
  sessionId,
}: WithdrawalSuccessModalProps) {
  if (!isOpen) return null;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
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

  const finalRefCode = referenceCode || `ERX-WD-${Math.floor(100000 + Math.random() * 900000)}`;
  const finalSessionId = sessionId || `SES-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const downloadReceipt = () => {
    const img = new Image();
    img.src = '/earnix-logo.jpg';
    img.crossOrigin = 'anonymous';
    img.onload = () => renderCanvasAndDownload(img);
    img.onerror = () => renderCanvasAndDownload();
  };

  const renderCanvasAndDownload = (logoImg?: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 860;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Solid Clean White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 650, 860);

    // 2. Small Font Watermark Pattern Layer Across Canvas
    ctx.save();
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.035)';
    ctx.font = '600 10px monospace';
    const watermarkText = 'EARNIX VERIFIED RECEIPT • OFFICIAL TRANSACTION • SECURITY LOGGED • ';
    for (let y = -200; y < 1100; y += 36) {
      for (let x = -300; x < 900; x += 340) {
        ctx.fillText(watermarkText, x, y);
      }
    }
    ctx.restore();

    // 3. Top Decorative Gradient Line
    const gradient = ctx.createLinearGradient(0, 0, 650, 0);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#10b981');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 650, 8);

    // 4. Logo Header
    if (logoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(325, 65, 30, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, 295, 35, 60, 60);
      ctx.restore();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(325, 65, 30, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Title & Status
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EARNIX DIGITAL RECEIPT', 325, 122);

    ctx.fillStyle = '#059669';
    ctx.font = '800 13px sans-serif';
    ctx.fillText('✓ WITHDRAWAL SUCCESSFUL & VERIFIED', 325, 146);

    // Amount Card Background
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(50, 168, 550, 92);
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 168, 550, 92);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('AMOUNT WITHDRAWN', 325, 194);

    ctx.fillStyle = '#059669';
    ctx.font = '900 36px sans-serif';
    ctx.fillText(`₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 325, 238);

    // Details Card Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(50, 280, 550, 485);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(50, 280, 550, 485);

    const drawRow = (label: string, value: string, y: number, isHighlighted = false) => {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, 75, y);

      ctx.fillStyle = isHighlighted ? '#059669' : '#0f172a';
      ctx.font = isHighlighted ? 'bold 13px monospace' : 'bold 14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value, 575, y);

      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(75, y + 16);
      ctx.lineTo(575, y + 16);
      ctx.stroke();
    };

    let startY = 320;
    drawRow('Date', formattedFullDate, startY);
    startY += 55;
    drawRow('Time', formattedTime, startY);
    startY += 55;
    drawRow('Source Wallet', walletLabel, startY);
    if (accountName) {
      startY += 55;
      drawRow('Account Name', accountName, startY);
    }
    startY += 55;
    drawRow('Bank Name', bankName || 'N/A', startY);
    startY += 55;
    drawRow('Account Number', accountNumber || 'N/A', startY);
    startY += 55;
    drawRow('Traceable Ref Code', finalRefCode, startY, true);
    startY += 55;
    drawRow('Session ID', finalSessionId, startY, true);

    // Footer Watermark Note
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('This receipt is electronically generated and verified by EARNIX Platform.', 325, 798);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 11px sans-serif';
    ctx.fillText('SoftLife & Stress-Free Earnings', 325, 818);

    // Download PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `EARNIX-Receipt-${finalRefCode}.png`;
    link.href = dataUrl;
    link.click();
  };

  const shareReceipt = async () => {
    const text = `💸 *EARNIX Withdrawal Successful!* 💸\n\n• *Amount:* ₦${amount.toLocaleString('en-NG')}\n• *Wallet:* ${walletLabel}\n• *Ref Code:* ${finalRefCode}\n• *Session ID:* ${finalSessionId}\n• *Date:* ${formattedFullDate} at ${formattedTime}\n\nJoin EARNIX today for softlife & stress-free earnings!`;
    
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

        {/* Hero Earnix Logo Container */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
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
              overflow: 'hidden',
              border: '2px solid #10b981'
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
            <CheckCircle2 size={13} /> Request Submitted &amp; Logged
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wallet size={14} style={{ color: '#10b981' }} /> Source Wallet
            </span>
            <span style={{ color: '#ffffff', fontWeight: '600' }}>
              {walletLabel}
            </span>
          </div>

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

          {/* Traceable Reference Code */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem', marginTop: '0.1rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Hash size={13} style={{ color: '#10b981' }} /> Ref Code
            </span>
            <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {finalRefCode}
            </span>
          </div>

          {/* Session ID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <KeyRound size={13} style={{ color: '#3b82f6' }} /> Session ID
            </span>
            <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.78rem' }}>
              {finalSessionId}
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

