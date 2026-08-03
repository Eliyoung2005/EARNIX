'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Search, RefreshCw, Filter, CheckCircle2, XCircle, Clock, Printer, X, ShieldAlert, Wifi } from 'lucide-react';

interface AdminVtuTx {
  id: string;
  userId: string;
  network: 'MTN' | 'AIRTEL' | 'GLO' | 'NINE_MOBILE';
  type?: 'AIRTIME' | 'DATA';
  planOrBundle?: string;
  phoneNumber: string;
  amount: number;
  walletSource: 'TASK' | 'AFFILIATE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED';
  reference: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    membership?: {
      name: string;
    };
  };
}

export default function AdminVtuPage() {
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [networkFilter, setNetworkFilter] = useState('ALL');
  const [walletFilter, setWalletFilter] = useState('ALL');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Admin Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<AdminVtuTx | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vtu');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load admin VTU transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdminAction = async (transactionId: string, action: 'APPROVE' | 'REJECT') => {
    if (processingId) return;

    setProcessingId(transactionId);
    setActionFeedback(null);

    try {
      const res = await fetch('/api/admin/vtu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || `Failed to ${action.toLowerCase()} transaction.`);
      }

      setActionFeedback(result.message);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error executing action');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading VTU Airtime &amp; Data Requests...
      </div>
    );
  }

  const transactions: AdminVtuTx[] = data?.transactions || [];

  const filteredTxs = transactions.filter((tx) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      tx.phoneNumber.includes(query) ||
      tx.reference.toLowerCase().includes(query) ||
      tx.user?.username?.toLowerCase().includes(query) ||
      tx.user?.name?.toLowerCase().includes(query) ||
      tx.user?.email?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesNetwork = networkFilter === 'ALL' || tx.network === networkFilter;
    const matchesWallet = walletFilter === 'ALL' || tx.walletSource === walletFilter;

    return matchesSearch && matchesStatus && matchesNetwork && matchesWallet;
  });

  const pendingTxs = transactions.filter(t => t.status === 'PENDING');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Smartphone style={{ color: 'var(--accent-gold)' }} /> VTU Airtime &amp; Data Approvals
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Review, approve, or reject pending VIP &amp; ELITE user VTU top-up purchases.
          </p>
        </div>

        <button
          onClick={fetchData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {actionFeedback && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '14px', background: 'rgba(40,199,111,0.15)', border: '1px solid rgba(40,199,111,0.4)', color: 'var(--success)', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(212,175,55,0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} /> PENDING APPROVALS
          </span>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '0.3rem' }}>
            {pendingTxs.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Awaiting admin action</span>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>APPROVED VOLUME</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--success)', marginTop: '0.3rem' }}>
            ₦{(data?.totalAmount || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed airtime &amp; data</span>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TASK WALLET SPEND</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-blue)', marginTop: '0.3rem' }}>
            ₦{(data?.walletStats?.TASK || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Task points spent</span>
        </div>

        <div className="bg-surface" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>AFFILIATE WALLET SPEND</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--success)', marginTop: '0.3rem' }}>
            ₦{(data?.walletStats?.AFFILIATE || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Affiliate earnings spent</span>
        </div>

      </div>

      {/* Filters & Search */}
      <div className="bg-surface" style={{ padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by phone, ref, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING Only</option>
          <option value="APPROVED">APPROVED Only</option>
          <option value="REJECTED">REJECTED Only</option>
        </select>

        {/* Network Filter */}
        <select
          value={networkFilter}
          onChange={(e) => setNetworkFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">All Networks</option>
          <option value="MTN">MTN</option>
          <option value="AIRTEL">AIRTEL</option>
          <option value="GLO">GLO</option>
          <option value="NINE_MOBILE">9MOBILE</option>
        </select>

        {/* Wallet Filter */}
        <select
          value={walletFilter}
          onChange={(e) => setWalletFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: '#0a0f1d',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">All Wallets</option>
          <option value="TASK">Task Wallet</option>
          <option value="AFFILIATE">Affiliate Wallet</option>
        </select>

      </div>

      {/* Transactions Table */}
      <div className="bg-surface" style={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        {filteredTxs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No VTU requests found matching your filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>USER</th>
                  <th style={{ padding: '1rem' }}>SERVICE &amp; NETWORK</th>
                  <th style={{ padding: '1rem' }}>RECIPIENT PHONE</th>
                  <th style={{ padding: '1rem' }}>AMOUNT</th>
                  <th style={{ padding: '1rem' }}>PAYMENT WALLET</th>
                  <th style={{ padding: '1rem' }}>REFERENCE</th>
                  <th style={{ padding: '1rem' }}>STATUS</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: 'white' }}>{tx.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        @{tx.user?.username} • <span style={{ color: 'var(--accent-gold)' }}>{tx.user?.membership?.name || 'USER'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: '900',
                          fontSize: '0.75rem',
                          background: tx.network === 'MTN' ? '#ffcc00' : tx.network === 'AIRTEL' ? '#ff3b30' : '#28c76f',
                          color: tx.network === 'MTN' ? '#000' : '#fff'
                        }}>
                          {tx.network}
                        </span>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {tx.type === 'DATA' ? 'Data Bundle' : 'Airtime'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {tx.planOrBundle || 'Airtime Top-Up'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'white', letterSpacing: '0.5px' }}>
                      {tx.phoneNumber}
                    </td>

                    <td style={{ padding: '1rem', fontWeight: '900', color: 'var(--success)' }}>
                      ₦{tx.amount.toLocaleString()}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        color: tx.walletSource === 'TASK' ? 'var(--accent-blue)' : 'var(--accent-gold)'
                      }}>
                        {tx.walletSource === 'TASK' ? 'Task Wallet' : 'Affiliate Wallet'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {tx.reference}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: tx.status === 'APPROVED' || tx.status === 'SUCCESS'
                          ? 'rgba(40,199,111,0.15)'
                          : tx.status === 'REJECTED'
                          ? 'rgba(255,59,48,0.15)'
                          : 'rgba(212,175,55,0.15)',
                        color: tx.status === 'APPROVED' || tx.status === 'SUCCESS'
                          ? 'var(--success)'
                          : tx.status === 'REJECTED'
                          ? '#ff3b30'
                          : 'var(--accent-gold)'
                      }}>
                        {tx.status}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {tx.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleAdminAction(tx.id, 'APPROVE')}
                              disabled={processingId === tx.id}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                background: 'var(--success)',
                                color: '#000',
                                fontWeight: '900',
                                fontSize: '0.78rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>

                            <button
                              onClick={() => handleAdminAction(tx.id, 'REJECT')}
                              disabled={processingId === tx.id}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                background: 'rgba(255,59,48,0.2)',
                                border: '1px solid rgba(255,59,48,0.5)',
                                color: '#ff3b30',
                                fontWeight: 'bold',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setActiveReceipt(tx)}
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Printer size={12} /> Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin View Receipt Modal */}
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

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '0.2rem' }}>
                EARNIX VTU RECEIPT
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Admin Record Summary
              </div>

              <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>User:</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{activeReceipt.user?.name} (@{activeReceipt.user?.username})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Reference No:</span>
                  <span style={{ color: 'white', fontFamily: 'monospace' }}>{activeReceipt.reference}</span>
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
                  <span style={{ color: 'var(--text-secondary)' }}>Payment Source:</span>
                  <span style={{ color: activeReceipt.walletSource === 'TASK' ? 'var(--accent-blue)' : 'var(--success)', fontWeight: 'bold' }}>
                    {activeReceipt.walletSource === 'TASK' ? 'Task Wallet' : 'Affiliate Wallet'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>Amount:</span>
                  <span style={{ color: 'var(--success)', fontWeight: '900' }}>₦{activeReceipt.amount.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                    color: '#000',
                    fontWeight: '900',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Printer size={16} /> Print Receipt
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 'bold',
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
