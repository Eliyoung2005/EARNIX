'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Header */}
      <nav className="container" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(10, 91, 255, 0.5)' }}>EARNIX</Link>
      </nav>

      {/* Hero Section */}
      <div style={{ background: 'var(--surface-color)', padding: '4rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Last Updated: July 2026</p>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
        
        <p style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
          At EARNIX, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by EARNIX and how we use it.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Information We Collect</h2>
        <p style={{ marginBottom: '2rem' }}>
          We collect personal information that you provide directly to us when you register for an account. This includes your Full Name, Username, Email Address, Phone Number, and Payment Information (Bank Details) necessary for processing your withdrawals.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>2. How We Use Your Information</h2>
        <p style={{ marginBottom: '2rem' }}>
          We use the information we collect in various ways, including to:
        </p>
        <ul style={{ marginBottom: '2rem', paddingLeft: '2rem' }}>
          <li>Provide, operate, and maintain our platform</li>
          <li>Process and complete payout transactions</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our platform</li>
          <li>Find and prevent fraud and abuse</li>
        </ul>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>3. Log Files and Cookies</h2>
        <p style={{ marginBottom: '2rem' }}>
          EARNIX follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, and referring/exit pages.
          We also use cookies to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited to optimize the users' experience.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>4. Google DoubleClick DART Cookie (AdSense)</h2>
        <p style={{ marginBottom: '2rem' }}>
          Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy.
        </p>

        <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>5. Data Security</h2>
        <p style={{ marginBottom: '2rem' }}>
          We value your trust in providing us your Personal Information, thus we strive to use commercially acceptable means of protecting it. However, no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
        </p>

        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', borderRadius: '50px', padding: '0.8rem 2rem' }}>Back to Home</Link>
        </div>

      </div>
    </main>
  );
}
