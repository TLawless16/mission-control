'use client';
import { useState, useEffect } from 'react';

type Intel = {
    id: string;
    org_id: string;
    title: string;
    body: string | null;
    category: string;
    source_url: string | null;
    stack_component: string | null;
    impact: string;
    status: string;
    created_at: string;
};

export default function IntelFeed() {
    const orgId = "09ac8e19-58ed-4bce-ad0e-6f9eebbace06";
    const [intel, setIntel] = useState<Intel[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterImpact, setFilterImpact] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchIntel();
    }, [orgId]);

    const fetchIntel = async () => {
        try {
            const res = await fetch(`/api/intel?org_id=${orgId}`);
            if (res.ok) {
                const data = await res.json();
                setIntel(data);
            }
        } catch (err) {
            console.error('Failed to fetch intel:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateIntelStatus = async (id: string, newStatus: string) => {
        setIntel(intel.map(item => item.id === id ? { ...item, status: newStatus } : item));
        try {
            await fetch('/api/intel', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const filteredIntel = intel.filter(item => {
        if (filterCategory !== 'all' && item.category !== filterCategory) return false;
        if (filterImpact !== 'all' && item.impact !== filterImpact) return false;
        if (item.status === 'dismissed' || item.status === 'actioned') return false; // Hide resolved stuff by default
        return true;
    });

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'security_patch': return '🛡️';
            case 'version_update': return '⬆️';
            case 'new_capability': return '✨';
            case 'cost_change': return '💰';
            case 'deprecation': return '⚠️';
            case 'new_api': return '🔌';
            default: return '📡';
        }
    };

    return (
        <div className="w-full bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
                        📡 Tech Radar Intel
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
                            {filteredIntel.length} New Findings
                        </span>
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Real-time monitoring of our core AI & tech stack</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterImpact}
                        onChange={(e) => setFilterImpact(e.target.value)}
                        className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="all">All Impacts</option>
                        <option value="high">High Impact</option>
                        <option value="medium">Medium Impact</option>
                        <option value="low">Low Impact</option>
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="version_update">Version Updates</option>
                        <option value="new_api">New APIs</option>
                        <option value="new_capability">Capabilities</option>
                        <option value="security_patch">Security</option>
                        <option value="cost_change">Costs</option>
                        <option value="deprecation">Deprecations</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 md:w-12 md:h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Scanning tech horizon...</p>
                </div>
            ) : filteredIntel.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <p className="text-slate-400">All quiet on the tech front. No new intel findings.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredIntel.map(item => (
                        <div
                            key={item.id}
                            className="bg-[#1E293B] rounded-xl border border-white/5 overflow-hidden transition-all duration-200 hover:border-teal-500/30"
                        >
                            <div
                                className="p-4 cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="text-2xl mt-1">{getCategoryIcon(item.category)}</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.stack_component && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                                                    {item.stack_component}
                                                </span>
                                            )}
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getImpactColor(item.impact)}`}>
                                                {item.impact.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-medium text-slate-200 text-base">{item.title}</h3>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateIntelStatus(item.id, 'actioned'); }}
                                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-sm transition-colors"
                                    >
                                        🚀 Action
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); updateIntelStatus(item.id, 'dismissed'); }}
                                        className="px-3 py-1.5 bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/5 rounded-lg text-sm transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>

                            {expandedId === item.id && (
                                <div className="p-4 border-t border-white/5 bg-black/20">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <p className="text-slate-300 whitespace-pre-wrap">{item.body || 'No detailed analysis provided.'}</p>
                                    </div>
                                    {item.source_url && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                            <a
                                                href={item.source_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1"
                                            >
                                                Read Original Source ↗
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
