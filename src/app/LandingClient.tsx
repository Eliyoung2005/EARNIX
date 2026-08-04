'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Testimonials from './Testimonials';



import { useCurrency } from '@/lib/CurrencyContext';

export default function LandingClient({ initialPlans, initialVendors }: { initialPlans: any[], initialVendors: any[] }) {
  const { fmt, fmtTask, symbol } = useCurrency();

  const defaultPlans = [
    {
      id: 'FREE',
      name: 'FREE',
      level: 1,
      price: 0,
      welcomeBonus: 50,
      dailyLoginBonus: 50,
      taskReward: 10,
      referralCommission: 0,
      features: [`${symbol}50 Daily Login Bonus`, 'Daily Task Access', 'Affiliate Earnings']
    },
    {
      id: 'PRO',
      name: 'PRO',
      level: 2,
      price: 500,
      welcomeBonus: 100,
      dailyLoginBonus: 50,
      taskReward: 50,
      referralCommission: 250,
      features: ['Premium Task Access', 'High Commission Rate', 'Fast Withdrawal']
    }
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>(initialPlans || defaultPlans);
  const [vendors, setVendors] = useState<any[]>(initialVendors || []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  useEffect(() => {
    fetch(`/api/plans?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(console.error);

    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVendors(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <main>
      {/* Navigation */}
      <header className="nav-glass">
        <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
          
          {/* Brand Logo & Icon */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 12px rgba(10, 91, 255, 0.4)', border: '1.5px solid var(--accent-blue)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/earnix-logo.jpg" alt="Earnix Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.8px' }}>
              EARNIX
            </div>
          </Link>
          
          {/* Desktop Centered Links */}
          <div className="desktop-only" style={{ gap: '0.5rem', fontSize: '0.9rem', alignItems: 'center' }}>
            <Link href="/" className="nav-link nav-link-active">Home</Link>
            <Link href="#about" className="nav-link">About Us</Link>
            <Link href="#plans" className="nav-link">Plans</Link>
            <Link href="/vendors" className="nav-link">Code Vendors</Link>
            <Link href="/validate-code" className="nav-link">Verify Code</Link>
            <Link href="/top-earners" className="nav-link">Top EARNIX</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Desktop Login Button */}
            <Link href="/login" className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '50px', background: 'var(--accent-blue)', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(10, 91, 255, 0.4)', transition: 'all 0.25s ease' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
              Login
            </Link>

          {/* Hamburger Button — Mobile Only. Hidden when drawer is open (drawer has its own close X) */}
          <button
            id="hamburger-btn"
            type="button"
            className="mobile-only"
            onClick={toggleMenu}
            aria-label="Open Menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              cursor: 'pointer',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              // Hide (but keep layout space) when drawer is open so the nav X doesn't overlap drawer X
              opacity: isMenuOpen ? 0 : 1,
              visibility: isMenuOpen ? 'hidden' : 'visible',
            }}
          >
            {/* Always shows ☰ — close X is inside the drawer */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="19" y2="6" />
              <line x1="3" y1="11" x2="19" y2="11" />
              <line x1="3" y1="16" x2="19" y2="16" />
            </svg>
          </button>
        </div>
      </nav>
      </header>

      {/* Backdrop — always in DOM, toggled via class for smooth fade */}
      <div
        className={`drawer-backdrop${isMenuOpen ? ' backdrop-visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Drawer — always in DOM, slides in/out via CSS transform */}
      <div
        id="mobile-drawer"
        className={`mobile-drawer${isMenuOpen ? ' drawer-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-blue)', letterSpacing: '1px' }}>
            EARNIX
          </span>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close Menu"
            style={{
              background: 'rgba(255,59,48,0.15)',
              border: '1px solid rgba(255,59,48,0.5)',
              color: '#ff3b30',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="14" y2="14" />
              <line x1="14" y1="2" x2="2" y2="14" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        {([
          { href: '/', label: 'Home' },
          { href: '#about', label: 'About Us' },
          { href: '#plans', label: 'Plans' },
          { href: '/vendors', label: 'Code Vendors' },
          { href: '/validate-code', label: 'Verify Code' },
          { href: '/top-earners', label: 'Top EARNIX' },
        ] as { href: string; label: string }[]).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.9rem 0.5rem',
              fontSize: '1.05rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              transition: 'color 0.2s, padding-left 0.2s',
            }}
          >
            {item.label}
          </Link>
        ))}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Link
            href="/login"
            className="btn-primary"
            style={{ textAlign: 'center', borderRadius: '50px', padding: '0.85rem' }}
            onClick={closeMenu}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="btn-pro"
            style={{ textAlign: 'center', borderRadius: '50px', padding: '0.85rem' }}
            onClick={closeMenu}
          >
            Register
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ 
        minHeight: '85vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem',
        paddingTop: '6rem',
        backgroundImage: 'linear-gradient(var(--hero-overlay-start), var(--hero-overlay-end)), url("/hero-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Floating Elements for Desktop */}
        <div className="animate-float-reverse desktop-only" style={{ position: 'absolute', top: '40%', right: '8%', background: 'rgba(255,255,255,0.95)', padding: '1rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', color: '#000', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 10 }}>
          <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem' }}>Withdrawal Alert</div>
            <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '2px' }}>You just received {fmt(5000)}</div>
          </div>
        </div>

        <div className="animate-float-slow desktop-only" style={{ position: 'absolute', bottom: '10%', right: '6%', background: 'rgba(255,255,255,0.95)', padding: '1.5rem', borderRadius: '24px', color: '#000', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', minWidth: '320px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Daily Tasks</div>
            <div style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.85rem', color: '#444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--accent-blue)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span> Watch Videos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--accent-blue)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></span> Instagram Post
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--accent-blue)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg></span> TikTok Share
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--accent-blue)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></span> Visit Websites
            </div>
          </div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 20 }}>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-2px', textShadow: '0 0 20px rgba(0,0,0,0.8)', maxWidth: '900px' }}>
            Where Luxury<br/>Meets <span className="text-blue">Earnings!!!</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem', lineHeight: '1.6' }}>
            EARNIX is Luxury. EARNIX is SoftLife and Stress-free Earnings personified!!!<br/>
            From Lifestyle Earnings, to Real-time, to Code Vendors, to DarkMode benefits, we have it all covered...<br/>
            #EarnixLife, Softlife!
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(10, 91, 255, 0.4)' }}>Join Us</Link>
            <Link href="/validate-code" className="btn-pro" style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Verify Code</Link>
            <Link href="#about" className="btn-pro" style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* Features & Plans */}
      <section id="plans" className="container" style={{ padding: '6rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: '800', marginBottom: '3rem', letterSpacing: '-1px', background: 'linear-gradient(135deg, var(--accent-blue), #00d2ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
          Start Today Here
        </h2>
        
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {plans.map(plan => {
            const isPremium = Boolean(plan.level > 1 || plan.price > 0 || plan.name.toUpperCase().includes('PRO'));
            const primaryColor = isPremium ? 'var(--accent-gold)' : 'var(--accent-blue)';
            const primaryColorHex = isPremium ? '#d4af37' : '#00d2ff';
            
            return (
              <div key={plan.id} className="bg-surface animate-float-slow" style={{ 
                flex: '1 1 350px',
                maxWidth: '450px',
                padding: '3.5rem 2rem', 
                textAlign: 'center', 
                borderRadius: '24px',
                background: `linear-gradient(145deg, ${isPremium ? 'rgba(212, 175, 55, 0.1)' : 'rgba(10, 91, 255, 0.1)'}, rgba(0, 0, 0, 0.4))`,
                border: `1px solid ${isPremium ? 'rgba(212, 175, 55, 0.3)' : 'rgba(10, 91, 255, 0.3)'}`,
                boxShadow: `0 20px 50px ${isPremium ? 'rgba(212, 175, 55, 0.15)' : 'rgba(10, 91, 255, 0.15)'}, inset 0 0 20px ${isPremium ? 'rgba(212, 175, 55, 0.05)' : 'rgba(10, 91, 255, 0.05)'}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Glow effect in background */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: primaryColor, filter: 'blur(80px)', opacity: 0.3, zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: primaryColorHex, filter: 'blur(80px)', opacity: 0.2, zIndex: 0 }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '50px', background: isPremium ? 'rgba(212, 175, 55, 0.2)' : 'rgba(10, 91, 255, 0.2)', color: primaryColorHex, fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1.5rem', border: `1px solid ${isPremium ? 'rgba(212, 175, 55, 0.3)' : 'rgba(10, 91, 255, 0.3)'}` }}>
                    {plan.name.toUpperCase()} TIER
                  </div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: '800', color: 'white' }}>{plan.name.toUpperCase().includes('PLAN') ? plan.name : `${plan.name} Plan`}</h3>
                  <div style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '2.5rem', textShadow: `0 4px 20px ${isPremium ? 'rgba(212, 175, 55, 0.4)' : 'rgba(10, 91, 255, 0.4)'}` }}>{fmt(plan.price)}</div>
                  
                  <ul style={{ listStyle: 'none', marginBottom: '3.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '1.1rem', textAlign: 'left', maxWidth: '300px', margin: '0 auto 3.5rem auto' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Welcome Bonus: <strong style={{color: 'white'}}>{fmt(plan.welcomeBonus)}</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Sponsored Task: <strong style={{color: 'white'}}>{fmtTask(plan.taskReward)}</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Min Task Payout: <strong style={{color: 'white'}}>{fmtTask(plan.minTaskWithdrawal ?? 3500)}</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: plan.referralCommission > 0 ? 1 : 0.6 }}>
                      {plan.referralCommission > 0 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      <span>{plan.referralCommission > 0 ? `${fmt(plan.referralCommission)} Referral` : 'No Referral Commission'}</span>
                    </li>
                    {plan.features?.map((feature: string, idx: number) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>{feature.replace('₦', symbol)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={`/register?plan=${plan.id}`} className={isPremium ? 'btn-pro' : 'btn-primary'} style={{ width: '100%', display: 'block', padding: '1.2rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: `0 10px 30px ${isPremium ? 'rgba(212, 175, 55, 0.4)' : 'rgba(10, 91, 255, 0.4)'}`, transition: 'transform 0.2s, box-shadow 0.2s', background: isPremium ? 'var(--accent-gold)' : 'var(--accent-blue)', color: isPremium ? '#000' : 'white', border: 'none' }}>
                    Start {plan.name} Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verified Code Vendors Section */}
      {vendors.length > 0 && (
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '5rem 1.5rem', background: 'rgba(0,0,0,0.2)' }}>
          <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              Official <span style={{ color: 'var(--accent-gold)', textShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }}>Verified Code Vendors</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
              Purchase instant EARNIX PRO activation codes directly from our authorized vendor partners.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {vendors.slice(0, 8).map((vendor: any) => {
                const avatarLetter = (vendor.name || vendor.username || 'V')[0].toUpperCase();
                const phone = vendor.accountNumber ? vendor.accountNumber.replace(/[^0-9]/g, '') : '';
                const whatsappText = encodeURIComponent(vendor.customGreeting || 'Hello! I would like to purchase an EARNIX PRO Activation Code.');
                const whatsappLink = phone 
                  ? `https://wa.me/${phone}?text=${whatsappText}` 
                  : `mailto:${vendor.email}?subject=EARNIX%20Activation%20Code`;

                let telegramHref = '';
                if (vendor.telegramLink && vendor.telegramLink.trim()) {
                  const raw = vendor.telegramLink.trim();
                  const tgText = encodeURIComponent(vendor.customTelegramMessage || vendor.customGreeting || 'Hello! I would like to purchase an EARNIX Activation Code.');
                  if (raw.startsWith('http://') || raw.startsWith('https://')) {
                    telegramHref = raw.includes('?') ? `${raw}&text=${tgText}` : `${raw}?text=${tgText}`;
                  } else {
                    const handle = raw.replace(/^@/, '');
                    telegramHref = `https://t.me/${handle}?text=${tgText}`;
                  }
                }

                return (
                  <div key={vendor.id} className="bg-surface animate-float-slow" style={{ borderRadius: '16px', padding: '1.5rem 1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}>
                    
                    {/* Vendor Profile Picture */}
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', border: '2.5 solid var(--accent-gold)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                      {vendor.profilePic ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={vendor.profilePic} alt={vendor.name || vendor.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        avatarLetter
                      )}
                    </div>

                    {/* Name & Username */}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                        {vendor.name || vendor.username}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        @{vendor.username}
                      </p>
                    </div>

                    {/* Badge */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', background: 'rgba(212, 175, 55, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 'bold' }}>
                      ✓ Verified Vendor
                    </div>

                    {/* Direct Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', marginTop: '0.5rem' }}>
                      {telegramHref && (
                        <a 
                          href={telegramHref} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '50px', width: '100%', textDecoration: 'none', background: '#0088cc', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          Telegram
                        </a>
                      )}
                      <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '50px', width: '100%', textDecoration: 'none', background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      >
                        WhatsApp
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <Link href="/vendors" className="btn-pro" style={{ padding: '0.75rem 2rem', borderRadius: '50px', fontSize: '0.95rem', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                View All Verified Vendors &rarr;
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <Testimonials />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '0.5rem' }}>Support Contact: <a href="mailto:Supportearnix@gmail.com" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Supportearnix@gmail.com</a></p>
        <p style={{ marginBottom: '1rem' }}>EARNIX Version 1.0 &copy; 2026. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem' }}>
          <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Privacy Policy</Link>
        </div>
      </footer>
    </main>
  );
}
