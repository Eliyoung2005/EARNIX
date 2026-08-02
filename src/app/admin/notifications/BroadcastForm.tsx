'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { broadcastGlobalPopup } from './actions';

export default function BroadcastForm() {
  const router = useRouter();
  const [activePlans, setActivePlans] = useState<{ id: string, name: string }[]>([]);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    link: '',
    targetAudience: 'ALL' as string,
    targetEmail: '',
  });

  useEffect(() => {
    fetch(`/api/plans?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActivePlans(data);
        }
      })
      .catch(err => console.error('Failed to load plans:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in title and message body.');
      return;
    }

    startTransition(async () => {
      const result = await broadcastGlobalPopup(formData);
      if (result.success) {
        alert('Global popup notification broadcasted successfully!');
        setFormData({
          title: '',
          message: '',
          link: '',
          targetAudience: 'ALL',
          targetEmail: '',
        });
        router.refresh();
      } else {
        alert(result.error || 'Failed to broadcast popup.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Send Global Popup (Manual)</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notification Title</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Server Maintenance" 
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notification Type / Audience</label>
          <select 
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            <option value="ALL">All Users</option>
            {activePlans.map(plan => (
              <option key={plan.id} value={plan.name.toUpperCase()}>
                Only {plan.name} Plan Users
              </option>
            ))}
            <option value="SPECIFIC">Specific User (Enter Email)</option>
          </select>
        </div>

        {formData.targetAudience === 'SPECIFIC' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Target User Email</label>
            <input 
              type="email" 
              name="targetEmail"
              value={formData.targetEmail}
              onChange={handleChange}
              placeholder="user@example.com" 
              required
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notification Action Link (Optional)</label>
          <input 
            type="url" 
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://..." 
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            If set, a clickable link button will appear inside the popup for users.
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Message Body</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Type the message that will pop up on user screens..." 
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '120px' }}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="btn-primary" 
          style={{ padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}
        >
          {isPending ? 'Broadcasting...' : 'Broadcast Popup'}
        </button>
      </div>
    </form>
  );
}
