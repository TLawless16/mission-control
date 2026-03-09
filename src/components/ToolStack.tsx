'use client';

export default function ToolStack() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">🔧 Tool Stack</h2>
                <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add Integration</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-[#1E293B] rounded-xl border border-white/5 shadow-lg">
                    <div className="text-3xl mb-4">🔵</div>
                    <h3 className="font-bold text-white mb-1">Make.com</h3>
                    <p className="text-xs text-slate-400 mb-4">Primary automation engine</p>
                    <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded">Connected</span>
                </div>

                <div className="p-6 bg-[#1E293B] rounded-xl border border-white/5 shadow-lg">
                    <div className="text-3xl mb-4">🤖</div>
                    <h3 className="font-bold text-white mb-1">OpenAI</h3>
                    <p className="text-xs text-slate-400 mb-4">LLM Provider</p>
                    <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded">Connected</span>
                </div>

                <div className="p-6 bg-[#1E293B] rounded-xl border border-white/5 shadow-lg border-dashed border-slate-600 opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <span className="text-2xl mb-2">➕</span>
                        <p className="text-sm">Connect New Tool</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
