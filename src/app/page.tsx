'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Testimonials from './Testimonials';

const defaultPlans = [
  {
    id: 'FREE',
    name: 'FREE',
    level: 1,
    price: 0,
    welcomeBonus: 0,
    taskReward: 10,
    referralCommission: 0,
    features: ['Daily Task Access', 'Affiliate Earnings']
  },
  {
    id: 'PRO',
    name: 'PRO',
    level: 2,
    price: 500,
    welcomeBonus: 100,
    taskReward: 50,
    referralCommission: 250,
    features: ['Premium Task Access', 'High Commission Rate', 'Fast Withdrawal']
  }
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>(defaultPlans);

  useEffect(() => {
    fetch('/api/plans', {
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
  }, []);

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
          <Link href="/" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Home</Link>
          <Link href="#about" style={{ color: 'var(--text-secondary)' }}>About Us</Link>
          <Link href="#plans" style={{ color: 'var(--text-secondary)' }}>Plans</Link>
          <Link href="/vendors" style={{ color: 'var(--text-secondary)' }}>Code Vendors</Link>
          <Link href="/validate-code" style={{ color: 'var(--text-secondary)' }}>Verify Code</Link>
          <Link href="/top-earners" style={{ color: 'var(--text-secondary)' }}>Top EARNIX</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Desktop Login Button */}
          <Link href="/login" className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '50px', background: 'var(--accent-blue)', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(10, 91, 255, 0.4)', transition: 'transform 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            Login
          </Link>


          
          {/* Hamburger Icon (Mobile Only) */}
          <button 
            type="button"
            className="mobile-only"
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} 
            onTouchEnd={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            style={{ 
              background: isMenuOpen ? '#ff3b30' : 'rgba(255,255,255,0.1)', 
              border: isMenuOpen ? '1px solid #ff3b30' : '1px solid rgba(255,255,255,0.2)', 
              color: 'white', 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              fontSize: '1.4rem', 
              fontWeight: 'bold',
              cursor: 'pointer', 
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Drawer Menu Backdrop Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-only"
          onClick={() => setIsMenuOpen(false)}
          onTouchEnd={() => setIsMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9990, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Drawer Menu (Mobile) */}
      {isMenuOpen && (
        <div className="mobile-only mobile-flex" style={{ position: 'fixed', top: '80px', right: '0', width: '300px', background: 'var(--surface-color)', padding: '1.5rem', zIndex: 9999, borderLeft: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.15)', flexDirection: 'column', gap: '1.25rem', boxShadow: '-5px 5px 30px rgba(0,0,0,0.8)', borderRadius: '0 0 0 20px', pointerEvents: 'auto' }}>
          
          {/* Drawer Top Header Row with Close X */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Menu Navigation
            </span>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} 
              onTouchEnd={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
              aria-label="Close Menu"
              style={{ background: '#ff3b30', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,59,48,0.4)', pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
            >
              ✕
            </button>
          </div>

          <Link href="/" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Home</Link>
          <Link href="#about" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>About Us</Link>
          <Link href="#plans" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Plans</Link>
          <Link href="/vendors" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Code Vendors</Link>
          <Link href="/validate-code" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Verify Code</Link>
          <Link href="/top-earners" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Top EARNIX</Link>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />
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
            <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '2px' }}>You just received ₦5,000</div>
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
                  <div style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '2.5rem', textShadow: `0 4px 20px ${isPremium ? 'rgba(212, 175, 55, 0.4)' : 'rgba(10, 91, 255, 0.4)'}` }}>₦{plan.price.toLocaleString()}</div>
                  
                  <ul style={{ listStyle: 'none', marginBottom: '3.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '1.1rem', textAlign: 'left', maxWidth: '300px', margin: '0 auto 3.5rem auto' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Welcome Bonus: <strong style={{color: 'white'}}>₦{plan.welcomeBonus.toLocaleString()}</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Sponsored Task: <strong style={{color: 'white'}}>₦{plan.taskReward.toLocaleString()}</strong></span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: plan.referralCommission > 0 ? 1 : 0.6 }}>
                      {plan.referralCommission > 0 ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                      <span>{plan.referralCommission > 0 ? `₦${plan.referralCommission.toLocaleString()} Referral` : 'No Referral Commission'}</span>
                    </li>
                    {plan.features?.map((feature: string, idx: number) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>{feature}</span>
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
      
      {/* Testimonials Section */}
      <Testimonials />

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
