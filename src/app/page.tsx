'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main>
      {/* Navigation */}
      <nav className="container" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(10, 91, 255, 0.5)', letterSpacing: '-1px' }}>
            EARNIX
          </div>
        </div>
        
        {/* Desktop Centered Links */}
        <div className="desktop-only" style={{ gap: '2rem', fontSize: '0.95rem', fontWeight: '500' }}>
          <Link href="/" style={{ color: 'white' }}>Home</Link>
          <Link href="#about" style={{ color: 'var(--text-secondary)' }}>About Us</Link>
          <Link href="#plans" style={{ color: 'var(--text-secondary)' }}>Plans</Link>
          <Link href="/vendors" style={{ color: 'var(--text-secondary)' }}>Code Vendors</Link>
          <Link href="/top-earners" style={{ color: 'var(--text-secondary)' }}>Top EARNIX</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Desktop Login Button */}
          <Link href="/login" className="btn-pro desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            Login
          </Link>
          
          {/* Hamburger Icon (Mobile Only) */}
          <button 
            className="mobile-only"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', zIndex: 60 }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Drawer Menu (Mobile) */}
      {isMenuOpen && (
        <div className="mobile-only mobile-flex" style={{ position: 'absolute', top: '80px', right: '0', width: '300px', background: 'var(--surface-color)', padding: '2rem', zIndex: 50, borderLeft: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexDirection: 'column', gap: '1.5rem', boxShadow: '-5px 5px 20px rgba(0,0,0,0.5)' }}>
          <Link href="/" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Home</Link>
          <Link href="#about" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>About Us</Link>
          <Link href="#plans" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Plans</Link>
          <Link href="/vendors" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Code Vendors</Link>
          <Link href="/top-earners" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Top EARNIX</Link>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <Link href="/login" className="btn-pro" style={{ textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Login</Link>
          <Link href="/register" className="btn-primary" style={{ textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Register</Link>
        </div>
      )}

      {/* Hero Section */}
      <section style={{ 
        minHeight: '85vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: '6rem',
        backgroundImage: 'linear-gradient(rgba(5, 5, 5, 0.4), rgba(5, 5, 5, 0.9)), url("/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-2px', textShadow: '0 0 20px rgba(0,0,0,0.8)', maxWidth: '900px' }}>
            Where Luxury<br/>Meets <span className="text-blue">Earnings!!!</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', marginBottom: '3rem', lineHeight: '1.6' }}>
            EARNIX is Luxury. EARNIX is SoftLife and Stress-free Earnings personified!!!<br/>
            From Lifestyle Earnings, to Real-time, to Code Vendors, to DarkMode benefits, we have it all covered...<br/>
            #EarnixLife, Softlife!
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem' }}>Join Us</Link>
            <Link href="#about" className="btn-pro" style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* Features & Plans */}
      <section id="plans" className="container" style={{ padding: '6rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: '800', marginBottom: '3rem', letterSpacing: '-1px' }}>Choose Your Path</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* FREE Plan */}
          <div className="bg-surface" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>FREE Plan</h3>
            <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '2rem' }}>₦0</div>
            <ul style={{ listStyle: 'none', marginBottom: '3rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
              <li>Welcome Bonus: <strong style={{color: 'white'}}>₦50</strong></li>
              <li>Sponsored Task: <strong style={{color: 'white'}}>₦80</strong></li>
              <li>No Referral Commission</li>
              <li>Standard Dashboard Access</li>
            </ul>
            <Link href="/register?plan=free" className="btn-pro" style={{ width: '100%', display: 'block', borderRadius: '50px', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>Start Free</Link>
          </div>

          {/* PRO Plan */}
          <div className="bg-surface" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px solid var(--accent-gold)', position: 'relative', borderRadius: '24px' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--accent-gold)', color: '#000', padding: '0.4rem 1rem', borderRadius: '9999px', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)' }}>RECOMMENDED</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-gold)', fontWeight: '700' }}>PRO Plan</h3>
            <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--accent-gold)' }}>₦500 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Activation</span></div>
            <ul style={{ listStyle: 'none', marginBottom: '3rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
              <li>Welcome Bonus: <strong style={{color: 'white'}}>₦100</strong></li>
              <li>Daily Login Bonus: <strong style={{color: 'white'}}>₦50</strong></li>
              <li>Sponsored Task: <strong style={{color: 'white'}}>₦120</strong></li>
              <li className="text-gold">Referral Commission: <strong>₦250</strong></li>
            </ul>
            <Link href="/register?plan=pro" className="btn-primary" style={{ width: '100%', display: 'block', borderRadius: '50px', background: 'var(--accent-gold)', color: '#000', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}>Upgrade to PRO</Link>
          </div>

        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>EARNIX Version 1.0 &copy; 2026. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem' }}>
          <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Privacy Policy</Link>
        </div>
      </footer>
    </main>
  );
}
