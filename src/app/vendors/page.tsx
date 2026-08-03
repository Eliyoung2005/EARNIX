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
  telegramLink?: string;
  customTelegramMessage?: string;
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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundImage: "linear-gradient(rgba(5, 5, 5, 0.88), rgba(5, 5, 5, 0.92)), url('/earnix-logo.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
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

      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.5rem' }}>
            {filteredVendors.map(vendor => {
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
                <div key={vendor.id} style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '1.5rem 1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  
                  {/* Avatar */}
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', border: '2px solid var(--accent-gold)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                    {vendor.profilePic ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={vendor.profilePic} alt={vendor.name || vendor.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      avatarLetter
                    )}
                  </div>

                  {/* Name & Username */}
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {vendor.name || vendor.username}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                      @{vendor.username}
                    </p>
                  </div>

                  {/* Verified Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-gold)', background: 'rgba(212, 175, 55, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                    Verified Vendor
                  </div>

                  {/* Contact Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                    
                    {/* Telegram Button */}
                    {telegramHref ? (
                      <a 
                        href={telegramHref} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '50px', width: '100%', textDecoration: 'none', background: '#0088cc', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'transform 0.2s' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.42.53-.47-.01-1.37-.26-2.05-.48-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.89 8.01-3.46 3.81-1.59 4.6-1.87 5.12-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.01.07.01.21 0 .36z"/>
                        </svg>
                        Contact on Telegram
                      </a>
                    ) : null}

                    {/* WhatsApp Button */}
                    <a 
                      href={whatsappLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '50px', width: '100%', textDecoration: 'none', background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      </svg>
                      Contact on WhatsApp
                    </a>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
