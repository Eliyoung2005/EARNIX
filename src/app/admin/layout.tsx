'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { name: 'Overview', href: '/admin', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Code Generation', href: '/admin/coupons', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { name: 'Manage Tasks', href: '/admin/manage-tasks', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Review Tasks', href: '/admin/task-submissions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'Withdrawal Requests', href: '/admin/withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Staff & Sub-Admins', href: '/admin/staff', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Pop Notifications', href: '/admin/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { name: 'Membership Plans', href: '/admin/memberships', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { name: 'Manage Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Top Referrals', href: '/admin/referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'AdSense Manager', href: '/admin/adsense', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
    { name: 'Platform Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
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

      {/* Admin Sidebar */}
      <aside 
        className={`admin-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{ 
          width: '280px', 
          backgroundColor: '#121212', 
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', 
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 50,
          transition: 'transform 0.3s ease',
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/admin" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '-1px', textDecoration: 'none' }}>
            EARNIX <span style={{ fontSize: '0.8rem', color: 'white', verticalAlign: 'top' }}>ADMIN</span>
          </Link>
          <button className="mobile-only" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
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
                  backgroundColor: isActive ? '#ff3b30' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  fontWeight: isActive ? '600' : '500',
                  textDecoration: 'none',
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
          <Link href="/dashboard?view=user" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Exit Admin Panel
          </Link>
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
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Super Admin: <strong>Admin</strong></span>
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
