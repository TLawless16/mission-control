'use client';
import { useState, useEffect, useCallback } from 'react';

type NotificationType = 'morning_brief' | 'alert' | 'cto_proposal' | 'deployment' | 'system';
type NotificationSource = 'jarvis' | 'ava' | 'system' | 'user';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Status = 'unread' | 'read' | 'archived';

interface DBNotification {
    id: string;
    org_id: string;
    title: string;
    body: string | null;
    type: NotificationType;
    source: NotificationSource;
    priority: Priority;
    status: Status;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

const TYPE_ICONS: Record<NotificationType, string> = {
    morning_brief: '🌅',
    alert: '⚠️',
    cto_proposal: '💡',
    deployment: '🚀',
    system: '⚙️',
};

const PRIORITY_COLORS: Record<Priority, string> = {
    low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#ff2d55',
};

const STATUS_COLORS: Record<Status, string> = {
    unread: '#3b82f6', read: '#10b981', archived: '#6b7280',
};

// Platform org_id for initial filter (could be dynamic later)
const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';

export default function NotificationsList() {
    const [notifications, setNotifications] = useState<DBNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('unread');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Edit state
    const [editing, setEditing] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editBody, setEditBody] = useState('');
    const [editPriority, setEditPriority] = useState<Priority>('medium');
    const [editStatus, setEditStatus] = useState<Status>('unread');

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications?org_id=${PLATFORM_ORG}`);
            if (res.ok) {
                const allNotifs: DBNotification[] = await res.json();
                setNotifications(allNotifs);
            }
        } catch (e) { console.error('Failed to fetch notifications:', e); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const updateNotification = async (id: string, updates: Record<string, unknown>) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            fetchNotifications();
        } catch (e) { console.error(e); }
    };

    const deleteNotification = async (id: string) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            try {
                await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
                fetchNotifications();
            } catch (e) { console.error(e); }
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => n.status === 'unread').map(n => n.id);
        for (const id of unreadIds) {
            await updateNotification(id, { status: 'read' });
        }
    };

    const deleteAllRead = async () => {
        if (confirm('Are you sure you want to delete all read notifications?')) {
            const readIds = notifications.filter(n => n.status === 'read').map(n => n.id);
            for (const id of readIds) {
                await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
            }
            fetchNotifications();
        }
    };

    const filtered = notifications.filter((n) => {
        if (filterType !== 'all' && n.type !== filterType) return false;
        if (filterStatus !== 'all' && n.status !== filterStatus) return false;
        return true;
    });

    const startEdit = (notif: DBNotification) => {
        setEditing(notif.id);
        setEditTitle(notif.title);
        setEditBody(notif.body || '');
        setEditPriority(notif.priority);
        setEditStatus(notif.status);
        setExpandedId(null);
    };

    const saveEdit = () => {
        if (editing && editTitle.trim()) {
            updateNotification(editing, {
                title: editTitle.trim(),
                body: editBody.trim() || null,
                priority: editPriority,
                status: editStatus,
            });
            setEditing(null);
        }
    };

    const renderNotifRow = (n: DBNotification) => {
        if (editing === n.id) {
            return (
                <div key={n.id} className="rounded-lg p-4 space-y-3 mb-3" style={{ background: 'var(--bg-card)', border: '1px solid #3b82f6' }}>
                    <div>
                        <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Title</div>
                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-1.5 rounded text-sm outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }} />
                    </div>
                    <div>
                        <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Body</div>
                        <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)}
                            className="w-full px-2 py-1.5 rounded text-sm outline-none resize-y" rows={4} style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Priority</div>
                            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)}
                                className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }}>
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <div className="text-xs font-medium mb-1" style={{ color: '#a1a1aa' }}>Status</div>
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Status)}
                                className="w-full px-2 py-1.5 rounded text-xs outline-none" style={{ background: '#222240', color: '#e4e4e7', border: '1px solid #2a2a45' }}>
                                <option value="unread">Unread</option><option value="read">Read</option><option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#3b82f6', color: 'white' }}>Save</button>
                        <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#222240', color: '#a1a1aa' }}>Cancel</button>
                    </div>
                </div>
            );
        }

        const isExpanded = expandedId === n.id;
        return (
            <div key={n.id} className="rounded-lg p-4 mb-3 transition-colors duration-200 cursor-pointer"
                style={{ background: n.status === 'unread' ? '#222240' : 'var(--bg-card)', border: '1px solid var(--border)' }}
                onClick={() => setExpandedId(isExpanded ? null : n.id)}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl" title={n.type}>{TYPE_ICONS[n.type] || '📩'}</span>
                        <div>
                            <h4 className="text-sm font-semibold" style={{ color: n.status === 'unread' ? '#ffffff' : '#e4e4e7' }}>{n.title}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs" style={{ color: '#71717a' }}>{new Date(n.created_at).toLocaleString()}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#ffffff11', color: '#a1a1aa' }}>👤 {n.source}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: PRIORITY_COLORS[n.priority] + '22', color: PRIORITY_COLORS[n.priority] }}>{n.priority}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ background: STATUS_COLORS[n.status] + '22', color: STATUS_COLORS[n.status] }}>{n.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-70 hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        {n.status === 'unread' && (
                            <button onClick={() => updateNotification(n.id, { status: 'read' })} className="text-xs px-2 py-1 rounded" style={{ background: '#10b98122', color: '#10b981' }}>Mark Read</button>
                        )}
                        <button onClick={() => startEdit(n)} className="text-xs px-2 py-1 rounded" style={{ background: '#3b82f622', color: '#3b82f6' }}>Edit</button>
                        <button onClick={() => deleteNotification(n.id)} className="text-xs px-2 py-1 rounded" style={{ background: '#ef444422', color: '#ef4444' }}>Delete</button>
                    </div>
                </div>
                {isExpanded && n.body && (
                    <div className="mt-3 p-3 rounded text-sm whitespace-pre-wrap" style={{ background: '#18181b', color: '#a1a1aa', border: '1px solid #27272a' }}>
                        {n.body}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: '#e4e4e7' }}>🔔 Notifications & Alerts</h2>
                <div className="flex gap-2">
                    <button onClick={markAllAsRead} className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#10b98122', color: '#10b981' }}>Mark All Read</button>
                    <button onClick={deleteAllRead} className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: '#ef444422', color: '#ef4444' }}>Clear Read</button>
                </div>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
                <div className="flex gap-1">
                    <button onClick={() => setFilterStatus('all')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: filterStatus === 'all' ? '#3b82f6' : 'var(--bg-card)', color: filterStatus === 'all' ? 'white' : '#a1a1aa' }}>All Status</button>
                    <button onClick={() => setFilterStatus('unread')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: filterStatus === 'unread' ? '#3b82f6' : 'var(--bg-card)', color: filterStatus === 'unread' ? 'white' : '#a1a1aa' }}>Unread Only</button>
                    <button onClick={() => setFilterStatus('read')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: filterStatus === 'read' ? '#3b82f6' : 'var(--bg-card)', color: filterStatus === 'read' ? 'white' : '#a1a1aa' }}>Read Details</button>
                </div>
                <div className="w-px h-6" style={{ background: 'var(--border)' }} />
                <div className="flex gap-1">
                    <button onClick={() => setFilterType('all')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: filterType === 'all' ? '#8b5cf6' : 'var(--bg-card)', color: filterType === 'all' ? 'white' : '#a1a1aa' }}>All Types</button>
                    {Object.entries(TYPE_ICONS).map(([type, icon]) => (
                        <button key={type} onClick={() => setFilterType(type)} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize flex items-center gap-1"
                            style={{ background: filterType === type ? '#8b5cf6' : 'var(--bg-card)', color: filterType === type ? 'white' : '#a1a1aa' }}>
                            {icon} {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="text-center py-8 text-sm" style={{ color: '#a1a1aa' }}>Loading notifications...</p>}

            {!loading && (
                <div className="space-y-1">
                    {filtered.length === 0 && <p className="text-center py-8 text-sm" style={{ color: '#a1a1aa' }}>No notifications found.</p>}
                    {filtered.map(renderNotifRow)}
                </div>
            )}
        </div>
    );
}
