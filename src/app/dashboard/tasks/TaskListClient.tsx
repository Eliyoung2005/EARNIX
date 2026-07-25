'use client';

import { useState } from 'react';
import { submitTaskProof } from './actions';

// We can put the ImgBB API key here or in env. Since it's for frontend upload and it's free, it's generally okay, but env is safer. 
// For this MVP, we will use a demo key or the user can swap it. 
// However, the standard practice is to use the environment variable.
const IMGBB_API_KEY = '5db77a58a623a9d7bb3627702f231e34'; // Using a public/demo or placeholder key. The user should replace this in production.

type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  link: string;
  platform: string;
  status: string;
  requiresProof: boolean;
};

type TaskSubmission = {
  taskId: string;
  status: string;
};

export default function TaskListClient({ 
  tasks, 
  userSubmissions 
}: { 
  tasks: Task[],
  userSubmissions: TaskSubmission[]
}) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasClickedLink, setHasClickedLink] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Map tasks to their current status for this user
  const mappedTasks = tasks.map(task => {
    const submission = userSubmissions.find(s => s.taskId === task.id);
    let userStatus = 'Available';
    if (submission) {
      userStatus = submission.status === 'PENDING' ? 'Under Review' : 
                   submission.status === 'APPROVED' ? 'Completed' : 'Rejected';
    }
    return { ...task, userStatus };
  });

  const handleTaskSelection = (taskId: string) => {
    setSelectedTaskId(taskId);
    setFile(null);
    setError('');
    setSuccess('');
    setHasClickedLink(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedTask) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Upload to ImgBB
      const formData = new FormData();
      formData.append('image', file);

      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const imgbbData = await imgbbRes.json();

      if (!imgbbData.success) {
        throw new Error('Failed to upload image. Please try again.');
      }

      const proofUrl = imgbbData.data.url;

      // 2. Submit to our Server Action
      const result = await submitTaskProof(selectedTask.id, proofUrl);

      if (result.success) {
        setSuccess('Task proof submitted successfully! It is now under review.');
        setFile(null);
        setSelectedTaskId(null);
        setHasClickedLink(false);
      } else {
        setError(result.error || 'Failed to submit task proof.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      
      {/* Available Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mappedTasks.map((task) => {
          const isSelectable = task.userStatus === 'Available' || task.userStatus === 'Rejected';
          const isSelected = selectedTaskId === task.id;

          return (
            <div 
              key={task.id} 
              onClick={() => isSelectable ? handleTaskSelection(task.id) : null}
              className="bg-surface" 
              style={{ 
                padding: '1.5rem', 
                borderRadius: '12px', 
                border: isSelected ? '2px solid var(--accent-blue)' : '1px solid transparent',
                cursor: isSelectable ? 'pointer' : 'not-allowed',
                opacity: task.userStatus === 'Completed' || task.userStatus === 'Under Review' ? 0.6 : 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{task.title}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{task.platform}</span>
                  <span style={{ 
                    color: task.userStatus === 'Available' ? 'var(--accent-gold)' : 
                           task.userStatus === 'Under Review' ? 'var(--accent-blue)' :
                           task.userStatus === 'Completed' ? 'var(--success)' : '#ff3b30'
                  }}>
                    {task.userStatus}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>+₦{task.reward}</div>
            </div>
          )
        })}
        {mappedTasks.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No active tasks available right now.</div>
        )}
      </div>

      {/* Task Submission Form */}
      <div className="bg-surface" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
        {error && <div style={{ padding: '1rem', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}
        
        {selectedTask ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              Submit Proof for {selectedTask.platform} Task
            </h2>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {selectedTask.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Task Link</label>
              <a 
                href={selectedTask.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setHasClickedLink(true)}
                style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}
              >
                Click here to open the post/video
              </a>
            </div>

            {selectedTask.requiresProof ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="proof" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Upload Screenshot</label>
                  <input 
                    type="file" 
                    id="proof" 
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isUploading || !file}
                  className="btn-primary" 
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  {isUploading ? 'Uploading...' : 'Submit for Review'}
                </button>
              </>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(255, 184, 0, 0.1)', borderRadius: '8px' }}>
                  This task does not require a screenshot. Simply visit the link and click Complete below to instantly claim your reward!
                </p>
                <button 
                  type="button" 
                  onClick={async () => {
                    setIsUploading(true);
                    setError('');
                    setSuccess('');
                    const res = await submitTaskProof(selectedTask.id);
                    setIsUploading(false);
                    if (res.success) {
                      setSuccess('Task completed! Your wallet has been credited.');
                      setSelectedTaskId(null);
                      setHasClickedLink(false);
                    } else {
                      setError(res.error || 'Failed to complete task.');
                    }
                  }}
                  disabled={isUploading || !hasClickedLink}
                  className="btn-primary" 
                  style={{ width: '100%', opacity: (!hasClickedLink || isUploading) ? 0.5 : 1, cursor: (!hasClickedLink || isUploading) ? 'not-allowed' : 'pointer' }}
                >
                  {isUploading ? 'Processing...' : hasClickedLink ? 'Mark as Completed' : 'Please click the link first'}
                </button>
              </div>
            )}
          </form>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
            Select an available task on the left to submit your proof.
          </div>
        )}
      </div>

    </div>
  );
}
