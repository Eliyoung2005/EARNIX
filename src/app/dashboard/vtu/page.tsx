'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UpgradeBannerButton from '../UpgradeBannerButton';
import { Smartphone, Lock, CheckCircle2, Zap, AlertCircle, ArrowRight, History, Printer, X, Download, ShieldCheck, Wifi } from 'lucide-react';
import { useCurrency } from '@/lib/CurrencyContext';

interface VtuTransaction {
  id: string;
  network: 'MTN' | 'AIRTEL' | 'GLO' | 'NINE_MOBILE';
  type?: 'AIRTIME' | 'DATA';
  planOrBundle?: string;
  phoneNumber: string;
  amount: number;
  walletSource: 'TASK' | 'AFFILIATE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED';
  reference: string;
  createdAt: string;
}

const NETWORKS = [
  { id: 'MTN', name: 'MTN', color: '#ffcc00', textColor: '#000000', badgeBg: 'rgba(255, 204, 0, 0.15)', border: '#ffcc00' },
  { id: 'AIRTEL', name: 'AIRTEL', color: '#ff3b30', textColor: '#ffffff', badgeBg: 'rgba(255, 59, 48, 0.15)', border: '#ff3b30' },
  { id: 'GLO', name: 'GLO', color: '#28c76f', textColor: '#ffffff', badgeBg: 'rgba(40, 199, 111, 0.15)', border: '#28c76f' },
  { id: 'NINE_MOBILE', name: '9MOBILE', color: '#00a859', textColor: '#ffffff', badgeBg: 'rgba(0, 168, 89, 0.15)', border: '#00a859' },
];

const PRESET_AIRTIME_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const DATA_BUNDLES: Record<string, { label: string; amount: number }[]> = {
  MTN: [
    { label: '1.0 GB Monthly Data', amount: 300 },
    { label: '2.0 GB Monthly Data', amount: 600 },
    { label: '3.5 GB Monthly Data', amount: 1000 },
    { label: '7.0 GB Monthly Data', amount: 2000 },
    { label: '15.0 GB Mega Data', amount: 4000 },
  ],
  AIRTEL: [
    { label: '1.0 GB Monthly Data', amount: 300 },
    { label: '2.0 GB Monthly Data', amount: 600 },
    { label: '4.0 GB Monthly Data', amount: 1200 },
    { label: '10.0 GB Mega Data', amount: 3000 },
  ],
  GLO: [
    { label: '1.25 GB Monthly Data', amount: 300 },
    { label: '2.5 GB Monthly Data', amount: 600 },
    { label: '5.8 GB Monthly Data', amount: 1200 },
    { label: '12.0 GB Mega Data', amount: 2500 },
  ],
  NINE_MOBILE: [
    { label: '1.0 GB Monthly Data', amount: 300 },
    { label: '2.5 GB Monthly Data', amount: 600 },
    { label: '4.5 GB Monthly Data', amount: 1000 },
    { label: '11.0 GB Mega Data', amount: 3000 },
  ]
};

export default function VtuAirtimePage() {
  const { fmt, symbol, taskLabel, settings } = useCurrency();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<any>(null);

  // Form State
  const [purchaseType, setPurchaseType] = useState<'AIRTIME' | 'DATA'>('AIRTIME');
  const [selectedNetwork, setSelectedNetwork] = useState<'MTN' | 'AIRTEL' | 'GLO' | 'NINE_MOBILE'>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<number | string>(500);
  const [selectedDataBundle, setSelectedDataBundle] = useState<{ label: string; amount: number }>(DATA_BUNDLES.MTN[0]);
  const [walletSource, setWalletSource] = useState<'TASK' | 'AFFILIATE'>('TASK');

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<VtuTransaction | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const downloadReceipt = (receipt: VtuTransaction) => {
    const content = `
========================================
           EARNIX VTU RECEIPT           
========================================
Reference:   ${receipt.reference}
Type:        ${receipt.type || 'AIRTIME'}
Network:     ${receipt.network}
Details:     ${receipt.planOrBundle || 'Airtime Top-Up'}
Phone No:    ${receipt.phoneNumber}
Paid With:   ${receipt.walletSource === 'TASK' ? 'Task Wallet' : 'Affiliate Wallet'}
Date & Time: ${new Date(receipt.createdAt).toLocaleString()}
Status:      ${receipt.status}
Amount:      ${fmt(receipt.amount)}
========================================
     Thank you for using EARNIX!     
========================================
`.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Earnix-VTU-${receipt.reference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/vtu');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load VTU data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Update selected data bundle when network changes
  useEffect(() => {
    if (DATA_BUNDLES[selectedNetwork]) {
      setSelectedDataBundle(DATA_BUNDLES[selectedNetwork][0]);
    }
  }, [selectedNetwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !status?.isEligible) return;

    setErrorMsg('');

    const finalAmount = purchaseType === 'DATA' ? selectedDataBundle.amount : Number(amount);
    const bundleLabel = purchaseType === 'DATA' ? selectedDataBundle.label : 'Airtime Top-Up';

    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length !== 11) {
      setErrorMsg('Please enter a valid 11-digit mobile phone number (e.g. 08012345678).');
      return;
    }

    if (isNaN(finalAmount) || finalAmount < 100 || finalAmount > 50000) {
      setErrorMsg(`Top-up amount must be between ${fmt(100)} and ${fmt(50000)}.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/vtu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork,
          type: purchaseType,
          planOrBundle: bundleLabel,
          phoneNumber,
          amount: finalAmount,
          walletSource
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'VTU request failed.');
      }

      // Show receipt modal for newly created pending transaction
      setActiveReceipt(data.transaction);
      fetchStatus();
      router.refresh();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('balance-updated'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while processing your top-up request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading VTU Portal...
      </div>
    );
  }

  const isEligible = status?.isEligible;
  const planName = status?.planName || 'FREE';
  const taskBalance = status?.taskBalance || 0;
  const affiliateBalance = status?.affiliateBalance || 0;
  const history: VtuTransaction[] = status?.vtuTransactions || [];

  const currentWalletBalance = walletSource === 'TASK' ? taskBalance : affiliateBalance;
  const numAmount = purchaseType === 'DATA' ? selectedDataBundle.amount : (Number(amount) || 0);
  const remainingBalance = currentWalletBalance - numAmount;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 0' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--accent-gold)', padding: '0.4rem 1.25rem', borderRadius: '50px', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: '900', marginBottom: '1rem' }}>
          <Smartphone size={18} /> VIP &amp; ELITE EXCLUSIVE VTU PORTAL
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
          Airtime &amp; Mobile Data Top-Up
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Purchase airtime or data bundles using your <strong style={{ color: 'var(--accent-blue)' }}>Task {settings?.taskEarningsMode === 'POINTS' ? 'ERX' : 'Balance'}</strong> or <strong style={{ color: 'var(--success)' }}>Affiliate Commission</strong>.
        </p>
      </div>

      {/* Non-Eligible Access Lock Card (For FREE / PRO Users) */}
      {!isEligible ? (
        <div className="bg-surface" style={{ padding: '3.5rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.35)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--accent-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
            <Lock size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
            VTU Feature Locked for {planName} Members
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            The VTU Airtime &amp; Data Top-Up feature is exclusively reserved for <strong style={{ color: 'var(--accent-gold)' }}>VIP</strong> and <strong style={{ color: 'var(--accent-gold)' }}>ELITE</strong> membership plans. Upgrade your account now to unlock VTU purchases!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <UpgradeBannerButton nextPlanName="VIP" price={1000} />
            <Link href="/vendors" style={{ padding: '0.9rem 1.75rem', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem' }}>
              Buy Activation Coupon
            </Link>
          </div>
        </div>
      ) : status?.enableVtuData === false ? (
        <div className="bg-surface" style={{ padding: '3.5rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #ff3b30', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 59, 48, 0.15)', border: '1px solid #ff3b30', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ff3b30', marginBottom: '1.5rem' }}>
            <AlertCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
            VTU Top-Up Portal Closed
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
            The VTU Airtime &amp; Data Top-Up portal is currently closed by the administrator. Please try again later.
          </p>
        </div>
      ) : (
        /* Eligible VIP / ELITE Interface */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main Purchase Form */}
          <div className="bg-surface" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            
            {/* Service Toggle: Airtime vs Data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(0,0,0,0.4)', padding: '0.4rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => setPurchaseType('AIRTIME')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: purchaseType === 'AIRTIME' ? 'linear-gradient(135deg, var(--accent-gold), #b8860b)' : 'transparent',
                  color: purchaseType === 'AIRTIME' ? '#000' : 'var(--text-secondary)',
                  fontWeight: '900',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Smartphone size={18} /> Buy Airtime
              </button>

              <button
                type="button"
                onClick={() => setPurchaseType('DATA')}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: purchaseType === 'DATA' ? 'linear-gradient(135deg, var(--accent-blue), #0044cc)' : 'transparent',
                  color: purchaseType === 'DATA' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: '900',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Wifi size={18} /> Buy Data Bundles
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Step 1: Network Selection */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Zap size={18} style={{ color: 'var(--accent-gold)' }} /> Step 1: Select Network Provider
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.85rem' }}>
                  {NETWORKS.map((net) => {
                    const isSelected = selectedNetwork === net.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setSelectedNetwork(net.id as any)}
                        style={{
                          padding: '1rem',
                          borderRadius: '16px',
                          border: isSelected ? `2px solid ${net.border}` : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected ? net.badgeBg : 'rgba(0,0,0,0.3)',
                          color: isSelected ? net.textColor : 'var(--text-secondary)',
                          fontWeight: '900',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                        }}
                      >
                        <span style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%', 
                          background: net.color, 
                          color: net.textColor, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '900',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                        }}>
                          {net.name.slice(0, 3)}
                        </span>
                        <span>{net.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Recipient Phone Number */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>
                  Step 2: Enter Recipient Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    maxLength={11}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      outline: 'none',
                      letterSpacing: '1px'
                    }}
                  />
                  {phoneNumber.length === 11 && (
                    <CheckCircle2 size={20} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)' }} />
                  )}
                </div>
              </div>

              {/* Step 3: Payment Wallet Selection */}
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.75rem' }}>
                  Step 3: Select Payment Wallet Source
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setWalletSource('TASK')}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '16px',
                      border: walletSource === 'TASK' ? '2px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.15)',
                      background: walletSource === 'TASK' ? 'rgba(10,91,255,0.2)' : 'rgba(0,0,0,0.3)',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Task {settings?.taskEarningsMode === 'POINTS' ? 'ERX' : 'Cash'} Wallet</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
                      {fmt(taskBalance)}
                    </div>
                  </button>
 
                  <button
                    type="button"
                    onClick={() => setWalletSource('AFFILIATE')}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '16px',
                      border: walletSource === 'AFFILIATE' ? '2px solid var(--success)' : '1px solid rgba(255,255,255,0.15)',
                      background: walletSource === 'AFFILIATE' ? 'rgba(40,199,111,0.2)' : 'rgba(0,0,0,0.3)',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Affiliate Wallet</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--success)', marginTop: '0.2rem' }}>
                      {fmt(affiliateBalance)}
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 4: Package or Airtime Amount Selection */}
              {purchaseType === 'AIRTIME' ? (
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.75rem' }}>
                    Step 4: Choose Airtime Amount ({symbol})
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                    {PRESET_AIRTIME_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: Number(amount) === preset ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                          background: Number(amount) === preset ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.3)',
                          color: Number(amount) === preset ? 'var(--accent-gold)' : 'white',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          cursor: 'pointer'
                        }}
                      >
                        {fmt(preset)}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Custom Amount:</span>
                    <input
                      type="number"
                      min={100}
                      max={50000}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Data Bundle Selection */
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.75rem' }}>
                    Step 4: Select {selectedNetwork} Data Plan
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
                    {(DATA_BUNDLES[selectedNetwork] || []).map((bundle) => {
                      const isSelected = selectedDataBundle.label === bundle.label;
                      return (
                        <button
                          key={bundle.label}
                          type="button"
                          onClick={() => setSelectedDataBundle(bundle)}
                          style={{
                            padding: '1rem',
                            borderRadius: '14px',
                            border: isSelected ? '2px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.1)',
                            background: isSelected ? 'rgba(10,91,255,0.2)' : 'rgba(0,0,0,0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.4rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{bundle.label}</div>
                          <div style={{ fontWeight: '900', color: 'var(--accent-gold)', fontSize: '1.1rem' }}>{fmt(bundle.amount)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Summary Card */}
              <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Service Type:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{purchaseType === 'AIRTIME' ? 'Airtime Top-Up' : 'Data Bundle'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Network:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedNetwork}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Destination Phone:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{phoneNumber || 'Not entered'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Wallet Source:</span>
                  <span style={{ color: walletSource === 'TASK' ? 'var(--accent-blue)' : 'var(--success)', fontWeight: 'bold' }}>
                    {walletSource === 'TASK' ? 'Task Wallet' : 'Affiliate Wallet'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>Total Cost:</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: '900', fontSize: '1.15rem' }}>
                    {fmt(numAmount)}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: '0.9rem 1.25rem', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)', color: '#ff3b30', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} /> {errorMsg}
                </div>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={submitting || remainingBalance < 0 || status?.vtuDataButtonClaimable === false}
                style={{
                  padding: '1.25rem',
                  borderRadius: '50px',
                  background: (remainingBalance < 0 || status?.vtuDataButtonClaimable === false)
                    ? 'rgba(255,255,255,0.1)' 
                    : purchaseType === 'DATA'
                    ? 'linear-gradient(135deg, var(--accent-blue), #0044cc)'
                    : 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                  color: (remainingBalance < 0 || status?.vtuDataButtonClaimable === false) ? 'var(--text-secondary)' : purchaseType === 'DATA' ? '#fff' : '#000',
                  fontWeight: '900',
                  fontSize: '1.1rem',
                  border: 'none',
                  cursor: (submitting || remainingBalance < 0 || status?.vtuDataButtonClaimable === false) ? 'not-allowed' : 'pointer',
                  boxShadow: (remainingBalance < 0 || status?.vtuDataButtonClaimable === false) ? 'none' : '0 10px 30px rgba(0,0,0,0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting ? (
                  'SUBMITTING REQUEST...'
                ) : status?.vtuDataButtonClaimable === false ? (
                  'PURCHASES TEMPORARILY DISABLED'
                ) : remainingBalance < 0 ? (
                  `INSUFFICIENT ${walletSource} BALANCE`
                ) : (
                  <>PURCHASE {purchaseType} ({fmt(numAmount)}) <ArrowRight size={20} /></>
                )}
              </button>

            </form>
          </div>

          {/* Transaction History Section */}
          <div className="bg-surface" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} style={{ color: 'var(--accent-gold)' }} /> Your VTU Purchase History
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {history.length} Transactions
              </span>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                You have not submitted any VTU purchases yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {history.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      padding: '1.1rem',
                      borderRadius: '16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: tx.network === 'MTN' ? 'rgba(255,204,0,0.2)' : tx.network === 'AIRTEL' ? 'rgba(255,59,48,0.2)' : 'rgba(40,199,111,0.2)',
                        color: tx.network === 'MTN' ? '#ffcc00' : tx.network === 'AIRTEL' ? '#ff3b30' : '#28c76f',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem'
                      }}>
                        {tx.network.slice(0, 3)}
                      </div>

                      <div>
                        <div style={{ fontWeight: 'bold', color: 'white', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{tx.network} {tx.type === 'DATA' ? 'Data' : 'Airtime'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>• {tx.phoneNumber}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {tx.planOrBundle || 'Airtime Top-Up'} • Ref: {tx.reference}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--success)' }}>
                          {fmt(tx.amount)}
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            background: tx.status === 'APPROVED' || tx.status === 'SUCCESS'
                              ? 'rgba(40,199,111,0.2)'
                              : tx.status === 'REJECTED'
                              ? 'rgba(255,59,48,0.2)'
                              : 'rgba(212,175,55,0.2)',
                            color: tx.status === 'APPROVED' || tx.status === 'SUCCESS'
                              ? 'var(--success)'
                              : tx.status === 'REJECTED'
                              ? '#ff3b30'
                              : 'var(--accent-gold)'
                          }}>
                            {tx.status}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveReceipt(tx)}
                        style={{
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Printer size={14} /> Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Digital Printable Receipt Modal */}
      {activeReceipt && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            background: '#0e1424',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setActiveReceipt(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Printable Receipt Content */}
            <div id="vtu-receipt-printable" style={{ textAlign: 'center' }}>
              
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-gold)', letterSpacing: '-0.5px', marginBottom: '0.2rem' }}>
                EARNIX VTU RECEIPT
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Official Transaction Summary &amp; Proof
              </div>

              <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left', fontSize: '0.88rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Reference No:</span>
                  <span style={{ color: 'white', fontFamily: 'monospace', fontWeight: 'bold' }}>{activeReceipt.reference}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Service Type:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{activeReceipt.type || 'AIRTIME'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Network:</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{activeReceipt.network}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Package / Bundle:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{activeReceipt.planOrBundle || 'Airtime Top-Up'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Recipient Phone:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{activeReceipt.phoneNumber}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Wallet Source:</span>
                  <span style={{ color: activeReceipt.walletSource === 'TASK' ? 'var(--accent-blue)' : 'var(--success)', fontWeight: 'bold' }}>
                    {activeReceipt.walletSource === 'TASK' ? 'Task Wallet' : 'Affiliate Wallet'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Date &amp; Time:</span>
                  <span style={{ color: 'white', fontSize: '0.8rem' }}>{new Date(activeReceipt.createdAt).toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span style={{
                    fontWeight: '900',
                    color: activeReceipt.status === 'APPROVED' || activeReceipt.status === 'SUCCESS'
                      ? 'var(--success)'
                      : activeReceipt.status === 'REJECTED'
                      ? '#ff3b30'
                      : 'var(--accent-gold)'
                  }}>
                    {activeReceipt.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>Total Amount:</span>
                  <span style={{ color: 'var(--success)', fontWeight: '900' }}>{fmt(activeReceipt.amount)}</span>
                </div>

              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => downloadReceipt(activeReceipt)}
                  style={{
                    padding: '0.85rem 1.5rem',
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, var(--accent-blue), #0044cc)',
                    color: '#fff',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Download size={16} /> Download Receipt
                </button>

                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '0.85rem 1.5rem',
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                    color: '#000',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Printer size={16} /> Print / Save
                </button>

                <button
                  onClick={() => setActiveReceipt(null)}
                  style={{
                    padding: '0.85rem 1.5rem',
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
