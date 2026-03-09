'use client';
import { useState, useEffect } from 'react';

type ContentItem = {
    id: string;
    org_id: string;
    title: string;
    body: string | null;
    content_type: string;
    status: string;
    platform: string | null;
    scheduled_for: string | null;
    metadata: any;
    created_at: string;
};

const COLUMNS = [
    { id: 'inspiration', label: 'Inspiration' },
    { id: 'drafting', label: 'Drafting' },
    { id: 'review', label: 'Client Review' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'published', label: 'Published' }
];

export default function ContentPipeline({ orgId }: { orgId?: string }) {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'kanban' | 'calendar'>('kanban');
    const [repurposingId, setRepurposingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ContentItem>>({});
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchItems();
    }, [orgId]);

    const fetchItems = async () => {
        try {
            if (!orgId) return;
            const res = await fetch(`/api/content?org_id=${orgId}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateItemStatus = async (id: string, newStatus: string) => {
        setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
        try {
            await fetch('/api/content', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
        } catch (e) {
            // Revert on failure
            fetchItems();
        }
    };

    const updateItemDetails = async (id: string, updates: Partial<ContentItem>) => {
        setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
        try {
            await fetch('/api/content', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
        } catch (e) {
            fetchItems();
        }
    };

    const startEditing = (item: ContentItem) => {
        setEditingId(item.id);
        setEditForm({
            title: item.title,
            body: item.body || '',
            platform: item.platform || '',
            metadata: item.metadata || {}
        });
    };

    const saveEdit = (id: string) => {
        updateItemDetails(id, editForm);
        setEditingId(null);
    };

    const handleRepurpose = async (id: string) => {
        setRepurposingId(id);
        try {
            const res = await fetch('/api/repurpose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) fetchItems();
        } catch (e) {
            console.error(e);
        } finally {
            setRepurposingId(null);
        }
    };

    const onDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('itemId', id);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, columnId: string) => {
        const id = e.dataTransfer.getData('itemId');
        if (id) {
            updateItemStatus(id, columnId);
        }
    };

    if (loading) return <div className="text-white p-6">Loading pipeline...</div>;

    return (
        <div className="w-full h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Content Pipeline</h2>
                    <p className="text-slate-400">Unified workflow for Blog and Social Media</p>
                </div>
                <div className="flex bg-[#1E293B] rounded-lg p-1">
                    <button
                        onClick={() => setView('kanban')}
                        className={`px-4 py-2 rounded-md ${view === 'kanban' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Kanban Board
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`px-4 py-2 rounded-md ${view === 'calendar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {view === 'kanban' ? (
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map(col => (
                        <div
                            key={col.id}
                            className="w-80 flex-shrink-0 flex flex-col bg-[#0F172A]/50 border border-white/5 rounded-xl self-start h-full max-h-screen"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, col.id)}
                        >
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B] rounded-t-xl">
                                <h3 className="font-semibold text-slate-200">{col.label}</h3>
                                <span className="bg-black/30 text-xs px-2 py-1 rounded-full text-slate-400 font-mono">
                                    {items.filter(i => i.status === col.id).length}
                                </span>
                            </div>
                            <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                                {items.filter(i => i.status === col.id).map(item => (
                                    <div
                                        key={item.id}
                                        draggable={editingId !== item.id}
                                        onDragStart={(e) => onDragStart(e, item.id)}
                                        className="bg-[#1E293B] p-4 rounded-lg border border-white/5 cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-colors group"
                                        onDoubleClick={() => startEditing(item)}
                                    >
                                        {editingId === item.id ? (
                                            <div className="space-y-3">
                                                {col.id === 'inspiration' && (
                                                    <select
                                                        value={editForm.metadata?.source_category || ''}
                                                        onChange={e => setEditForm({ ...editForm, metadata: { ...editForm.metadata, source_category: e.target.value } })}
                                                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                                                    >
                                                        <option value="">Select Inspiration Source...</option>
                                                        <option value="Client Added">Client Added</option>
                                                        <option value="Competitor">Competitor (Research Agent)</option>
                                                        <option value="Morning Brief">Morning Brief</option>
                                                    </select>
                                                )}
                                                <input
                                                    value={editForm.platform || ''}
                                                    onChange={e => setEditForm({ ...editForm, platform: e.target.value })}
                                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                                                    placeholder="Platform (e.g. LinkedIn, WordPress)"
                                                />
                                                <input
                                                    value={editForm.title || ''}
                                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm font-semibold text-white focus:outline-none focus:border-purple-500"
                                                    placeholder="Title"
                                                />
                                                <textarea
                                                    value={editForm.body || ''}
                                                    onChange={e => setEditForm({ ...editForm, body: e.target.value })}
                                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 min-h-[80px] focus:outline-none focus:border-purple-500 font-mono"
                                                    placeholder="Body content... (Markdown supported)"
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1">Cancel</button>
                                                    <button onClick={() => saveEdit(item.id)} className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500">Save edits</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-2 group-hover:opacity-100">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                                                            {item.content_type}
                                                        </span>
                                                        {item.metadata?.source_category && (
                                                            <span className="text-[9px] font-semibold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded truncate">
                                                                {item.metadata.source_category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <button onClick={() => startEditing(item)} className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-white transition-opacity" title="Edit inline">✎ edit</button>
                                                        <span className="text-xs text-slate-500">{item.platform}</span>
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-sm text-slate-200 mb-2 leading-snug">{item.title}</h4>
                                                {item.body && (
                                                    <p className="text-xs text-slate-400 line-clamp-3 whitespace-pre-wrap">{item.body}</p>
                                                )}

                                                {col.id === 'inspiration' && (
                                                    <button
                                                        onClick={() => handleRepurpose(item.id)}
                                                        disabled={repurposingId === item.id}
                                                        className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                                                    >
                                                        {repurposingId === item.id ? '🧠 Agent Running...' : '✨ Repurpose for Brand'}
                                                    </button>
                                                )}

                                                {item.scheduled_for && (
                                                    <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1 border-t border-white/5 pt-2">
                                                        <span>📅</span> {new Date(item.scheduled_for).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                                {/* Visual drop target affordance */}
                                <div className="h-2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 bg-[#1E293B] border border-white/5 rounded-xl p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2 bg-[#0F172A] p-1 rounded-lg">
                            <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d) }} className="px-3 py-1 rounded text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">&larr; Prev</button>
                            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 rounded text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium">Today</button>
                            <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d) }} className="px-3 py-1 rounded text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Next &rarr;</button>
                        </div>
                    </div>
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/10">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="bg-[#1E293B] p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>)}
                        {/* 35 day grid (5 weeks) */}
                        {Array.from({ length: 35 }).map((_, i) => {
                            const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                            const startOffset = d.getDay();
                            const currentDay = new Date(d);
                            currentDay.setDate(d.getDate() + (i - startOffset));
                            const isCurrentMonth = currentDay.getMonth() === currentMonth.getMonth();
                            const isToday = currentDay.toDateString() === new Date().toDateString();

                            const dayItems = items.filter(item => {
                                if (!item.scheduled_for) return false;
                                const itemDate = new Date(item.scheduled_for);
                                return itemDate.toDateString() === currentDay.toDateString();
                            });

                            return (
                                <div key={i} className={`min-h-[120px] p-2 bg-[#1E293B] transition-colors ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-white/5'}`}>
                                    <div className={`text-right text-sm mb-2 font-medium ${isToday ? 'text-purple-400' : 'text-slate-400'}`}>
                                        <span className={isToday ? 'bg-purple-500/20 px-2 py-0.5 rounded-full' : ''}>{currentDay.getDate()}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {dayItems.map(item => (
                                            <div key={item.id} className="text-xs p-1.5 rounded-md bg-purple-500/10 text-purple-200 border border-purple-500/20 truncate cursor-pointer hover:bg-purple-500/20 transition-colors shadow-sm" title={item.title}>
                                                <span className="font-semibold mr-1">{new Date(item.scheduled_for!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {item.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
