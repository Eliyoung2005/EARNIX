'use client';

import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Bank form state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankMsg, setBankMsg] = useState({ text: '', isError: false });
  const [savingBank, setSavingBank] = useState(false);

  // PIN form state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState({ text: '', isError: false });
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProfile(data);
          setBankName(data.bankName || '');
          setAccountNumber(data.accountNumber || '');
          setAccountName(data.accountName || '');
        }
      })
      .catch(err => console.error('Failed to fetch profile', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankMsg({ text: '', isError: false });
    setSavingBank(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateBank',
          bankName,
          accountNumber,
          accountName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBankMsg({ text: data.message || 'Bank details saved successfully!', isError: false });
      } else {
        setBankMsg({ text: data.error || 'Failed to update bank details.', isError: true });
      }
    } catch (err) {
      setBankMsg({ text: 'An error occurred while saving.', isError: true });
    } finally {
      setSavingBank(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg({ text: '', isError: false });

    if (!/^\d{4}$/.test(newPin)) {
      setPinMsg({ text: 'PIN must be exactly 4 digits (numbers only).', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg({ text: 'New PIN and confirm PIN do not match.', isError: true });
      return;
    }

    setSavingPin(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePin',
          currentPin,
          newPin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPinMsg({ text: data.message || 'Withdrawal PIN saved successfully!', isError: false });
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setProfile((prev: any) => ({ ...prev, hasPin: true }));
      } else {
        setPinMsg({ text: data.error || 'Failed to update withdrawal PIN.', isError: true });
      }
    } catch (err) {
      setPinMsg({ text: 'An error occurred while saving PIN.', isError: true });
    } finally {
      setSavingPin(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading profile settings...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>Profile Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Manage your personal account details, bank destination, and 4-digit Withdrawal PIN.</p>

      <div className="grid-responsive-2">
        
        {/* Personal Details */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'white' }}>Personal Information</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                type="text" 
                value={profile?.name || ''} 
                disabled 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Username</label>
              <input 
                type="text" 
                value={`@${profile?.username || ''}`} 
                disabled 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} 
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Note: Contact Support if you need to change your registered email address or username.
            </p>
          </div>
        </div>

        {/* Security Settings (PIN) */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--warning)', margin: 0 }}>Withdrawal Security PIN</h2>
            {profile?.hasPin ? (
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                PIN ENABLED
              </span>
            ) : (
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                PIN NOT SET
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {profile?.hasPin 
              ? 'You have set a 4-digit Withdrawal PIN. Enter your current PIN below if you wish to update it.' 
              : 'You have not set a Withdrawal PIN yet. Create a 4-digit PIN below to authorize your future withdrawals.'}
          </p>
          
          <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {profile?.hasPin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current 4-Digit PIN</label>
                <input 
                  type="password" 
                  maxLength={4} 
                  required 
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="••••" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', letterSpacing: '4px', fontSize: '1.1rem' }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {profile?.hasPin ? 'New PIN' : 'Create 4-Digit PIN'}
                </label>
                <input 
                  type="password" 
                  maxLength={4} 
                  required 
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 1234" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', color: 'white', letterSpacing: '4px', fontSize: '1.1rem' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Confirm PIN</label>
                <input 
                  type="password" 
                  maxLength={4} 
                  required 
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="e.g. 1234" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', color: 'white', letterSpacing: '4px', fontSize: '1.1rem' }} 
                />
              </div>
            </div>

            {pinMsg.text && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: pinMsg.isError ? 'rgba(255, 59, 48, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: pinMsg.isError ? '#ff3b30' : 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {pinMsg.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={savingPin} 
              className="btn-pro" 
              style={{ padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', borderColor: 'var(--warning)', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}
            >
              {savingPin ? 'Saving...' : profile?.hasPin ? 'Update Withdrawal PIN' : 'Set Withdrawal PIN'}
            </button>
          </form>
        </div>

        {/* Bank Details */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>Withdrawal Bank Details</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Set your destination bank account ahead of time. Ensure these details are accurate before the withdrawal portal opens.</p>
          
          <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bank Name</label>
                <select 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <option value="">Select Bank...</option>
                  <option value="access">Access Bank</option>
                  <option value="gtb">Guaranty Trust Bank (GTB)</option>
                  <option value="zenith">Zenith Bank</option>
                  <option value="uba">United Bank for Africa (UBA)</option>
                  <option value="first">First Bank</option>
                  <option value="opay">OPay</option>
                  <option value="palmpay">PalmPay</option>
                  <option value="moniepoint">Moniepoint Microfinance Bank</option>
                  <option value="kuda">Kuda Bank</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Account Number</label>
                <input 
                  type="text" 
                  maxLength={10} 
                  placeholder="e.g. 0123456789" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Account Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
            </div>

            {bankMsg.text && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: bankMsg.isError ? 'rgba(255, 59, 48, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: bankMsg.isError ? '#ff3b30' : 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {bankMsg.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={savingBank} 
              className="btn-pro" 
              style={{ padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', alignSelf: 'flex-start' }}
            >
              {savingBank ? 'Saving...' : 'Save Bank Details'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
