'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Header */}
      <nav className="container" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(10, 91, 255, 0.5)' }}>EARNIX</Link>
      </nav>

      {/* Hero Section */}
      <div style={{ background: 'var(--surface-color)', padding: '4rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Last Updated: July 2026</p>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
        
        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: '2rem' }}>
          By accessing and registering an account on EARNIX ("Company", "we", "our", "us"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using or accessing this site.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>2. Account Registration and Security</h2>
        <p style={{ marginBottom: '2rem' }}>
          Users must be at least 18 years old to participate in our earning programs. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>3. Earning and Withdrawals</h2>
        <p style={{ marginBottom: '2rem' }}>
          EARNIX provides opportunities to earn through sponsored tasks and our affiliate referral program. 
          All earnings are subject to verification. We reserve the right to void any earnings if we detect fraud, bot usage, or manipulation of our task verification system. 
          Withdrawal minimums (e.g., ₦1,000 for Affiliates, ₦3,500 for Tasks) are strictly enforced.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>4. Code Vendors and Payments</h2>
        <p style={{ marginBottom: '2rem' }}>
          PRO Plan accounts require an activation code purchased through official EARNIX Verified Code Vendors. EARNIX is not liable for funds sent to unverified or fake vendors outside our official list. Transactions with vendors are final and non-refundable.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>5. Account Termination</h2>
        <p style={{ marginBottom: '2rem' }}>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the platform and claim unwithdrawn balances will immediately cease.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>6. Modifications</h2>
        <p style={{ marginBottom: '2rem' }}>
          EARNIX reserves the right to revise these Terms of Service at any time without notice. By using this website, you agree to be bound by the current version of these Terms of Service.
        </p>

        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <p>If you have any questions about these Terms, please contact support.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', borderRadius: '50px', padding: '0.8rem 2rem' }}>Back to Home</Link>
        </div>

      </div>
    </main>
  );
}
