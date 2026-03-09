'use client';
import { useState, useEffect, useCallback } from 'react';
import { useClientStore } from '@/lib/clientStore';

type TaskStatus = 'new' | 'working' | 'pending' | 'completed';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface DBTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  category: string;
  assigned_to: string | null;
  assigned_agent: string | null;
  client_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  completion_summary: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', urgent: '#ff2d55',
};
const PRIORITY_ICONS: Record<Priority, string> = {
  low: '🔵', medium: '🟡', high: '🔴', urgent: '🚨',
};

const STATUS_META: Record<TaskStatus, { icon: string; color: string; label: string }> = {
  new: { icon: '🆕', color: '#3b82f6', label: 'New' },
  working: { icon: '⚡', color: '#f59e0b', label: 'Working' },
  pending: { icon: '⏳', color: '#8b5cf6', label: 'Pending' },
  completed: { icon: '✅', color: '#10b981', label: 'Completed' },
};

const STATUSES: TaskStatus[] = ['new', 'working', 'pending', 'completed'];
const ASSIGNEES = ['Admin', 'Jarvis', 'AntiGravity', 'Content Agent', 'Research Agent', 'Code Manager', 'QA Agent', 'SEO Agent', 'Social Media Agent', 'Compliance Agent', 'Customer Support Agent', 'Sales Agent', 'Marketing Agent', 'Accounting Agent', 'Unassigned'];
const CATEGORIES = ['general', 'development', 'content', 'research', 'client', 'admin', 'urgent'];
const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';

export default function TaskList() {
  const { activeContext } = useClientStore();
  const isClientContext = activeContext !== 'platform';

  const [tasks, setTasks] = useState<DBTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssign, setFilterAssign] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

  // Add form state
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignedTo, setAssignedTo] = useState('Jarvis');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('general');

  // Edit state
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editAssign, setEditAssign] = useState('Jarvis');
  const [editDue, setEditDue] = useState('');
  const [editCat, setEditCat] = useState('general');
  const [editStatus, setEditStatus] = useState<TaskStatus>('new');
  const [editSummary, setEditSummary] = useState('');

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientTasks, setShowClientTasks] = useState(false);

  // Client assignment state (create form)
  type AssignTarget = 'platform' | 'client';
  const [assignTarget, setAssignTarget] = useState<AssignTarget>('platform');
  const [clientList, setClientList] = useState<{ id: string; name: string }[]>([]);
  const [contactList, setContactList] = useState<{ id: string; name: string; role: string | null }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedContactName, setSelectedContactName] = useState('');

  // Client assignment state (edit form)
  const [editAssignTarget, setEditAssignTarget] = useState<AssignTarget>('platform');
  const [editClientId, setEditClientId] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactList, setEditContactList] = useState<{ id: string; name: string; role: string | null }[]>([]);

  // Fetch clients on mount
  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(data => {
      setClientList(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    }).catch(() => { });
  }, []);

  // Fetch contacts when client selected (create)
  useEffect(() => {
    if (selectedClientId) {
      fetch(`/api/clients/contacts?client_id=${selectedClientId}`).then(r => r.json()).then(data => {
        setContactList(data);
      }).catch(() => { });
    } else {
      setContactList([]);
    }
  }, [selectedClientId]);

  // Fetch contacts when client selected (edit)
  useEffect(() => {
    if (editClientId) {
      fetch(`/api/clients/contacts?client_id=${editClientId}`).then(r => r.json()).then(data => {
        setEditContactList(data);
      }).catch(() => { });
    } else {
      setEditContactList([]);
    }
  }, [editClientId]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const url = isClientContext ? `/api/tasks?client_id=${activeContext}` : '/api/tasks';
      const res = await fetch(url);
      if (res.ok) {
        const allTasks: DBTask[] = await res.json();
        setTasks(allTasks);
      }
    } catch (e) { console.error('Failed to fetch tasks:', e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async () => {
    if (!text.trim()) return;
    const isClientAssign = assignTarget === 'client' && selectedClientId;
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: isClientAssign ? undefined : PLATFORM_ORG,
          client_id: isClientAssign ? selectedClientId : null,
          title: text.trim(),
          description: desc.trim() || null,
          priority,
          assigned_agent: assignTarget === 'platform' && assignedTo !== 'Admin' ? assignedTo : null,
          category,
          due_date: dueDate || null,
          metadata: {
            assigned_label: assignTarget === 'client' ? selectedContactName || 'Client' : assignedTo,
            assign_target: assignTarget,
            client_contact: assignTarget === 'client' ? selectedContactName : null,
          },
        }),
      });
      setText(''); setDesc(''); setDueDate(''); setShowAdd(false);
      setAssignTarget('platform'); setSelectedClientId(''); setSelectedContactName('');
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  const updateTask = async (id: string, updates: Record<string, unknown>) => {
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (id: string) => {
    try { await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' }); fetchTasks(); } catch (e) { console.error(e); }
  };

  const getAssignLabel = (t: DBTask) => (t.metadata as Record<string, string>)?.assigned_label || t.assigned_agent || 'Unassigned';

  const assignees = [...new Set(tasks.map(getAssignLabel))];

  const filtered = tasks.filter((t) => {
    if (!isClientContext) {
      // Client tasks toggle: when off, show only platform tasks; when on, show only client tasks
      const isClientTask = !!t.client_id;
      if (showClientTasks && !isClientTask) return false;
      if (!showClientTasks && isClientTask) return false;
    }
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterAssign !== 'all' && getAssignLabel(t) !== filterAssign) return false;
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const startEdit = (task: DBTask) => {
    setEditing(task.id);
    setEditText(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditAssign(getAssignLabel(task));
    setEditDue(task.due_date ? task.due_date.split('T')[0] : '');
    setEditCat(task.category || 'general');
    setEditStatus(task.status);
    setEditSummary(task.completion_summary || '');
    // Client assignment
    const meta = task.metadata as Record<string, string>;
    if (task.client_id || meta?.assign_target === 'client') {
      setEditAssignTarget('client');
      setEditClientId(task.client_id || '');
      setEditContactName(meta?.client_contact || '');
    } else {
      setEditAssignTarget('platform');
      setEditClientId('');
      setEditContactName('');
    }
  };

  const saveEdit = () => {
    if (editing && editText.trim()) {
      const isClientAssign = editAssignTarget === 'client' && editClientId;
      updateTask(editing, {
        title: editText.trim(),
        description: editDesc.trim() || null,
        priority: editPriority,
        assigned_agent: editAssignTarget === 'platform' && editAssign !== 'Admin' ? editAssign : null,
        client_id: isClientAssign ? editClientId : null,
        category: editCat,
        due_date: editDue || null,
        status: editStatus,
        completion_summary: editSummary.trim() || null,
        metadata: {
          assigned_label: editAssignTarget === 'client' ? editContactName || 'Client' : editAssign,
          assign_target: editAssignTarget,
          client_contact: editAssignTarget === 'client' ? editContactName : null,
        },
      });
      setEditing(null);
    }
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedId) { updateTask(draggedId, { status }); setDraggedId(null); }
  };

  // Inline status change directly on card
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  // ── Card Render (Kanban + List) ──
  const renderCard = (task: DBTask) => (
    <div key={task.id} draggable onDragStart={() => setDraggedId(task.id)}
      className="rounded-lg p-3 cursor-grab active:cursor-grabbing group mb-2"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Title + actions */}
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: '#e4e4e7' }}>{task.title}</span>
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 flex-shrink-0 ml-2">
          <button onClick={() => startEdit(task)} className="text-xs px-1" style={{ color: '#3b82f6' }}>✏️</button>
          <button onClick={() => deleteTask(task.id)} className="text-xs px-1" style={{ color: '#ef4444' }}>✕</button>
        </div>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs mb-2" style={{ color: '#71717a' }}>{task.description.length > 100 ? task.description.slice(0, 100) + '...' : task.description}</p>
      )}

      {/* Inline fields row: Priority, Status dropdown, Assigned */}
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        {/* Priority badge */}
        <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority] }}>
          {PRIORITY_ICONS[task.priority]} {task.priority}
        </span>

        {/* Status dropdown — VISIBLE on card */}
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
          className="text-xs px-1.5 py-0.5 rounded outline-none cursor-pointer font-medium"
          style={{ background: STATUS_META[task.status].color + '22', color: STATUS_META[task.status].color, border: 'none' }}>
          {STATUSES.map((s) => (
            <option key={s} value={s} style={{ background: '#1a1a2e', color: '#e4e4e7' }}>{STATUS_META[s].icon} {STATUS_META[s].label}</option>
          ))}
        </select>

        {/* Assigned */}
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#ffffff11', color: '#a1a1aa' }}>
          👤 {getAssignLabel(task)}
        </span>

        {/* Due date */}
        {task.due_date && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{
            background: new Date(task.due_date) < new Date() && task.status !== 'completed' ? '#ef444422' : '#ffffff11',
            color: new Date(task.due_date) < new Date() && task.status !== 'completed' ? '#ef4444' : '#a1a1aa'
          }}>📅 {new Date(task.due_date).toLocaleDateString()}</span>
        )}

        {/* Category */}
        {task.category && task.category !== 'general' && (
          <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ background: '#ffffff11', color: '#a1a1aa' }}>{task.category}</span>
        )}
      </div>

      {/* Dates */}
      <div className="text-xs" style={{ color: '#4b5563' }}>
        Created: {new Date(task.created_at).toLocaleDateString()}
        {task.completed_at && ` · Completed: ${new Date(task.completed_at).toLocaleDateString()}`}
      </div>

      {/* Completion Summary — expandable */}
      {task.completion_summary && (
        <div className="mt-2">
          <button onClick={() => setExpandedSummary(expandedSummary === task.id ? null : task.id)}
            className="text-xs font-medium flex items-center gap-1" style={{ color: '#10b981' }}>
            📝 Task Summary {expandedSummary === task.id ? '▼' : '▶'}
          </button>
          {expandedSummary === task.id && (
            <div className="mt-1 p-2 rounded text-xs whitespace-pre-wrap" style={{ background: '#10b98111', color: '#a1a1aa', border: '1px solid #10b98133' }}>
              {task.completion_summary}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Edit Card ──
  const renderEditCard = (task: DBTask) => (
    <div key={task.id} className="rounded-lg p-3 space-y-2 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid #3b82f6' }}>
      <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Task Description</div>
      <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
        className="w-full px-2 py-1.5 rounded text-sm outline-none resize-y"
        rows={2} style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }} autoFocus />

      <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Details</div>
      <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
        className="w-full px-2 py-1.5 rounded text-sm outline-none resize-y"
        rows={3} style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }} placeholder="Additional details..." />

      {/* Assignment target toggle */}
      <div className="space-y-1">
        <div className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Assign To</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setEditAssignTarget('platform'); setEditClientId(''); setEditContactName(''); }}
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{ background: editAssignTarget === 'platform' ? '#3b82f6' : '#222240', color: editAssignTarget === 'platform' ? 'white' : '#a1a1aa' }}>
            🏢 Platform / Agent
          </button>
          <button type="button" onClick={() => setEditAssignTarget('client')}
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{ background: editAssignTarget === 'client' ? '#ef4444' : '#222240', color: editAssignTarget === 'client' ? 'white' : '#a1a1aa' }}>
            👤 Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Priority</div>
          <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)}
            className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }}>
            <option value="low">🔵 Low</option><option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option><option value="urgent">🚨 Urgent</option>
          </select>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Status</div>
          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
            className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].icon} {STATUS_META[s].label}</option>)}
          </select>
        </div>

        {/* Platform assignment */}
        {editAssignTarget === 'platform' && (
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Assigned To</div>
            <select value={editAssign} onChange={(e) => setEditAssign(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }}>
              {ASSIGNEES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        {/* Client assignment — Company */}
        {editAssignTarget === 'client' && (
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#ef4444' }}>Company</div>
            <select value={editClientId} onChange={(e) => { setEditClientId(e.target.value); setEditContactName(''); }}
              className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #ef444444' }}>
              <option value="">Select company...</option>
              {clientList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Client assignment — Person */}
        {editAssignTarget === 'client' && editClientId && (
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#ef4444' }}>Person</div>
            <select value={editContactName} onChange={(e) => setEditContactName(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #ef444444' }}>
              <option value="">General (no specific person)</option>
              <option value="Admin">Admin</option>
              {editContactList.map((c) => <option key={c.id} value={c.name}>{c.name}{c.role ? ` — ${c.role}` : ''}</option>)}
            </select>
          </div>
        )}

        <div>
          <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Due Date</div>
          <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)}
            className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }} />
        </div>
      </div>

      <div>
        <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Category</div>
        <select value={editCat} onChange={(e) => setEditCat(e.target.value)}
          className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }}>
          {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
      </div>

      <div>
        <div className="text-xs font-medium mb-1" style={{ color: '#10b981' }}>📝 Task Summary (Completion Notes)</div>
        <textarea value={editSummary} onChange={(e) => setEditSummary(e.target.value)}
          className="w-full px-2 py-1.5 rounded text-sm outline-none resize-y"
          rows={5} style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #10b98144' }}
          placeholder="Document what was done to complete this task: changes made, files modified, test results, known issues..." />
      </div>

      <div className="flex gap-2">
        <button onClick={saveEdit} className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#3b82f6', color: 'white' }}>Save</button>
        <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#222240', color: '#a1a1aa' }}>Cancel</button>
      </div>
    </div>
  );

  // ── Kanban View ──
  const renderKanban = () => (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 160px)' }}>
      {STATUSES.map((status) => {
        const sm = STATUS_META[status];
        const items = filtered.filter((t) => t.status === status);
        return (
          <div key={status} className="flex-shrink-0 rounded-xl p-3 flex flex-col"
            style={{ width: 310, height: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(status)}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span>{sm.icon}</span>
              <span className="text-sm font-bold" style={{ color: '#e4e4e7' }}>{sm.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: sm.color + '22', color: sm.color }}>{items.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {items.map((task) => editing === task.id ? renderEditCard(task) : renderCard(task))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#e4e4e7' }}>📋 Task List</h2>
        <div className="flex gap-2">
          <div className="flex gap-1 rounded-lg p-0.5" style={{ background: 'var(--bg-card)' }}>
            <button onClick={() => setViewMode('kanban')} className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ background: viewMode === 'kanban' ? '#3b82f6' : 'transparent', color: viewMode === 'kanban' ? 'white' : '#a1a1aa' }}>Kanban</button>
            <button onClick={() => setViewMode('list')} className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ background: viewMode === 'list' ? '#3b82f6' : 'transparent', color: viewMode === 'list' ? 'white' : '#a1a1aa' }}>List</button>
          </div>
          <button className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <span className="text-lg leading-none">🎬</span> Watch Tutorial
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#3b82f6', color: 'white' }}>+ New Task</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {!isClientContext && (
          <>
            <div className="flex gap-1">
              <button onClick={() => { setShowClientTasks(false); }} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: !showClientTasks ? '#3b82f6' : 'var(--bg-card)', color: !showClientTasks ? 'white' : '#a1a1aa' }}>🏢 Platform</button>
              <button onClick={() => { setShowClientTasks(true); }} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: showClientTasks ? '#ef4444' : 'var(--bg-card)', color: showClientTasks ? 'white' : '#a1a1aa' }}>👤 Client Tasks</button>
            </div>
            <div className="w-px h-6" style={{ background: 'var(--border)' }} />
          </>
        )}
        <div className="flex gap-1">
          <button onClick={() => setFilterStatus('all')} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: filterStatus === 'all' ? '#3b82f6' : 'var(--bg-card)', color: filterStatus === 'all' ? 'white' : '#a1a1aa' }}>All</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: filterStatus === s ? STATUS_META[s].color : 'var(--bg-card)', color: filterStatus === s ? 'white' : '#a1a1aa' }}>
              {STATUS_META[s].icon} {STATUS_META[s].label}
            </button>
          ))}
        </div>
        <div className="w-px h-6" style={{ background: 'var(--border)' }} />
        <div className="flex gap-1">
          <button onClick={() => setFilterAssign('all')} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: filterAssign === 'all' ? '#8b5cf6' : 'var(--bg-card)', color: filterAssign === 'all' ? 'white' : '#a1a1aa' }}>All</button>

          {!isClientContext ? (
            ['Admin', 'Jarvis', 'AntiGravity', ...assignees.filter(a => !['Admin', 'Jarvis', 'AntiGravity'].includes(a))].filter((v, i, a) => a.indexOf(v) === i).map((a) => (
              <button key={a} onClick={() => setFilterAssign(a)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: filterAssign === a ? '#8b5cf6' : 'var(--bg-card)', color: filterAssign === a ? 'white' : '#a1a1aa' }}>{a}</button>
            ))
          ) : (
            ['Admin', ...assignees.filter(a => a !== 'Admin')].filter((v, i, a) => a.indexOf(v) === i).map((a) => (
              <button key={a} onClick={() => setFilterAssign(a)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: filterAssign === a ? '#8b5cf6' : 'var(--bg-card)', color: filterAssign === a ? 'white' : '#a1a1aa' }}>{a}</button>
            ))
          )}
        </div>
        <div className="w-px h-6" style={{ background: 'var(--border)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search tasks..."
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{ background: 'var(--bg-card)', color: '#e4e4e7', border: '1px solid var(--border)', minWidth: 180 }}
        />
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid #3b82f6' }}>
          <div className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Task Description</div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && createTask()}
            placeholder="Describe the task... (Ctrl+Enter to submit)"
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
            rows={2} style={{ background: '#222240', border: '1px solid #2a2a45', color: '#e4e4e7' }} autoFocus />
          <div className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Details (optional)</div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
            placeholder="Additional details..."
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-y"
            rows={3} style={{ background: '#222240', border: '1px solid #2a2a45', color: '#e4e4e7' }} />
          {/* Assignment Section */}
          <div className="space-y-2">
            <div className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Assign To</div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setAssignTarget('platform'); setSelectedClientId(''); setSelectedContactName(''); }}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: assignTarget === 'platform' ? '#3b82f6' : '#222240', color: assignTarget === 'platform' ? 'white' : '#a1a1aa' }}>
                🏢 Platform / Agent
              </button>
              <button type="button" onClick={() => setAssignTarget('client')}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: assignTarget === 'client' ? '#ef4444' : '#222240', color: assignTarget === 'client' ? 'white' : '#a1a1aa' }}>
                👤 Client
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Priority</div>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: '#222240', border: '1px solid #2a2a45', color: '#e4e4e7' }}>
                <option value="low">🔵 Low</option><option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option><option value="urgent">🚨 Urgent</option>
              </select>
            </div>

            {/* Platform assignment */}
            {assignTarget === 'platform' && (
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Assigned To</div>
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: '#222240', border: '1px solid #2a2a45', color: '#e4e4e7' }}>
                  {ASSIGNEES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            )}

            {/* Client assignment — Company picker */}
            {assignTarget === 'client' && (
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: '#ef4444' }}>Company</div>
                <select value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setSelectedContactName(''); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: '#222240', border: '1px solid #ef444444', color: '#e4e4e7' }}>
                  <option value="">Select company...</option>
                  {clientList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Client assignment — Person picker */}
            {assignTarget === 'client' && selectedClientId && (
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: '#ef4444' }}>Person</div>
                <select value={selectedContactName} onChange={(e) => setSelectedContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: '#222240', border: '1px solid #ef444444', color: '#e4e4e7' }}>
                  <option value="">General (no specific person)</option>
                  <option value="Admin">Admin</option>
                  {contactList.map((c) => <option key={c.id} value={c.name}>{c.name}{c.role ? ` — ${c.role}` : ''}</option>)}
                </select>
              </div>
            )}

            <div>
              <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Due Date</div>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: '#222240', border: '1px solid #2a2a45', color: '#e4e4e7' }} />
            </div>
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Category</div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: '#222240', border: '1px solid #2a2a45', color: '#e4e4e7' }}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createTask} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: '#3b82f6', color: 'white' }}>Add Task</button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: '#222240', color: '#a1a1aa' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="text-center py-8 text-sm" style={{ color: '#a1a1aa' }}>Loading tasks...</p>}

      {!loading && (viewMode === 'kanban' ? renderKanban() : (
        <div className="space-y-2 overflow-y-auto pr-2" style={{ height: 'calc(100vh - 160px)', scrollbarWidth: 'thin' }}>
          {filtered.length === 0 && <p className="text-center py-8 text-sm" style={{ color: '#a1a1aa' }}>No tasks found.</p>}
          {filtered.map((task) => editing === task.id ? renderEditCard(task) : renderCard(task))}
        </div>
      ))}
    </div>
  );
}
