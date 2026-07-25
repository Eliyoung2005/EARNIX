'use client';

import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Chinedu O.',
    role: 'PRO Plan Earner',
    text: '"Working with EARNIX has been the most enjoyable experience of my life. I get to earn for just completing simple tasks, and the affiliate bonuses are insane... I love it!!"',
    initial: 'C',
    color: '#0A5BFF'
  },
  {
    name: 'Amina Y.',
    role: 'Top Affiliate',
    text: '"I was skeptical at first, but upgrading to PRO was the best decision. The ₦250 referral commission adds up so fast. EARNIX is truly SoftLife!"',
    initial: 'A',
    color: '#D4AF37'
  },
  {
    name: 'Oluwaseun A.',
    role: 'Student & Earner',
    text: '"This platform pays seamlessly! The dark mode is sleek, the daily login bonuses keep me coming back, and withdrawals drop instantly. Highly recommended!"',
    initial: 'O',
    color: '#10b981'
  },
  {
    name: 'Ngozi E.',
    role: 'Stay-at-home Mom',
    text: '"EARNIX turned my free time into real money. I just share links on WhatsApp and watch videos. It\'s stress-free earnings personified!"',
    initial: 'N',
    color: '#8b5cf6'
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // trigger fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setFade(true); // trigger fade in
      }, 500); // Wait for fade out to complete before changing data
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <section className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
      <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
        Testimonial
      </div>
      <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '2rem' }}>
        What Our Users Say About Us
      </h2>

      {/* Stars */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '3rem', color: 'var(--accent-gold)' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        ))}
      </div>

      {/* Sliding Content */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        transition: 'opacity 0.5s ease-in-out',
        opacity: fade ? 1 : 0
      }}>
        <p style={{ 
          fontSize: '1.25rem', 
          fontStyle: 'italic', 
          lineHeight: '1.8', 
          color: 'var(--text-secondary)',
          marginBottom: '3rem'
        }}>
          {current.text}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%', 
            backgroundColor: current.color, 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            {current.initial}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{current.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{current.role}</div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
        {testimonials.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setCurrentIndex(idx);
                setFade(true);
              }, 300);
            }}
            style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: idx === currentIndex ? 'var(--accent-blue)' : 'rgba(255,255,255,0.2)', 
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
