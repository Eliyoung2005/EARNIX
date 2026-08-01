'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { markWelcomePopupAsSeen } from './actions';

export default function WelcomePopup({ 
  title, 
  message,
  link
}: { 
  title: string;
  message: string;
  link?: string | null;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleDismiss = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setIsVisible(false);
    try {
      await markWelcomePopupAsSeen();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setIsVisible(false);
    try {
      await markWelcomePopupAsSeen();
    } catch (e) {
      console.error(e);
    }
    if (link) {
      // Open external links in a new tab, internal links in same tab
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        router.push(link);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, var(--surface-color), #1a1a1a)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={handleDismiss}
          disabled={isSaving}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            transition: 'background 0.2s ease'
          }}
          title="Dismiss"
        >
          ×
        </button>
        
        {/* Icon */}
        <div style={{ 
          width: '80px', height: '80px', 
          backgroundColor: 'var(--accent-blue)', 
          borderRadius: '50%', 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          margin: '0 auto 2rem auto',
          boxShadow: '0 0 30px rgba(10, 91, 255, 0.4)'
        }}>
          <Sparkles size={40} style={{ color: '#fff' }} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', color: 'white' }}>
          {title}
        </h2>
        
        {/* Message */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          {message}
        </p>

        {/* Action Button(s) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {link ? (
            <>
              {/* Primary CTA — Clickable link button */}
              <button
                onClick={handleAction}
                disabled={isSaving}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '1.2rem', 
                  borderRadius: '50px', 
                  fontSize: '1.05rem', 
                  fontWeight: 'bold',
                  boxShadow: '0 10px 20px rgba(10, 91, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Get Started
              </button>
              {/* Secondary — Dismiss without following link */}
              <button
                onClick={handleDismiss}
                disabled={isSaving}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px'
                }}
              >
                Maybe later
              </button>
            </>
          ) : (
            /* No link — plain dismiss button */
            <button 
              onClick={handleDismiss} 
              disabled={isSaving}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                padding: '1.2rem', 
                borderRadius: '50px', 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                boxShadow: '0 10px 20px rgba(10, 91, 255, 0.3)'
              }}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
