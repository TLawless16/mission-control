'use client';
import { useStore } from '@/lib/store';
import { useClientStore } from '@/lib/clientStore';
import { useState, useEffect, useCallback } from 'react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface DBTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_id: string | null;
  metadata: Record<string, unknown>;
}

function getKanbanColumn(task: DBTask): string {
  const col = task.metadata?.kanban_column as string | undefined;
  if (col) return col;
  switch (task.status) {
    case 'new': return 'todo';
    case 'working': return 'in-progress';
    case 'pending': return 'review';
    case 'completed': return 'done';
    default: return 'backlog';
  }
}

import { View } from '@/components/Sidebar';
import MediaPathWidget from './MediaPathWidget';

export default function Dashboard({ setActiveView }: { setActiveView?: (v: View) => void }) {
  const allProjects = useStore((s) => s.projects);
  const { fetchProjects, projectsLoaded } = useStore();
  const { activeContext, clients } = useClientStore();
  const [dbTasks, setDbTasks] = useState<DBTask[]>([]);

  const isClient = activeContext !== 'platform';
  const projects = isClient ? allProjects.filter(p => p.clientId === activeContext) : allProjects;

  useEffect(() => { if (!projectsLoaded) fetchProjects(); }, [projectsLoaded, fetchProjects]);

  const fetchTasks = useCallback(async () => {
    try {
      const url = activeContext === 'platform' ? '/api/tasks' : `/api/tasks?client_id=${activeContext}`;
      const res = await fetch(url);
      if (res.ok) setDbTasks(await res.json());
    } catch { /* ignore */ }
  }, [activeContext]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const client = isClient ? clients.find((c) => c.id === activeContext) : null;
  const displayName = isClient && client ? client.name : 'Tim';
  const greeting = getGreeting();

  // Project-scoped tasks (have project_id)
  const projectTasks = dbTasks.filter(t => t.project_id);
  const activeTasks = projectTasks.filter(t => getKanbanColumn(t) === 'in-progress').length;
  const completedTasks = projectTasks.filter(t => getKanbanColumn(t) === 'done').length;
  const urgentTasks = projectTasks.filter(t => t.priority === 'urgent' && getKanbanColumn(t) !== 'done');

  // All non-completed DB tasks for "open" count
  const openTaskCount = dbTasks.filter(t => t.status !== 'completed').length;

  const stats = [
    { label: 'Projects', value: projects.length, icon: '📋', color: 'var(--accent-blue)', view: 'projects' as View },
    { label: 'Active Tasks', value: activeTasks, icon: '⚡', color: 'var(--accent-yellow)', view: 'projects' as View },
    { label: 'Open Tasks', value: openTaskCount, icon: '✅', color: 'var(--accent-green)', view: 'todos' as View },
    { label: 'Completed', value: completedTasks, icon: '🏆', color: 'var(--accent-purple)', view: 'todos' as View },
  ];

  const [selectedTask, setSelectedTask] = useState<DBTask | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{greeting}, {displayName} 👋</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {isClient && client ? `${client.company} — ${client.industry}` : "Here's your platform overview"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label}
            onClick={() => setActiveView && setActiveView(s.view)}
            className="rounded-xl p-4 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-3xl font-bold transition-colors" style={{ color: s.color }}>{s.value}</span>
            </div>
            <div className="text-xs font-medium flex justify-between items-center" style={{ color: 'var(--text-secondary)' }}>
              <span>{s.label}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding Media Path */}
      <MediaPathWidget />

      {/* Urgent + Project Progress */}
      <div className="grid grid-cols-2 gap-4">
        {/* Urgent Tasks */}
        <div className="rounded-xl p-5 flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '350px' }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 flex-shrink-0">🔴 Urgent Tasks</h3>
          {urgentTasks.length === 0 ? (
            <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>No urgent tasks — nice!</p>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-2 flex-1" style={{ scrollbarWidth: 'thin' }}>
              {urgentTasks.map((t) => {
                const proj = projects.find((p) => p.id === t.project_id);
                return (
                  <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-hover)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: proj?.color || '#fff' }} />
                    <span className="text-sm flex-1">{t.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent-red)', color: 'white' }}>urgent</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Progress */}
        <div className="rounded-xl p-5 flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '350px' }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 flex-shrink-0">📊 Project Progress</h3>
          <div className="space-y-3 overflow-y-auto pr-2 flex-1" style={{ scrollbarWidth: 'thin' }}>
            {projects.map((p) => {
              const projTasks = projectTasks.filter((t) => t.project_id === p.id);
              const done = projTasks.filter((t) => getKanbanColumn(t) === 'done').length;
              const pct = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;
              return (
                <div key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer group p-1.5 -mx-1.5 rounded-lg transition-colors hover:bg-white/5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium group-hover:text-blue-400 transition-colors">{p.name} ↗</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{done}/{projTasks.length}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bg-hover)' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="rounded-xl p-5 flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '350px' }}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 flex-shrink-0">📝 Recent Open Tasks</h3>
        {openTaskCount === 0 ? (
          <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>All clear! Add tasks from the Task List view.</p>
        ) : (
          <div className="space-y-2 overflow-y-auto pr-2 flex-1" style={{ scrollbarWidth: 'thin' }}>
            {dbTasks.filter(t => t.status !== 'completed').slice(0, 20).map((t) => (
              <div key={t.id} onClick={() => setSelectedTask(t)} className="flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border)]" style={{ background: 'var(--bg-hover)' }}>
                <span className={`w-2 h-2 rounded-full ${t.priority === 'high' || t.priority === 'urgent' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                <span className="flex-1">{t.title}</span>
                <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{t.status}</span>
                <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100">↗</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -- Modals -- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Inspect Task</h3>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Title</span>
                <p className="font-medium">{selectedTask.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                  <p className="capitalize px-2 py-1 bg-white/5 rounded text-sm inline-block mt-1">{selectedTask.status}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Priority</span>
                  <p className="capitalize px-2 py-1 bg-white/5 rounded text-sm inline-block mt-1">{selectedTask.priority}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedTask(null); setActiveView && setActiveView('todos'); }} className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">Go to Task List</button>
              <button onClick={() => setSelectedTask(null)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProject(null)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: selectedProject.color }} />
                Inspect Project
              </h3>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Name</span>
                <p className="font-medium text-lg">{selectedProject.name}</p>
              </div>
              {selectedProject.description && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Description</span>
                  <p className="text-sm text-gray-300 mt-1">{selectedProject.description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedProject(null); setActiveView && setActiveView('projects'); }} className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">Go to Kanban Board</button>
              <button onClick={() => setSelectedProject(null)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
