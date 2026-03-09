'use client';
import { create } from 'zustand';
import { useState, useEffect, useCallback } from 'react';

type IdeaStatus = 'new' | 'reviewing' | 'approved' | 'in_progress' | 'implemented' | 'rejected';

interface Idea {
  id: string;
  text: string;
  context: string | null;
  status: IdeaStatus;
  agent_note: string | null;
  created_at: string;
  updated_at: string;
}

// Lightweight global state just for badge counts (used by Sidebar)
interface IdeaState {
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
}

export const useIdeaStore = create<IdeaState>()((set) => ({
  ideas: [],
  setIdeas: (ideas) => set({ ideas }),
}));

const STATUS_META: Record<IdeaStatus, { icon: string; color: string; label: string }> = {
  new: { icon: '🆕', color: '#3b82f6', label: 'New' },
  reviewing: { icon: '👀', color: '#f59e0b', label: 'Reviewing' },
  approved: { icon: '✅', color: '#10b981', label: 'Approved' },
  in_progress: { icon: '⚡', color: '#8b5cf6', label: 'In Progress' },
  implemented: { icon: '🚀', color: '#06b6d4', label: 'Implemented' },
  rejected: { icon: '⊘', color: '#6b7280', label: 'Dismissed' },
};

const STATUSES: IdeaStatus[] = ['new', 'reviewing', 'approved', 'in_progress', 'implemented', 'rejected'];
const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';

export default function IdeaInbox({ context }: { context: string }) {
  const { setIdeas } = useIdeaStore();
  const [ideas, setLocalIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const params = context === 'platform' ? '' : `&client_id=${context}`;
      const res = await fetch(`/api/ideas?org_id=${PLATFORM_ORG}${params}`);
      if (res.ok) {
        const data = await res.json();
        // Filter by context: platform ideas have no client_id, client ideas have client_id
        const filtered = context === 'platform'
          ? data.filter((i: Idea & { client_id?: string }) => !i.client_id)
          : data;
        setLocalIdeas(filtered);
        setIdeas(filtered);
      }
    } catch (e) { console.error('Failed to fetch ideas:', e); }
    setLoading(false);
  }, [context, setIdeas]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const addIdea = async () => {
    if (!text.trim()) return;
    try {
      const body: Record<string, unknown> = {
        text: text.trim(),
        org_id: PLATFORM_ORG,
      };
      if (context !== 'platform') body.client_id = context;
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setText('');
        fetchIdeas();
      }
    } catch (e) { console.error('Failed to create idea:', e); }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    try {
      await fetch('/api/ideas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      fetchIdeas();
    } catch (e) { console.error('Failed to update idea:', e); }
  };

  const deleteIdea = async (id: string) => {
    // Use PATCH to mark rejected since no DELETE endpoint
    try {
      await fetch('/api/ideas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      fetchIdeas();
    } catch (e) { console.error('Failed to delete idea:', e); }
  };

  const filtered = filter === 'all' ? ideas : ideas.filter((i) => i.status === filter);
  const newCount = ideas.filter((i) => i.status === 'new').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">💡 Idea Inbox</h2>
        {newCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--accent-blue)', color: 'white' }}>{newCount} new</span>
        )}
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addIdea()}
          placeholder="Quick idea — type and hit Enter..."
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <button onClick={addIdea} className="px-5 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'var(--accent-blue)', color: 'white' }}>💡 Add</button>
      </div>

      {/* Filters */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setFilter('all')} className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: filter === 'all' ? 'var(--accent-blue)' : 'var(--bg-card)', color: filter === 'all' ? 'white' : 'var(--text-secondary)' }}>
          All ({ideas.length})
        </button>
        {STATUSES.map((s) => {
          const sm = STATUS_META[s];
          const count = ideas.filter((i) => i.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: filter === s ? sm.color : 'var(--bg-card)', color: filter === s ? 'white' : 'var(--text-secondary)' }}>
              {sm.icon} {sm.label} {count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading ideas...</p>}

      {/* Ideas */}
      {!loading && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
              No ideas yet. Type one above — don&apos;t lose that thought! 💭
            </div>
          )}
          {filtered.map((idea) => {
            const sm = STATUS_META[idea.status] || STATUS_META.new;
            return (
              <div key={idea.id} className="rounded-xl p-4 group" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">{sm.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{idea.text}</p>
                    {idea.agent_note && (
                      <div className="text-xs p-2 rounded-lg mb-2" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                        🤖 Jarvis: {idea.agent_note}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--border)' }}>{new Date(idea.created_at).toLocaleString()}</span>
                      <select value={idea.status} onChange={(e) => updateIdea(idea.id, { status: e.target.value as IdeaStatus })}
                        className="text-xs px-2 py-0.5 rounded outline-none cursor-pointer" style={{ background: sm.color + '22', color: sm.color, border: 'none' }}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s} style={{ background: '#1a1a2e', color: '#e4e4e7' }}>{STATUS_META[s].icon} {STATUS_META[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => deleteIdea(idea.id)} className="opacity-0 group-hover:opacity-100 text-xs" style={{ color: 'var(--accent-red)' }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
