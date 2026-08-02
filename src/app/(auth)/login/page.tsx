'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError === 'CredentialsSignin' || urlError === 'Callback') {
      setError('Invalid username/email or password. Please check your credentials.');
    } else if (urlError) {
      setError('Authentication failed. Please try again.');
    }
  }, []);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password;

    if (!cleanIdentifier || !cleanPassword) {
      return setError('Please enter both your username/email and password.');
    }

    setLoading(true);

    try {
      const params = new URLSearchParams(window.location.search);
      let fromUrl = params.get('from');
      if (fromUrl && fromUrl.includes('/admin/login')) {
        fromUrl = '/admin';
      }

      const targetUrl = fromUrl || '/dashboard';

      const result = await signIn('credentials', {
        redirect: false,
        identifier: cleanIdentifier,
        password: cleanPassword,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email/username or password. Please try again.');
        } else {
          setError(result.error || 'Authentication failed. Please check your details.');
        }
        setLoading(false);
      } else if (result?.ok) {
        window.location.href = targetUrl;
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'An error occurred during login.');
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundImage: "linear-gradient(rgba(5, 5, 5, 0.88), rgba(5, 5, 5, 0.92)), url('/earnix-logo.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="bg-surface" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Home
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>EARNIX</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to the platform</p>
        </div>

        {error && (
          <div style={{ padding: '0.8rem', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="identifier" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Email or Username</label>
            <input 
              type="text" 
              id="identifier" 
              autoComplete="username"
              placeholder="you@example.com or your_username" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Password</label>
              <Link href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>Forgot Password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                autoComplete="current-password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', paddingRight: '5.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(prev => !prev);
                }}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: showPassword ? 'rgba(10, 91, 255, 0.3)' : 'rgba(255,255,255,0.12)',
                  border: showPassword ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.25)',
                  color: showPassword ? '#38bdf8' : '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  zIndex: 100,
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  userSelect: 'none',
                  touchAction: 'manipulation'
                }}
              >
                <span>{showPassword ? 'Hide' : 'Show'}</span>
                {showPassword ? (
                  <svg style={{ pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg style={{ pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in...' : 'Secure Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Register Here</Link>
        </p>

      </div>
    </main>
  );
}
