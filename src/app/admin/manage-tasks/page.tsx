'use client';

import { useState } from 'react';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Share Promotional Video on TikTok', reward: 120, platform: 'TikTok', status: 'Active' },
    { id: 2, title: 'Retweet EARNIX Launch Post', reward: 100, platform: 'X (Twitter)', status: 'Active' }
  ]);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Manage Sponsored Tasks</h1>

      <div className="grid-1-2">
        
        {/* Create Task Form */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Create New Task</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Task Title</label>
              <input type="text" placeholder="e.g. Share Facebook Post" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Social Platform</label>
              <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">X (Twitter)</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Reward Amount (₦)</label>
              <input type="number" placeholder="120" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Post Link / Instructions</label>
              <textarea placeholder="Paste the link users need to share..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px' }}></textarea>
            </div>

            <button className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>Publish Task</button>
          </div>
        </div>

        {/* Active Tasks List */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Active Tasks</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>{task.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{task.platform} • ₦{task.reward}</p>
                </div>
                <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#ff3b30', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Delete</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
