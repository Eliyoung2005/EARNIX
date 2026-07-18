'use client';

import { useState } from 'react';

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const tasks = [
    { id: 1, title: 'Share Promotional Video on TikTok', reward: 120, platform: 'TikTok', status: 'Available' },
    { id: 2, title: 'Retweet Official EARNIX Launch', reward: 80, platform: 'Twitter', status: 'Available' },
    { id: 3, title: 'Subscribe to our YouTube Channel', reward: 120, platform: 'YouTube', status: 'Completed' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Sponsored Tasks</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Complete daily tasks to earn extra money. Upload a screenshot as proof of completion.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Available Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => task.status === 'Available' ? setSelectedTask(task.id) : null}
              className="bg-surface" 
              style={{ 
                padding: '1.5rem', 
                borderRadius: '12px', 
                border: selectedTask === task.id ? '2px solid var(--accent-blue)' : '1px solid transparent',
                cursor: task.status === 'Available' ? 'pointer' : 'not-allowed',
                opacity: task.status === 'Completed' ? 0.6 : 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{task.title}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Platform: {task.platform}</span>
                  <span style={{ color: task.status === 'Available' ? 'var(--accent-gold)' : 'var(--success)' }}>{task.status}</span>
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>+₦{task.reward}</div>
            </div>
          ))}
        </div>

        {/* Task Submission Form */}
        <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
          {selectedTask ? (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Submit Proof</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Task Link</label>
                <a href="#" target="_blank" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Click here to perform the task</a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="proof" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Upload Screenshot</label>
                <input 
                  type="file" 
                  id="proof" 
                  accept="image/*"
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer' }}
                />
              </div>

              <button type="button" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Submit for Review</button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
              Select an available task to submit proof.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
