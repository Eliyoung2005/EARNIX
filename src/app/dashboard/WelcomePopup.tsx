'use client';

import { useState } from 'react';
import { markWelcomePopupAsSeen } from './actions';

export default function WelcomePopup({ 
  title, 
  message 
}: { 
  title: string, 
  message: string 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleDismiss = async () => {
    setIsSaving(true);
    // Optimistically hide the popup
    setIsVisible(false);
    
    // Call server action to mark as seen
    try {
      await markWelcomePopupAsSeen();
    } catch (e) {
      console.error(e);
      // If it fails, they might see it again on next login, which is fine
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
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
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        
        <div style={{ 
          width: '80px', height: '80px', 
          backgroundColor: 'var(--accent-blue)', 
          borderRadius: '50%', 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          margin: '0 auto 2rem auto',
          boxShadow: '0 0 30px rgba(10, 91, 255, 0.4)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>👋</span>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', color: 'white' }}>
          {title}
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          {message}
        </p>

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
      </div>
    </div>
  );
}
