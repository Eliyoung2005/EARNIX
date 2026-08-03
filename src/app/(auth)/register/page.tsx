'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const defaultFallbackPlans = [
  { id: 'FREE', name: 'FREE', price: 0 },
  { id: 'PRO', name: 'PRO', price: 500 }
];

export default function Register() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>(defaultFallbackPlans);
  const [plan, setPlan] = useState<string>('FREE'); // Holds selected plan ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    coupon: '',
    referralCode: ''
  });

  useEffect(() => {
    // Check if referral code is in URL
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref') || params.get('referralCode');
    if (refParam) {
      setFormData(prev => ({ ...prev, referralCode: refParam }));
    }

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
          const paramPlan = params.get('plan');
          if (paramPlan) {
            const found = data.find(p => p.id === paramPlan || p.name.toUpperCase() === paramPlan.toUpperCase());
            if (found) {
              setPlan(found.id);
              return;
            }
          }
          const defaultPlan = data.find(p => p.id === plan) || data[0];
          if (defaultPlan) {
            setPlan(defaultPlan.id);
          }
        }
      })
      .catch(err => {
        console.error("Failed to load plans", err);
      });
  }, []);

  const selectedPlanObj = plans.find(p => p.id === plan || p.name.toUpperCase() === plan.toUpperCase());
  const isPaidPlan = Boolean(selectedPlanObj && (selectedPlanObj.price > 0 || selectedPlanObj.name.toUpperCase().includes('PRO')));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'plan') {
      setPlan(value);
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      return setError('You must agree with EARNIX terms and conditions to sign up.');
    }

    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      return setError(pwdError);
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically sign in after successful registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        identifier: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        // If automatic login fails for any reason, redirect to login page
        router.push('/login?registered=true');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      color: 'white',
      backgroundImage: "linear-gradient(rgba(5, 5, 5, 0.88), rgba(5, 5, 5, 0.92)), url('/earnix-logo.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="bg-surface" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.4rem', color: '#fff' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Join EARNIX and start earning today
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.8rem 1rem',
            background: 'rgba(255, 75, 75, 0.15)',
            border: '1px solid rgba(255, 75, 75, 0.4)',
            color: '#ff4b4b',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* First & Last Name */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: '180px' }}>
              <label htmlFor="fname" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>First Name</label>
              <input
                type="text"
                id="fname"
                value={formData.fname}
                onChange={handleChange}
                required
                autoComplete="given-name"
                placeholder="John"
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.35)',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: '180px' }}>
              <label htmlFor="lname" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Last Name</label>
              <input
                type="text"
                id="lname"
                value={formData.lname}
                onChange={handleChange}
                required
                autoComplete="family-name"
                placeholder="Doe"
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.35)',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="username" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="johndoe123"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.35)',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Enter your email address"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.35)',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Phone Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="phone" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.35)',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Choose Plan (Dropdown Selector) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="plan" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Choose Plan</label>
            <select
              id="plan"
              value={plan}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.35)',
                color: 'white',
                fontSize: '0.95rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="" disabled style={{ background: '#161B22', color: 'rgba(255,255,255,0.6)' }}>
                -- Choose Membership Plan --
              </option>
              {plans.map((p) => {
                const isPaid = p.price > 0 && p.name.toUpperCase() !== 'FREE';
                return (
                  <option key={p.id} value={p.id} style={{ background: '#161B22', color: 'white' }}>
                    {p.name} {isPaid ? `(Paid) - ₦${p.price.toLocaleString()}` : '(Free)'}
                  </option>
                );
              })}
            </select>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
              Select the plan you want to register on before entering your coupon code.
            </p>
          </div>

          {/* Enter Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>Enter Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="******"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  paddingRight: '5.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.35)',
                  color: 'white',
                  fontSize: '0.95rem'
                }}
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
                  background: showPassword ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.12)',
                  border: showPassword ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.25)',
                  color: showPassword ? 'var(--accent-gold)' : '#ffffff',
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

          {/* Dynamic Coupon Code (Appears Automatically for PRO / Paid Plans) */}
          {isPaidPlan && (
            <div className="transition-all" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', padding: '1rem', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.35)', animation: 'fadeIn 0.3s ease-in-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="coupon" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                  {selectedPlanObj?.name || 'PRO'} Activation Code <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.72rem', background: 'var(--accent-gold)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 'bold' }}>
                  REQUIRED FOR {selectedPlanObj?.name || 'PAID PLAN'}
                </span>
              </div>
              <input
                type="text"
                id="coupon"
                value={formData.coupon}
                onChange={handleChange}
                required={isPaidPlan}
                placeholder={`Enter ${selectedPlanObj?.name || 'Activation'} Coupon Code`}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'var(--accent-gold)',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  href="/vendors"
                  target="_blank"
                  style={{ color: 'var(--accent-gold)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Buy Code from Vendors
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                <Link
                  href="/validate-code"
                  target="_blank"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}
                >
                  Verify Code Status
                </Link>
              </div>
            </div>
          )}

          {/* Referral Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label htmlFor="referralCode" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>
              Referral Code
            </label>
            <input
              type="text"
              id="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="admin"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.35)',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Agreement Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="agreedToTerms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: '#c084fc'
              }}
            />
            <label htmlFor="agreedToTerms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
              By signing up, you agreed with EARNIX{' '}
              <Link href="/terms" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                terms and conditions
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '16px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '800',
              cursor: 'pointer',
              marginTop: '0.5rem',
              boxShadow: '0 8px 25px rgba(10, 91, 255, 0.4)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 'bold', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
