'use client';

import Link from 'next/link';
import { useState } from 'react';
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
    plan: string;
    initials: string;
    balance: number;
  };
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Tasks', href: '/dashboard/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'Spin & Win', href: '/dashboard/spin', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Referrals & Invite', href: '/dashboard/referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Withdrawals', href: '/dashboard/withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Profile Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="mobile-only"
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}
        style={{ 
          width: '280px', 
          backgroundColor: 'var(--surface-color)', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', 
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-blue)', letterSpacing: '-1px' }}>
            EARNIX {user.plan && user.plan !== 'FREE' ? <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', verticalAlign: 'top' }}>{user.plan}</span> : null}
          </Link>
          <button 
            type="button"
            className="mobile-only" 
            onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }} 
            onTouchEnd={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }}
            style={{ 
              background: '#ff3b30', 
              border: 'none', 
              color: 'white', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              fontSize: '1.2rem', 
              fontWeight: 'bold',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,59,48,0.4)',
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
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
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 0, width: '100%' }} className="dashboard-main">
        {/* Top Header */}
        <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', justifyContent: 'space-between', backgroundColor: 'var(--bg-color)', position: 'sticky', top: 0, zIndex: 30 }}>
          <button 
            type="button"
            className="mobile-only"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(!isSidebarOpen);
            }}
            style={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              color: 'white', 
              fontSize: '1.6rem', 
              cursor: 'pointer',
              padding: '0.4rem 0.75rem',
              minWidth: '42px',
              minHeight: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ☰
          </button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ background: 'var(--surface-color)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Balance: <span style={{ color: 'var(--success)' }}>₦{user.balance.toLocaleString()}</span>
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
