'use client';

import { useState, useTransition } from 'react';
import { createNewTask, deleteTask } from './actions';

type Task = {
  id: string;
  title: string;
  description: string;
  platform: string;
  reward: number;
  link: string;
  requiresProof: boolean;
  targetPlan: string;
};

export default function ManageTasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'Facebook',
    reward: 100,
    link: '',
    requiresProof: true,
    targetPlan: 'ALL'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createNewTask(formData);
      if (res.success) {
        alert('Task created successfully!');
        setFormData({
          title: '', description: '', platform: 'Facebook', reward: 100, link: '', requiresProof: true, targetPlan: 'ALL'
        });
      } else {
        alert(res.error || 'Failed to create task');
      }
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      startTransition(async () => {
        const res = await deleteTask(id);
        if (res.success) {
          alert('Task deleted');
        } else {
          alert(res.error || 'Failed to delete');
        }
      });
    }
  };

  return (
    <div className="grid-1-2">
      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', alignSelf: 'start' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Create New Task</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Task Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Share Facebook Post" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Social Platform</label>
            <select name="platform" value={formData.platform} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <option value="Facebook">Facebook</option>
              <option value="Twitter">X (Twitter)</option>
              <option value="Telegram">Telegram</option>
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="YouTube">YouTube</option>
              <option value="Website">Website Link</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Reward Amount (₦)</label>
            <input type="number" name="reward" value={formData.reward} onChange={handleChange} required min={0} placeholder="120" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Task Link (URL)</label>
            <input type="url" name="link" value={formData.link} onChange={handleChange} required placeholder="https://..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Task Description / Instructions</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="Describe what the user needs to do..." style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '80px' }}></textarea>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Target Audience</label>
            <select name="targetPlan" value={formData.targetPlan} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <option value="ALL">General (All Users)</option>
              <option value="FREE">Only FREE Plan Users</option>
              <option value="PRO">Only PRO Plan Users</option>
            </select>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
              <input 
                type="checkbox" 
                name="requiresProof"
                checked={formData.requiresProof}
                onChange={handleChange}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-blue)' }}
              />
              Requires Screenshot Proof
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              If unchecked, users just click the link and instantly earn the reward (PTC style). If checked, they must upload a screenshot for you to approve.
            </p>
          </div>

          <button type="submit" disabled={isPending} className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>
            {isPending ? 'Publishing...' : 'Publish Task'}
          </button>
        </div>
      </form>

      {/* Active Tasks List */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Active Tasks ({initialTasks.length})</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {initialTasks.map(task => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>{task.title}</h3>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '50px', background: task.targetPlan === 'ALL' ? 'rgba(255,255,255,0.1)' : task.targetPlan === 'PRO' ? 'rgba(212,175,55,0.2)' : 'rgba(10,91,255,0.2)', color: task.targetPlan === 'ALL' ? 'white' : task.targetPlan === 'PRO' ? 'var(--accent-gold)' : 'var(--accent-blue)' }}>
                    {task.targetPlan === 'ALL' ? 'General' : `${task.targetPlan} Only`}
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '50px', background: task.requiresProof ? 'rgba(10,91,255,0.2)' : 'rgba(16,185,129,0.2)', color: task.requiresProof ? 'var(--accent-blue)' : 'var(--success)' }}>
                    {task.requiresProof ? 'Proof Required' : 'Auto-Approve'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{task.platform} • ₦{task.reward}</p>
              </div>
              <button 
                onClick={() => handleDeleteTask(task.id)}
                disabled={isPending}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                Delete
              </button>
            </div>
          ))}
          {initialTasks.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No active tasks.</p>
          )}
        </div>
      </div>
    </div>
  );
}
