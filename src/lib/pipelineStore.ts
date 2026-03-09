import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

export type PipelineStage = 'idea' | 'research' | 'draft' | 'review' | 'approved' | 'published' | 'distributed';
export type ContentType = 'blog' | 'social' | 'email' | 'video' | 'newsletter' | 'press' | 'ad';

// Map frontend types to DB check constraint values
const TYPE_TO_DB: Record<ContentType, string> = {
  blog: 'blog_post', social: 'social_post', email: 'email',
  video: 'video_script', newsletter: 'newsletter', press: 'press_release', ad: 'ad_copy',
};
const DB_TO_TYPE: Record<string, ContentType> = Object.fromEntries(
  Object.entries(TYPE_TO_DB).map(([k, v]) => [v, k as ContentType])
) as Record<string, ContentType>;

// Map frontend stages to DB status constraint values
const STAGE_TO_DB: Record<PipelineStage, string> = {
  idea: 'idea', research: 'drafting', draft: 'drafting', review: 'review',
  approved: 'approved', published: 'published', distributed: 'archived',
};
const DB_TO_STAGE: Record<string, PipelineStage> = {
  idea: 'idea', drafting: 'draft', review: 'review',
  approved: 'approved', scheduled: 'approved', published: 'published', archived: 'distributed',
};

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  stage: PipelineStage;
  description: string;
  assignedTo: string;
  client: string;
  platform: string;
  dueDate: string | null;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PipelineState {
  content: ContentItem[];
  pipelineLoaded: boolean;
  fetchContent: () => Promise<void>;
  addContent: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  moveContent: (id: string, stage: PipelineStage) => void;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
}

export const STAGES: { id: PipelineStage; label: string; icon: string; color: string }[] = [
  { id: 'idea', label: 'Ideas', icon: '💡', color: '#f59e0b' },
  { id: 'research', label: 'Research', icon: '🔍', color: '#8b5cf6' },
  { id: 'draft', label: 'Drafting', icon: '✍️', color: '#3b82f6' },
  { id: 'review', label: 'Review', icon: '🔎', color: '#ec4899' },
  { id: 'approved', label: 'Approved', icon: '✅', color: '#10b981' },
  { id: 'published', label: 'Published', icon: '🚀', color: '#06b6d4' },
  { id: 'distributed', label: 'Distributed', icon: '📡', color: '#6366f1' },
];

export const CONTENT_TYPES: { id: ContentType; label: string; icon: string }[] = [
  { id: 'blog', label: 'Blog Post', icon: '📝' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'newsletter', label: 'Newsletter', icon: '📰' },
  { id: 'press', label: 'Press Release', icon: '🗞️' },
  { id: 'ad', label: 'Advertisement', icon: '📢' },
];

function mapDbContent(db: Record<string, unknown>): ContentItem {
  const meta = (db.metadata || {}) as Record<string, unknown>;
  return {
    id: db.id as string,
    title: db.title as string,
    type: DB_TO_TYPE[db.content_type as string] || (db.content_type as ContentType) || 'social',
    stage: DB_TO_STAGE[db.status as string] || (db.status as PipelineStage) || 'idea',
    description: (db.body as string) || '',
    assignedTo: (meta.assignedTo as string) || '',
    client: (meta.client as string) || '',
    platform: (db.platform as string) || '',
    dueDate: db.scheduled_for ? (db.scheduled_for as string) : null,
    tags: (db.hashtags as string[]) || [],
    notes: (meta.notes as string) || '',
    createdAt: db.created_at as string,
    updatedAt: db.updated_at as string,
  };
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set) => ({
      content: [],
      pipelineLoaded: false,

      fetchContent: async () => {
        try {
          const res = await fetch('/api/content');
          if (!res.ok) return;
          const data = await res.json();
          set({ content: data.map(mapDbContent), pipelineLoaded: true });
        } catch {
          // Keep existing on error
        }
      },

      addContent: (item) => {
        const now = new Date().toISOString();
        const newItem = { ...item, id: uuid(), createdAt: now, updatedAt: now };
        fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title, content_type: TYPE_TO_DB[item.type] || item.type, status: STAGE_TO_DB[item.stage] || item.stage,
            body: item.description, platform: item.platform,
            scheduled_for: item.dueDate, hashtags: item.tags,
            metadata: { assignedTo: item.assignedTo, client: item.client, notes: item.notes },
          }),
        }).catch(() => {});
        set((s) => ({ content: [...s.content, newItem] }));
      },

      moveContent: (id, stage) => {
        fetch('/api/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: STAGE_TO_DB[stage] || stage }),
        }).catch(() => {});
        set((s) => ({ content: s.content.map((c) => c.id === id ? { ...c, stage, updatedAt: new Date().toISOString() } : c) }));
      },

      updateContent: (id, updates) => {
        fetch('/api/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        }).catch(() => {});
        set((s) => ({ content: s.content.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c) }));
      },

      deleteContent: (id) => set((s) => ({ content: s.content.filter((c) => c.id !== id) })),
    }),
    { name: 'mission-control-pipeline' }
  )
);
