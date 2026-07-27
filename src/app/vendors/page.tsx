'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vendor {
  id: string;
  name: string;
  username: string;
  email: string;
  accountNumber?: string;
  customGreeting?: string;
  profilePic?: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVendors(data);
        } else {
          setVendors([]);
        }
      })
      .catch(err => {
        console.error('Failed to load vendors', err);
        setVendors([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredVendors = vendors.filter(v => {
    const query = search.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(query)) ||
      (v.username && v.username.toLowerCase().includes(query)) ||
      (v.email && v.email.toLowerCase().includes(query))
    );
  });

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Header */}
      <nav className="container" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(10, 91, 255, 0.5)', textDecoration: 'none' }}>
          EARNIX
        </Link>
      </nav>

      {/* Hero Section */}
      <div style={{ background: 'var(--surface-color)', padding: '4rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--accent-gold)', textShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }}>EARNIX</span> Verified Vendors
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Meet EARNIX&apos;s most trusted and approved activation code vendors.</p>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <input 
            type="text" 
            placeholder="Search vendors by name or username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem' }}>Loading verified vendors...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVendors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
              {vendors.length === 0 ? 'No Verified Vendors Available Yet' : 'No Matching Vendors Found'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {vendors.length === 0 
                ? 'Verified code vendors will appear here once registered and approved by the Platform Administrator.' 
                : 'Try adjusting your search terms.'}
            </p>
          </div>
        )}

        {/* Vendors Grid */}
        {!loading && filteredVendors.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {filteredVendors.map(vendor => {
              const avatarLetter = (vendor.name || vendor.username || 'V')[0].toUpperCase();
              const phone = vendor.accountNumber ? vendor.accountNumber.replace(/[^0-9]/g, '') : '';
              const whatsappText = encodeURIComponent(vendor.customGreeting || 'Hello! I would like to purchase an EARNIX PRO Activation Code.');
              const contactLink = phone 
                ? `https://wa.me/${phone}?text=${whatsappText}` 
                : `mailto:${vendor.email}?subject=EARNIX%20Activation%20Code`;

              return (
                <div key={vendor.id} style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                  
                  {/* Avatar */}
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                    {avatarLetter}
                  </div>

                  {/* Name & Username */}
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {vendor.name || vendor.username}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                      @{vendor.username}
                    </p>
                  </div>

                  {/* Verified Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                    Verified Vendor
                  </div>

                  {/* Contact Button */}
                  <a 
                    href={contactLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '50px', marginTop: '0.5rem', width: '100%', textDecoration: 'none', background: 'var(--accent-gold)', color: '#000', border: 'none' }}
                  >
                    Contact on WhatsApp
                  </a>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
