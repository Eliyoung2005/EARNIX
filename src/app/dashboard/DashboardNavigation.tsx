'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { getBadgeProps } from "@/lib/badgeUtils";
export { getBadgeProps };

export default function DashboardNavigation({
  children,
  user
}: {
  children: React.ReactNode;
  user: {
    name: string;
    username: string;
    role?: string;
    plan: string;
    initials: string;
    balance: number;
  };
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(user.role || 'USER');

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isSidebarOpen]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const [currentBalance, setCurrentBalance] = useState(user.balance);

  // Keep currentRole & currentBalance in sync with props
  useEffect(() => {
    if (user.role) {
      setCurrentRole(user.role);
    }
    if (typeof user.balance === 'number') {
      setCurrentBalance(user.balance);
    }
  }, [user.role, user.balance]);

  // Real-time polling to check if user role or balance changed in database
  useEffect(() => {
    let isMounted = true;

    const checkRole = async () => {
      try {
        const res = await fetch('/api/user/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.role) setCurrentRole(data.role);
            if (typeof data.taskBalance === 'number' && typeof data.affiliateBalance === 'number') {
              setCurrentBalance(data.taskBalance + data.affiliateBalance);
            }
          }
        }
      } catch (err) {
        // Silent catch
      }
    };

    checkRole();
    const intervalId = setInterval(checkRole, 3000);

    const handleFocus = () => checkRole();
    const handleBalanceEvent = () => checkRole();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('balance-updated', handleBalanceEvent);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('balance-updated', handleBalanceEvent);
    };
  }, []);

  const isVendor = ['VENDOR', 'ADMIN', 'SUB_ADMIN'].includes(currentRole);
  const showSpinWheel = user.plan === 'VIP' || user.plan === 'ELITE';

  const navLinks: { name: string; href: string; icon: string; badge?: string }[] = [
    { name: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Tasks', href: '/dashboard/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  ];

  if (showSpinWheel) {
    navLinks.push({
      name: 'Spin & Win',
      href: '/dashboard/spin',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    });
  }

  const showVtu = user.plan === 'VIP' || user.plan === 'ELITE';

  if (showVtu) {
    navLinks.push({
      name: 'Airtime & VTU',
      href: '/dashboard/vtu',
      icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      badge: 'VIP'
    });
  }

  navLinks.push(
    { name: 'Referrals & Invite', href: '/dashboard/referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Withdrawals', href: '/dashboard/withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' }
  );

  if (isVendor) {
    navLinks.push({
      name: 'Vendor Panel',
      href: '/dashboard/vendor',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      badge: 'VENDOR'
    });
  }

  navLinks.push({
    name: 'Profile Settings',
    href: '/dashboard/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`drawer-backdrop${isSidebarOpen ? ' backdrop-visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{ 
          width: '280px', 
          backgroundColor: 'var(--surface-color)', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', 
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 9999,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-blue)', letterSpacing: '-1px' }}>
            EARNIX {user.plan && user.plan !== 'FREE' ? <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', verticalAlign: 'top' }}>{user.plan}</span> : null}
          </Link>
          <button 
            type="button"
            className="mobile-only" 
            onClick={() => setIsSidebarOpen(false)} 
            aria-label="Close Sidebar"
            style={{ 
              background: 'rgba(255,59,48,0.15)', 
              border: '1px solid rgba(255,59,48,0.5)', 
              color: '#ff3b30', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              fontSize: '1rem', 
              fontWeight: 'bold',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                  borderRadius: '12px', 
                  backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={link.icon}></path>
                </svg>
                {link.name}
                {link.badge && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    background: 'var(--accent-gold)', 
                    color: '#000', 
                    fontSize: '0.65rem', 
                    fontWeight: 'bold', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px' 
                  }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user.initials}</div>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {user.name} 
                {getBadgeProps(user.plan).icon && (
                  <span title={`${user.plan} Member`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: getBadgeProps(user.plan).bg, color: getBadgeProps(user.plan).color, borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem' }}>
                    {getBadgeProps(user.plan).icon}
                  </span>
                )}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{user.username}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 'bold', 
                  padding: '0.1rem 0.5rem', 
                  borderRadius: '10px', 
                  background: getBadgeProps(user.plan).bg, 
                  color: getBadgeProps(user.plan).color,
                  letterSpacing: '0.5px'
                }}>
                  {user.plan}
                </span>
                {isVendor && (
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 'bold', 
                    padding: '0.1rem 0.5rem', 
                    borderRadius: '10px', 
                    background: 'rgba(212, 175, 55, 0.2)', 
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)',
                    letterSpacing: '0.5px'
                  }}>
                    VENDOR
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 0, width: '100%' }} className="dashboard-main">
        {/* Top Header */}
        <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', justifyContent: 'space-between', backgroundColor: 'var(--bg-color)', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              type="button"
              className="mobile-only"
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(!isSidebarOpen);
              }}
              aria-label="Toggle Navigation Menu"
              aria-expanded={isSidebarOpen}
              style={{ 
                background: 'rgba(255,255,255,0.08)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '12px', 
                color: 'white', 
                cursor: 'pointer',
                width: '44px',
                height: '44px',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                opacity: isSidebarOpen ? 0 : 1,
                visibility: isSidebarOpen ? 'hidden' : 'visible',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link href="/dashboard" className="mobile-only" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-blue)', letterSpacing: '-0.5px' }}>
              EARNIX {user.plan && user.plan !== 'FREE' ? <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', verticalAlign: 'top' }}>{user.plan}</span> : null}
            </Link>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ background: 'var(--surface-color)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Balance: <span style={{ color: 'var(--success)' }}>₦{currentBalance.toLocaleString()}</span>
            </button>
            <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </div>

    </div>
  );
}
