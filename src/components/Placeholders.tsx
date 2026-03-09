const generatePlaceholder = (name: string, emoji: string) => {
    return function PlaceholderComponent() {
        return (
            <div className="w-full h-64 bg-[#0F172A] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <div className="text-4xl mb-4">{emoji}</div>
                <h2 className="text-xl font-bold text-white mb-2">{name}</h2>
                <p className="text-sm">This module is scheduled for a future build phase.</p>
            </div>
        );
    }
};

export const AgentTeam = generatePlaceholder('Agent Team', '🤖');
export const ClientTaskList = generatePlaceholder('Client Task List', '☑️');
