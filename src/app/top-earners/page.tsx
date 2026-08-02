'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopEarnersPage() {
  const [earners, setEarners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/top')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEarners(data);
        }
      })
      .catch((err) => console.error('Failed to load top earners:', err))
      .finally(() => setLoading(false));
  }, []);

  // Map rank and podium structure
  const topThree = [];
  if (earners.length > 1) {
    // Rank 2: 2nd place (left)
    topThree.push({
      rank: 2,
      name: earners[1].username || earners[1].name,
      earnings: `₦${earners[1].totalEarnings.toLocaleString()}`,
      avatar: (earners[1].username || earners[1].name || 'U')[0].toUpperCase(),
      color: 'var(--accent-blue)',
    });
  }
  if (earners.length > 0) {
    // Rank 1: 1st place (center)
    topThree.push({
      rank: 1,
      name: earners[0].username || earners[0].name,
      earnings: `₦${earners[0].totalEarnings.toLocaleString()}`,
      avatar: (earners[0].username || earners[0].name || 'U')[0].toUpperCase(),
      color: 'var(--accent-gold)',
    });
  }
  if (earners.length > 2) {
    // Rank 3: 3rd place (right)
    topThree.push({
      rank: 3,
      name: earners[2].username || earners[2].name,
      earnings: `₦${earners[2].totalEarnings.toLocaleString()}`,
      avatar: (earners[2].username || earners[2].name || 'U')[0].toUpperCase(),
      color: 'var(--accent-blue)',
    });
  }

  // The rest from rank 4 to 10
  const others = earners.slice(3).map((user, idx) => ({
    rank: idx + 4,
    name: user.username || user.name,
    earnings: `₦${user.totalEarnings.toLocaleString()}`,
    avatar: (user.username || user.name || 'U')[0].toUpperCase(),
  }));

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Header */}
      <nav className="container" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)', textShadow: '0 0 10px rgba(10, 91, 255, 0.5)' }}>EARNIX</Link>
      </nav>

      {/* Hero Section */}
      <div style={{ background: 'var(--surface-color)', padding: '4rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '0.5rem' }}>
          EARNIX <span style={{ color: 'var(--accent-gold)', textShadow: '0 0 10px rgba(212, 175, 55, 0.3)' }}>STANDOUTS</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Meet our most successful earners.</p>
      </div>

      {/* Leaderboard Area with background image */}
      <div style={{ 
        flex: 1,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url("/earnix-e-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%'
      }}>
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {/* Toggle Filters (Mock) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '50px', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', background: 'var(--accent-blue)', color: 'white', border: 'none', fontWeight: 'bold' }}>Highest</button>
            <button style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontWeight: 'bold' }}>Newest</button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Loading dynamic leaderboard...</p>
        ) : earners.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No earners registered on platform yet.</p>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '4rem' }}>
              {topThree.map((user) => (
                <div key={user.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32%' }}>
                  
                  {/* Avatar Box */}
                  <div style={{ 
                    width: user.rank === 1 ? '80px' : '65px', 
                    height: user.rank === 1 ? '80px' : '65px', 
                    borderRadius: '16px', 
                    background: 'var(--surface-color)', 
                    border: `2px solid ${user.color}`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: user.rank === 1 ? '2rem' : '1.5rem', 
                    fontWeight: 'bold', 
                    color: user.color,
                    marginBottom: '1rem',
                    boxShadow: `0 0 15px ${user.color}40`,
                    position: 'relative'
                  }}>
                    {user.avatar}
                    {/* Rank Badge */}
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: user.color, color: user.rank === 1 ? '#000' : '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {user.rank}
                    </div>
                  </div>

                  {/* Username & Earnings Card */}
                  <div className="bg-surface" style={{ width: '100%', padding: '1rem 0.5rem', textAlign: 'center', borderRadius: '12px', borderTop: `3px solid ${user.color}` }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{user.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>Earnings</p>
                    <p style={{ fontSize: '1rem', fontWeight: '900', color: user.color }}>{user.earnings}</p>
                  </div>

                </div>
              ))}
            </div>

            {/* List of other earners */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {others.map((user) => (
                <div key={user.rank} className="bg-surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Rank */}
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)', width: '20px' }}>{user.rank}</span>
                    
                    {/* Small Avatar */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {user.avatar}
                    </div>

                    {/* Name & Label */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>@{user.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Earnings</span>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {user.earnings}
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

        </div>
      </div>
    </main>
  );
}
