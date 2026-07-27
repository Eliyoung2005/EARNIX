'use client';

import { useState } from 'react';

const testimonials = [
  {
    name: 'Chinedu O.',
    role: 'PRO Plan Earner',
    text: '"Working with EARNIX has been the most enjoyable experience of my life. I get to earn for just completing simple tasks, and the affiliate bonuses drop instantly!"',
    initial: 'C',
    color: '#0A5BFF',
    earned: '₦45,000 Earned'
  },
  {
    name: 'Amina Y.',
    role: 'Top Affiliate',
    text: '"I was skeptical at first, but upgrading to PRO was the best decision. The ₦250 referral commission adds up so fast. EARNIX is truly SoftLife!"',
    initial: 'A',
    color: '#D4AF37',
    earned: '₦120,000 Earned'
  },
  {
    name: 'Oluwaseun A.',
    role: 'Student & Earner',
    text: '"This platform pays seamlessly! The dark mode is sleek, tasks are quick to finish, and withdrawals drop directly into my bank account within minutes!"',
    initial: 'O',
    color: '#10b981',
    earned: '₦32,500 Earned'
  },
  {
    name: 'Ngozi E.',
    role: 'Stay-at-home Mom',
    text: '"EARNIX turned my free time into real income. I just share links on WhatsApp and watch videos. It\'s stress-free earnings personified!"',
    initial: 'N',
    color: '#8b5cf6',
    earned: '₦78,000 Earned'
  },
  {
    name: 'Emmanuel K.',
    role: 'PRO Earner',
    text: '"The customer support is top-notch, vendor codes are verified instantly, and daily login bonuses make earning effortless every day."',
    initial: 'E',
    color: '#ec4899',
    earned: '₦54,000 Earned'
  }
];

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate list to create 100% smooth infinite marquee loop
  const marqueeList = [...testimonials, ...testimonials];

  return (
    <section id="about" className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', overflow: 'hidden' }}>
      <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
        Live Earner Testimonials
      </div>
      <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1px' }}>
        What Our <span className="text-blue">SoftLife</span> Earners Say
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
        Join thousands of verified members earning daily task rewards, referral commissions, and instant payouts across Nigeria.
      </p>

      {/* Infinite Horizontal Motion Slider */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          overflow: 'hidden', 
          padding: '1.5rem 0',
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="animate-marquee"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            gap: '1.75rem'
          }}
        >
          {marqueeList.map((item, index) => (
            <div 
              key={index} 
              className="bg-surface" 
              style={{ 
                width: '360px', 
                minWidth: '320px',
                flexShrink: 0,
                padding: '2rem 1.75rem', 
                borderRadius: '20px', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.5))',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}
            >
              <div>
                {/* 5-Star Rating & Earned Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', color: 'var(--accent-gold)' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '50px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 'bold' }}>
                    {item.earned}
                  </span>
                </div>

                {/* Testimonial Text */}
                <p style={{ fontSize: '0.98rem', fontStyle: 'normal', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {item.text}
                </p>
              </div>

              {/* User Avatar & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  backgroundColor: item.color, 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: `0 0 15px ${item.color}40`
                }}>
                  {item.initial}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
        💡 Hover or touch cards to pause scrolling motion
      </div>
    </section>
  );
}
