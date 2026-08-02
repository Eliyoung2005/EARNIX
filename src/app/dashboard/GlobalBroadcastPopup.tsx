'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, Bell } from 'lucide-react';

interface GlobalBroadcastPopupProps {
  notification: {
    id: string;
    title: string;
    message: string;
    link?: string | null;
    createdAt: Date | string;
  };
}

export default function GlobalBroadcastPopup({ notification }: GlobalBroadcastPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen this specific broadcast ID
    const seenBroadcasts = localStorage.getItem('seen_broadcasts');
    let seenList: string[] = [];
    if (seenBroadcasts) {
      try {
        seenList = JSON.parse(seenBroadcasts);
      } catch (e) {
        seenList = [];
      }
    }

    if (!seenList.includes(notification.id)) {
      // Show popup if not seen yet
      setIsOpen(true);
    }
  }, [notification.id]);

  const handleDismiss = () => {
    // Mark as seen in localStorage
    const seenBroadcasts = localStorage.getItem('seen_broadcasts');
    let seenList: string[] = [];
    if (seenBroadcasts) {
      try {
        seenList = JSON.parse(seenBroadcasts);
      } catch (e) {
        seenList = [];
      }
    }

    if (!seenList.includes(notification.id)) {
      seenList.push(notification.id);
      localStorage.setItem('seen_broadcasts', JSON.stringify(seenList));
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 99999,
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div 
        className="bg-surface animate-scaleUp"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          border: '1.5px solid rgba(10, 91, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(10, 91, 255, 0.1)',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* Dismiss X icon top-right */}
        <button 
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        >
          <X size={18} />
        </button>

        {/* Brand/Notification Icon Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(10, 91, 255, 0.5)',
              border: '2px solid var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10, 91, 255, 0.15)'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/earnix-logo.jpg" alt="Earnix Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {/* Badge indicator */}
          <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--accent-blue)', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
            <Bell size={11} fill="white" />
          </div>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', marginBottom: '1rem', letterSpacing: '-0.5px' }}>
          {notification.title}
        </h2>

        {/* Message */}
        <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', textAlign: 'center' }}>
          {notification.message}
        </p>

        {/* Action Button Row */}
        {notification.link ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a 
              href={notification.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, var(--accent-blue), #0849cc)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(10, 91, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                transition: 'transform 0.15s ease'
              }}
            >
              Open Link / View Details <ExternalLink size={16} />
            </a>
            
            <button 
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Dismiss Notice
            </button>
          </div>
        ) : (
          <button 
            onClick={handleDismiss}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
              transition: 'background 0.2s'
            }}
          >
            I Understand
          </button>
        )}

        {/* Animation Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleUp {
            animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
        `}} />
      </div>
    </div>
  );
}
