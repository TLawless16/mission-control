'use client';
import { useStore, Priority, Project } from '@/lib/store';
import { useState, useEffect, useCallback } from 'react';

export type KanbanColumn = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

const COLUMNS: { id: KanbanColumn; label: string; icon: string }[] = [
  { id: 'backlog', label: 'Backlog', icon: '📥' },
  { id: 'todo', label: 'To Do', icon: '📋' },
  { id: 'in-progress', label: 'In Progress', icon: '⚡' },
  { id: 'review', label: 'Review', icon: '🔍' },
  { id: 'done', label: 'Done', icon: '✅' },
];

const PROJECT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', urgent: '#ff2d55',
};

// Map kanban columns to DB task statuses
const COLUMN_TO_STATUS: Record<KanbanColumn, string> = {
  backlog: 'new', todo: 'new', 'in-progress': 'working', review: 'pending', done: 'completed',
};

interface DBTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: Priority;
  project_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

function getKanbanColumn(task: DBTask): KanbanColumn {
  const col = task.metadata?.kanban_column as string | undefined;
  if (col && COLUMNS.some(c => c.id === col)) return col as KanbanColumn;
  // Fallback: derive from status
  switch (task.status) {
    case 'new': return 'todo';
    case 'working': return 'in-progress';
    case 'pending': return 'review';
    case 'completed': return 'done';
    default: return 'backlog';
  }
}

export default function Kanban() {
  const { projects, activeProject, setActiveProject, fetchProjects, projectsLoaded, updateProject } = useStore();
  useEffect(() => { if (!projectsLoaded) fetchProjects(); }, [projectsLoaded, fetchProjects]);

  const [tasks, setTasks] = useState<DBTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<KanbanColumn | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Edit project state
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');
  const [editProjColor, setEditProjColor] = useState('');

  const startEditProject = (p: Project) => {
    setEditingProject(p.id);
    setEditProjName(p.name);
    setEditProjDesc(p.description);
    setEditProjColor(p.color);
  };

  const saveEditProject = () => {
    if (editingProject && editProjName.trim()) {
      updateProject(editingProject, editProjName.trim(), editProjDesc.trim(), editProjColor);
      setEditingProject(null);
    }
  };

  // Fetch tasks from DB when project changes
  const fetchTasks = useCallback(async () => {
    if (!activeProject) { setTasks([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?project_id=${activeProject}`);
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error('Failed to fetch project tasks:', e); }
    setLoading(false);
  }, [activeProject]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Also fetch all tasks when viewing "All Projects"
  const fetchAllProjectTasks = useCallback(async () => {
    if (activeProject) return;
    setLoading(true);
    try {
      // Fetch all tasks that have a project_id
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const all: DBTask[] = await res.json();
        setTasks(all.filter(t => t.project_id));
      }
    } catch (e) { console.error('Failed to fetch tasks:', e); }
    setLoading(false);
  }, [activeProject]);

  useEffect(() => { if (!activeProject) fetchAllProjectTasks(); }, [activeProject, fetchAllProjectTasks]);

  const handleAdd = async (column: KanbanColumn) => {
    if (!newTitle.trim() || !activeProject) return;
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          priority: newPriority,
          project_id: activeProject,
          status: COLUMN_TO_STATUS[column],
          metadata: { kanban_column: column },
        }),
      });
      setNewTitle('');
      setNewDesc('');
      setAdding(null);
      fetchTasks();
    } catch (e) { console.error('Failed to add task:', e); }
  };

  const moveTask = async (taskId: string, column: KanbanColumn) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: COLUMN_TO_STATUS[column], metadata: { ...t.metadata, kanban_column: column } } : t));
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: COLUMN_TO_STATUS[column],
          metadata: { ...(tasks.find(t => t.id === taskId)?.metadata || {}), kanban_column: column },
        }),
      });
    } catch (e) { console.error('Failed to move task:', e); fetchTasks(); }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
    } catch (e) { console.error('Failed to delete task:', e); fetchTasks(); }
  };

  const handleDrop = (column: KanbanColumn) => {
    if (draggedTask) {
      moveTask(draggedTask, column);
      setDraggedTask(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📋 Projects & Tasks</h2>
      </div>

      {/* Project tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveProject(null)}
          className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background: !activeProject ? 'var(--accent-blue)' : 'var(--bg-card)', color: !activeProject ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          All Projects
        </button>
        {projects.map((p) => (
          <div key={p.id} className="relative group flex items-center">
            <button onClick={() => setActiveProject(p.id)}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
              style={{ background: activeProject === p.id ? p.color : 'var(--bg-card)', color: activeProject === p.id ? 'white' : 'var(--text-secondary)', border: `1px solid ${activeProject === p.id ? p.color : 'var(--border)'}` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: activeProject === p.id ? 'white' : p.color }} />
              {p.name}
            </button>
            {activeProject === p.id && (
              <button onClick={(e) => { e.stopPropagation(); startEditProject(p); }}
                className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity px-1"
                style={{ color: 'var(--text-secondary)' }}>✏️</button>
            )}
          </div>
        ))}
      </div>

      {/* Edit Project Form */}
      {editingProject && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-blue)' }}>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Edit Project</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</div>
              <input value={editProjName} onChange={(e) => setEditProjName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</div>
              <input value={editProjDesc} onChange={(e) => setEditProjDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Color</div>
              <div className="flex gap-2 items-center">
                {PROJECT_COLORS.map((c) => (
                  <button key={c} onClick={() => setEditProjColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform"
                    style={{ background: c, borderColor: editProjColor === c ? 'white' : 'transparent', transform: editProjColor === c ? 'scale(1.2)' : 'scale(1)' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEditProject} className="px-4 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'var(--accent-blue)', color: 'white' }}>Save</button>
            <button onClick={() => setEditingProject(null)} className="px-4 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban board */}
      {loading && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>}

      {!loading && (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 160px)' }}>
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => getKanbanColumn(t) === col.id);
            return (
              <div key={col.id} className="flex-shrink-0 rounded-xl p-3 flex flex-col"
                style={{ width: 280, height: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span>{col.icon}</span>
                    <span className="text-sm font-bold">{col.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                      {colTasks.length}
                    </span>
                  </div>
                  {activeProject && (
                    <button onClick={() => setAdding(col.id)} className="text-lg leading-none" style={{ color: 'var(--text-secondary)' }}>+</button>
                  )}
                </div>

                {/* Cards — scrollable */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                  {colTasks.map((task) => {
                    const proj = projects.find((p) => p.id === task.project_id);
                    return (
                      <div key={task.id} draggable onDragStart={() => setDraggedTask(task.id)}
                        className="kanban-card rounded-lg p-3 cursor-grab active:cursor-grabbing group"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium">{task.title}</span>
                          <button onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-xs transition-opacity" style={{ color: 'var(--accent-red)' }}>✕</button>
                        </div>
                        {task.description && (
                          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {proj && (
                              <>
                                <span className="w-2 h-2 rounded-full" style={{ background: proj.color }} />
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{proj.name}</span>
                              </>
                            )}
                          </div>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority] }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add card form */}
                  {adding === col.id && activeProject && (
                    <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-blue)' }}>
                      <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title..."
                        className="w-full px-2 py-1.5 rounded text-sm outline-none" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }} autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd(col.id)} />
                      <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)"
                        className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none" rows={2} style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }} />
                      <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)}
                        className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => handleAdd(col.id)} className="flex-1 py-1.5 rounded text-xs font-medium"
                          style={{ background: 'var(--accent-blue)', color: 'white' }}>Add</button>
                        <button onClick={() => setAdding(null)} className="flex-1 py-1.5 rounded text-xs font-medium"
                          style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
