'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function ValidateCodePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ status: 'INVALID', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundImage: "linear-gradient(rgba(5, 5, 5, 0.88), rgba(5, 5, 5, 0.92)), url('/earnix-logo.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar Header */}
      <header style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'var(--surface-color)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-blue)', textDecoration: 'none' }}>
          EARNIX
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/vendors" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Buy Code
          </Link>
          <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            Login
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '580px', width: '100%', background: 'linear-gradient(145deg, rgba(20, 30, 60, 0.8), rgba(10, 15, 30, 0.95))', borderRadius: '24px', padding: '2.5rem 2rem', border: '1px solid rgba(10, 91, 255, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(10, 91, 255, 0.15)', border: '1px solid rgba(10, 91, 255, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', marginBottom: '1rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
              Coupon Code Validator
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Instantly verify the authenticity and status of any EARNIX activation code before registering or upgrading.
            </p>
          </div>

          <form onSubmit={handleValidate} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                Enter Activation Code
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="e.g. ERX-IDCE-KP34"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, minWidth: '220px', padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', outline: 'none' }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  style={{ padding: '1rem 1.75rem', borderRadius: '12px', background: 'var(--accent-blue)', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
                >
                  {loading ? 'Verifying...' : 'Verify Status'}
                </button>
              </div>
            </div>
          </form>

          {/* Validation Result Box */}
          {result && (
            <div style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: `1px solid ${
                result.status === 'VALID' ? 'rgba(40,199,111,0.5)' : 
                result.status === 'USED' ? 'rgba(255,59,48,0.5)' : 'rgba(245,158,11,0.5)'
              }`,
              background: result.status === 'VALID' ? 'rgba(40,199,111,0.08)' :
                          result.status === 'USED' ? 'rgba(255,59,48,0.08)' : 'rgba(245,158,11,0.08)',
              animation: 'fadeIn 0.3s ease-in-out'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {result.status === 'VALID' && (
                  <span style={{ background: 'var(--success)', color: 'black', padding: '0.3rem 0.8rem', borderRadius: '50px', fontWeight: '900', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} /> VALID &amp; UNUSED
                  </span>
                )}
                {result.status === 'USED' && (
                  <span style={{ background: '#ff3b30', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '50px', fontWeight: '900', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XCircle size={14} /> ALREADY REDEEMED
                  </span>
                )}
                {result.status === 'INVALID' && (
                  <span style={{ background: '#f59e0b', color: 'black', padding: '0.3rem 0.8rem', borderRadius: '50px', fontWeight: '900', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertCircle size={14} /> INVALID CODE
                  </span>
                )}
              </div>

              <p style={{ color: 'white', fontSize: '1rem', lineHeight: '1.5', fontWeight: 'bold', marginBottom: '1.25rem' }}>
                {result.message}
              </p>

              {result.vendor && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  Vendor / Issuer: <strong style={{ color: 'var(--accent-gold)' }}>{result.vendor}</strong>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {result.status === 'VALID' && (
                  <>
                    <Link
                      href={`/register?coupon=${encodeURIComponent(result.code)}`}
                      style={{ flex: 1, minWidth: '160px', padding: '0.85rem 1rem', borderRadius: '50px', background: 'var(--accent-gold)', color: '#000', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      Register with this Code
                    </Link>
                    <Link
                      href="/dashboard"
                      style={{ flex: 1, minWidth: '160px', padding: '0.85rem 1rem', borderRadius: '50px', background: 'var(--accent-blue)', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      Upgrade in Dashboard
                    </Link>
                  </>
                )}
                {(result.status === 'USED' || result.status === 'INVALID') && (
                  <Link
                    href="/vendors"
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '50px', background: 'var(--accent-gold)', color: '#000', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                  >
                    Buy Valid Code from Official Vendors
                  </Link>
                )}
              </div>

            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Don't have an activation coupon code?{' '}
              <Link href="/vendors" style={{ color: 'var(--accent-gold)', fontWeight: 'bold', textDecoration: 'underline' }}>
                Get one from verified vendors
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
