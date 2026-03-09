'use client';
import { useState, useEffect } from 'react';
import Sidebar, { View } from '@/components/Sidebar';
import { useClientStore } from '@/lib/clientStore';
import Dashboard from '@/components/Dashboard';
import NotificationsList from '@/components/NotificationsList';
import TaskList from '@/components/TaskList';
import Kanban from '@/components/Kanban';
import ContentPipeline from '@/components/ContentPipeline';
import IntelFeed from '@/components/IntelFeed';
import IdeaInbox from '@/components/IdeaInbox';
import MemoryDashboard from '@/components/MemoryDashboard';
import CreditsBoard from '@/components/CreditsBoard';
import { AgentTeam, ClientTaskList } from '@/components/Placeholders';
import ChangeLog from '@/components/ChangeLog';
import Documents from '@/components/Documents';
import Notes from '@/components/Notes';
import ToolStack from '@/components/ToolStack';
import ClientPersona from '@/components/ClientPersona';
import OnboardingAgent from '@/components/OnboardingAgent';
import ContextHelp from '@/components/ContextHelp';

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const { activeContext, fetchClients, loaded } = useClientStore();

  useEffect(() => { if (!loaded) fetchClients(); }, [loaded, fetchClients]);

  const isClient = activeContext !== 'platform';

  // Platform views
  const platformViews: Record<View, React.ReactNode> = {
    dashboard: <Dashboard setActiveView={setActiveView} />,
    notifications: <NotificationsList />,
    todos: <TaskList />,
    projects: <Kanban />,
    pipeline: <ContentPipeline />,
    agents: <OnboardingAgent />,
    credits: <CreditsBoard />,
    notes: <Notes />,
    docs: <Documents />,
    tools: <ToolStack />,
    changelog: <ChangeLog />,
    intel: <IntelFeed />,
    memory: <MemoryDashboard />,
    ideas: <IdeaInbox context="platform" />,
    persona: <div />,
  };

  // Client views
  const clientViews: Record<View, React.ReactNode> = {
    dashboard: <Dashboard setActiveView={setActiveView} />,
    notifications: <NotificationsList />,
    persona: isClient ? <ClientPersona /> : <div />,
    projects: <Kanban />,
    pipeline: <ContentPipeline />,
    credits: <CreditsBoard />,
    notes: <Notes />,
    docs: <Documents />,
    ideas: <IdeaInbox context={activeContext} />,
    todos: <TaskList />,
    agents: <OnboardingAgent />,
    tools: <ToolStack />,
    changelog: <ChangeLog />,
    intel: <IntelFeed />,
    memory: <MemoryDashboard orgId={activeContext} />,
  };

  const views = isClient ? clientViews : platformViews;

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-transparent">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 h-full py-3 pr-3">
        <main className="h-full w-full overflow-y-auto p-8 relative flex flex-col bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl">
          {views[activeView] || <div>View not found</div>}
        </main>
      </div>

      {/* Contextual AI Help Widget */}
      <ContextHelp activeView={activeView} />
    </div>
  );
}
