'use client';

import Link from 'next/link';

export default function VendorsPage() {
  const vendors = [
    { id: 1, name: 'Vendor John', avatar: 'J', phone: '+2348000000001', online: true },
    { id: 2, name: 'Vendor Sarah', avatar: 'S', phone: '+2348000000002', online: true },
    { id: 3, name: 'Vendor Mike', avatar: 'M', phone: '+2348000000003', online: false },
    { id: 4, name: 'Vendor David', avatar: 'D', phone: '+2348000000004', online: true },
    { id: 5, name: 'Vendor Emma', avatar: 'E', phone: '+2348000000005', online: true },
    { id: 6, name: 'Vendor Chris', avatar: 'C', phone: '+2348000000006', online: true },
    { id: 7, name: 'Vendor Tobi', avatar: 'T', phone: '+2348000000007', online: false },
    { id: 8, name: 'Vendor Ada', avatar: 'A', phone: '+2348000000008', online: true },
    { id: 9, name: 'Vendor Paul', avatar: 'P', phone: '+2348000000009', online: true },
    { id: 10, name: 'Vendor Joy', avatar: 'J', phone: '+2348000000010', online: true },
  ];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Header */}
      <nav className="container" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(10, 91, 255, 0.5)' }}>EARNIX</Link>
      </nav>

      {/* Hero Section */}
      <div style={{ background: 'var(--surface-color)', padding: '4rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--accent-gold)', textShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }}>EARNIX</span> Verified Vendors
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Meet EARNIX's most trusted and approved activation code vendors.</p>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <input 
            type="text" 
            placeholder="Search vendors by name..." 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '1rem 1.5rem', 
              borderRadius: '50px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white',
              textAlign: 'center',
              fontSize: '1rem'
            }} 
          />
        </div>

        {/* Vendors Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {vendors.map(vendor => (
            <div key={vendor.id} style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
              
              {/* Avatar Placeholder (Can be replaced with img later) */}
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-color)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                {vendor.avatar}
              </div>

              {/* Name */}
              <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {vendor.name}
              </h3>

              {/* Online Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: vendor.online ? 'var(--success)' : 'var(--text-secondary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: vendor.online ? 'var(--success)' : 'var(--text-secondary)' }}></span>
                {vendor.online ? 'online' : 'offline'}
              </div>

              {/* Contact Button */}
              <a 
                href={`https://wa.me/${vendor.phone}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '50px', marginTop: '0.5rem', width: '100%', textDecoration: 'none' }}
              >
                Contact Me
              </a>

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
