'use client';
import { useStore } from '@/lib/store';
import { useClientStore } from '@/lib/clientStore';
import { useIdeaStore } from '@/components/IdeaInbox';
import { useState, useEffect, useCallback } from 'react';

export type View = 'dashboard' | 'todos' | 'projects' | 'pipeline' | 'agents' | 'credits' | 'notes' | 'docs' | 'tools' | 'changelog' | 'intel' | 'memory' | 'ideas' | 'persona' | 'notifications';

interface SidebarProps {
  activeView: View;
  setActiveView: (v: View) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const projects = useStore((s) => s.projects);
  const { clients, activeContext, setActiveContext } = useClientStore();
  const ideas = useIdeaStore((s) => s.ideas);
  const [platformOpen, setPlatformOpen] = useState(true);
  const [clientsOpen, setClientsOpen] = useState(true);
  const [activeClientOpen, setActiveClientOpen] = useState<string | null>(null);
  const [taskCounts, setTaskCounts] = useState({ active: 0, open: 0 });
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const fetchTaskCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const tasks: { status: string; project_id: string | null }[] = await res.json();
        setTaskCounts({
          active: tasks.filter(t => t.project_id && t.status !== 'completed').length,
          open: tasks.filter(t => t.status !== 'completed').length,
        });
      }

      const notifRes = await fetch('/api/notifications?status=unread');
      if (notifRes.ok) {
        const notifs: any[] = await notifRes.json();
        setUnreadNotifs(notifs.length);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchTaskCounts(); const iv = setInterval(fetchTaskCounts, 30000); return () => clearInterval(iv); }, [fetchTaskCounts]);

  const activeTasks = taskCounts.active;
  const openTodos = taskCounts.open;
  const newIdeas = ideas.filter((i) => i.status === 'new').length;

  const platformItems: { id: View; label: string; icon: string; badge?: number }[] = [
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadNotifs },
    { id: 'todos', label: 'Task List', icon: '📋', badge: openTodos },
    { id: 'projects', label: 'Projects', icon: '📋', badge: activeTasks },
    { id: 'pipeline', label: 'Content Pipeline', icon: '📡' },
    { id: 'agents', label: 'AI Agent Team', icon: '🤖' },
    { id: 'credits', label: 'Credits & Usage', icon: '💰' },
    { id: 'docs', label: 'Documents', icon: '📁' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'ideas', label: 'Idea Inbox', icon: '💡', badge: newIdeas },
    { id: 'intel', label: 'Intelligence', icon: '📡' },
    { id: 'memory', label: 'Semantic Memory', icon: '🧠' },
    { id: 'changelog', label: 'Change Log', icon: '📋' },
    { id: 'tools', label: 'Tool Stack', icon: '🔧' },
  ];

  const clientItems: { id: View; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🎯' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadNotifs },
    { id: 'persona', label: 'Persona', icon: '👤' },
    { id: 'todos', label: 'Task List', icon: '📋' },
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'pipeline', label: 'Content Pipeline', icon: '📡' },
    { id: 'docs', label: 'Documents', icon: '📁' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'ideas', label: 'Idea Inbox', icon: '💡' },
    { id: 'credits', label: 'Costs', icon: '💰' },
    { id: 'memory', label: 'Semantic Memory', icon: '🧠' },
  ];

  const handlePlatformClick = (view: View) => {
    setActiveContext('platform');
    setActiveView(view);
    setClientsOpen(false);
    setActiveClientOpen(null);
  };

  const handleClientClick = (clientId: string, view: View) => {
    setActiveContext(clientId);
    setActiveView(view);
    setPlatformOpen(false);
  };

  return (
    <aside className={`flex flex-col relative transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} h-full shrink-0`} style={{ background: 'transparent', zIndex: 40 }}>
      {/* Collapse Toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-7 h-7 rounded-full border border-white/20 bg-[#1A1A1A] text-white flex items-center justify-center text-xs cursor-pointer shadow-lg hover:bg-[#2A2A2A] hover:scale-110 transition-all z-[100]"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Logo */}
      <div className={`p-4 border-b flex ${collapsed ? 'justify-center' : 'items-center'} gap-2`} style={{ borderColor: 'var(--border)', minHeight: '73px' }}>
        <h1 className={`font-bold flex items-center ${collapsed ? 'text-2xl justify-center' : 'text-xl gap-2'}`}>
          🚀 {!collapsed && <span>Mission Control</span>}
        </h1>
        {!collapsed && <p className="text-[10px] absolute top-[45px]" style={{ color: 'var(--text-secondary)' }}>ApexRex AI Platform</p>}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" style={{ scrollbarWidth: 'none' }}>
        {/* Platform Dashboard */}
        <button onClick={() => { setActiveContext('platform'); setActiveView('dashboard'); setClientsOpen(false); setPlatformOpen(true); setActiveClientOpen(null); }}
          className={`w-full flex items-center ${collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'} rounded-lg font-medium transition-colors`}
          style={{ background: activeContext === 'platform' && activeView === 'dashboard' ? 'var(--bg-hover)' : 'transparent', color: activeContext === 'platform' && activeView === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          title="Dashboard">
          <span className={collapsed ? 'text-2xl' : 'text-lg'}>🎯</span>
          {!collapsed && <span className="text-sm">Dashboard</span>}
        </button>

        {/* ApexRex Platform Section */}
        <div className="mt-2">
          <button onClick={() => {
            if (collapsed) { setCollapsed(false); setPlatformOpen(true); setClientsOpen(false); }
            else {
              const next = !platformOpen;
              setPlatformOpen(next);
              if (next) { setClientsOpen(false); setActiveClientOpen(null); }
            }
          }}
            className={`w-full flex items-center ${collapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} text-xs font-bold uppercase tracking-wider`}
            style={{ color: 'var(--accent-blue)' }} title="ApexRex Platform">
            {collapsed ? <span className="text-xl">🏗️</span> : <><span>{platformOpen ? '▼' : '▶'}</span><span>🏗️ ApexRex Platform</span></>}
          </button>
          {(platformOpen && !collapsed) && (
            <div className="ml-2 space-y-0.5">
              {platformItems.map((item) => (
                <button key={item.id + '-platform'} onClick={() => handlePlatformClick(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative"
                  style={{ background: activeContext === 'platform' && activeView === item.id ? 'var(--bg-hover)' : 'transparent', color: activeContext === 'platform' && activeView === item.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--accent-blue)', color: 'white', fontSize: '10px' }}>{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clients Section */}
        <div className="mt-2">
          <button onClick={() => {
            if (collapsed) { setCollapsed(false); setClientsOpen(true); setPlatformOpen(false); }
            else {
              const next = !clientsOpen;
              setClientsOpen(next);
              if (next) setPlatformOpen(false);
            }
          }}
            className={`w-full flex items-center ${collapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} text-xs font-bold uppercase tracking-wider`}
            style={{ color: '#ef4444' }} title="Clients">
            {collapsed ? <span className="text-xl">👥</span> : <><span>{clientsOpen ? '▼' : '▶'}</span><span>👥 Clients</span></>}
          </button>
          {(!collapsed) && clientsOpen && (
            <div className="ml-2 space-y-0.5">
              {clients.map((client) => (
                <div key={client.id}>
                  <button onClick={() => {
                    const next = activeClientOpen === client.id ? null : client.id;
                    setActiveClientOpen(next);
                    if (next) setPlatformOpen(false);
                    handleClientClick(client.id, 'dashboard');
                  }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{ background: activeContext === client.id ? client.color + '22' : 'transparent', color: activeContext === client.id ? client.color : 'var(--text-secondary)' }}>
                    <span className="text-base">{client.icon}</span>
                    <span className="flex-1 text-left">{client.name}</span>
                    <span className="w-2 h-2 rounded-full" style={{ background: client.active ? '#10b981' : '#6b7280' }} />
                  </button>
                  {activeClientOpen === client.id && (
                    <div className="ml-4 space-y-0.5 mt-1">
                      {clientItems.map((item) => (
                        <button key={item.id + '-' + client.id} onClick={() => handleClientClick(client.id, item.id)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
                          style={{ background: activeContext === client.id && activeView === item.id ? 'var(--bg-hover)' : 'transparent', color: activeContext === client.id && activeView === item.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          <span style={{ fontSize: '13px' }}>{item.icon}</span>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--accent-blue)', color: 'white', fontSize: '10px' }}>{item.badge}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Status */}
      <div className={`p-4 border-t text-xs flex ${collapsed ? 'justify-center' : 'flex-col gap-1'}`} style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <div className={`flex items-center gap-2 ${collapsed ? '' : 'mb-1'}`} title="Jarvis Online">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {!collapsed && <span>Jarvis Online</span>}
        </div>
        {!collapsed && <div>{clients.length} Clients · {activeTasks} Active Tasks</div>}
      </div>
    </aside>
  );
}
