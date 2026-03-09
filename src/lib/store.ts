import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

// ── Types ──
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type KanbanColumn = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  assignedTo: string;
  dueDate: string | null;
  category: string;
  context: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  column: KanbanColumn;
  priority: Priority;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string | null;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

// ── Store ──
interface MCState {
  todos: Todo[];
  addTodo: (text: string, priority?: Priority) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;

  projects: Project[];
  projectsLoaded: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (name: string, description: string, color: string) => void;
  updateProject: (id: string, name: string, description: string, color: string) => void;
  deleteProject: (id: string) => void;

  tasks: Task[];
  addTask: (projectId: string, title: string, description: string, column: KanbanColumn, priority?: Priority) => void;
  moveTask: (id: string, column: KanbanColumn) => void;
  deleteTask: (id: string) => void;

  notes: Note[];
  notesLoaded: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;

  activeProject: string | null;
  setActiveProject: (id: string | null) => void;
}

const PROJECT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function mapDbProject(db: Record<string, unknown>): Project {
  const settings = (db.settings || {}) as Record<string, unknown>;
  return {
    id: db.id as string,
    clientId: (db.client_id as string) || null,
    name: db.name as string,
    description: (db.description as string) || '',
    color: (settings.color as string) || PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)],
    createdAt: db.created_at as string,
  };
}

function mapDbNote(db: Record<string, unknown>): Note {
  return {
    id: db.id as string,
    title: (db.title as string) || 'Untitled',
    content: (db.content as string) || '',
    updatedAt: db.updated_at as string,
  };
}

export const useStore = create<MCState>()(
  persist(
    (set) => ({
      // ── Todos (legacy — now handled by TaskList component via /api/tasks) ──
      todos: [],
      addTodo: (text, priority = 'medium') =>
        set((s) => ({ todos: [...s.todos, { id: uuid(), text, done: false, priority, assignedTo: 'Jarvis', dueDate: null, category: 'general', context: 'platform', createdAt: new Date().toISOString() }] })),
      toggleTodo: (id) =>
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      updateTodo: (id, updates) =>
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

      // ── Projects (from PostgreSQL) ──
      projects: [],
      projectsLoaded: false,
      fetchProjects: async () => {
        try {
          const res = await fetch('/api/projects');
          if (!res.ok) return;
          const data = await res.json();
          set({ projects: data.map(mapDbProject), projectsLoaded: true });
        } catch { /* keep existing */ }
      },
      addProject: (name, description, color) => {
        const newProj = { id: uuid(), clientId: null, name, description, color, createdAt: new Date().toISOString() };
        fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, settings: { color } }),
        }).catch(() => { });
        set((s) => ({ projects: [...s.projects, newProj] }));
      },
      updateProject: (id, name, description, color) => {
        fetch('/api/projects', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, description, settings: { color } }),
        }).catch(() => { });
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, name, description, color } : p
          ),
        }));
      },
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id), tasks: s.tasks.filter((t) => t.projectId !== id) })),

      // ── Kanban Tasks (keep in localStorage for now — these are project-scoped, not DB tasks) ──
      tasks: [],
      addTask: (projectId, title, description, column, priority = 'medium') =>
        set((s) => ({ tasks: [...s.tasks, { id: uuid(), projectId, title, description, column, priority, createdAt: new Date().toISOString() }] })),
      moveTask: (id, column) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, column } : t)) })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ── Notes (from PostgreSQL) ──
      notes: [],
      notesLoaded: false,
      fetchNotes: async () => {
        try {
          const res = await fetch('/api/notes');
          if (!res.ok) return;
          const data = await res.json();
          set({ notes: data.map(mapDbNote), notesLoaded: true });
        } catch { /* keep existing */ }
      },
      addNote: (title, content) => {
        const newNote = { id: uuid(), title, content, updatedAt: new Date().toISOString() };
        fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        }).catch(() => { });
        set((s) => ({ notes: [...s.notes, newNote] }));
      },
      updateNote: (id, title, content) => {
        fetch('/api/notes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, title, content }),
        }).catch(() => { });
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n)) }));
      },
      deleteNote: (id) => {
        fetch('/api/notes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }).catch(() => { });
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
      },

      activeProject: null,
      setActiveProject: (id) => set({ activeProject: id }),
    }),
    { name: 'mission-control-storage' }
  )
);
