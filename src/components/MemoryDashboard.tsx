'use client';
import { useState, useEffect } from 'react';

type MemoryRecord = {
    id: string;
    score: number;
    metadata: {
        text: string;
        source?: string;
        [key: string]: any;
    }
};

export default function MemoryDashboard({ orgId }: { orgId?: string }) {
    const [query, setQuery] = useState('');
    const [namespace, setNamespace] = useState('default');
    const [results, setResults] = useState<MemoryRecord[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/memory');
            const data = await res.json();
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/memory?query=${encodeURIComponent(query)}&namespace=${encodeURIComponent(namespace)}`);
            const data = await res.json();
            setResults(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteMemory = async (id: string) => {
        try {
            await fetch(`/api/memory?id=${encodeURIComponent(id)}&namespace=${encodeURIComponent(namespace)}`, { method: 'DELETE' });
            setResults(results.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    return (
        <div className="w-full bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                        🧠 Semantic Memory
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Pinecone Vector Database UI</p>
                </div>

                {stats && (
                    <div className="bg-[#1E293B] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300">
                        <span className="font-semibold text-purple-400">{stats.totalRecordCount}</span> Vectors Indexed
                    </div>
                )}
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="Namespace (e.g. default, kate-monroe)"
                    className="w-1/4 bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversation history or document embeddings..."
                    className="flex-1 bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                    disabled={loading || !query}
                >
                    {loading ? 'Recalling...' : 'Search'}
                </button>
            </form>

            <div className="space-y-4">
                {results.length === 0 && !loading && query && (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <p className="text-slate-400">No semantic matches found for this query.</p>
                    </div>
                )}

                {results.map((record) => (
                    <div key={record.id} className="bg-[#1E293B] p-4 rounded-xl border border-white/5 flex gap-4">
                        <div className="flex flex-col items-center justify-center bg-black/20 rounded-lg p-3 min-w-[80px]">
                            <div className="text-xl font-bold text-purple-400">{(record.score * 100).toFixed(1)}%</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Match</div>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-xs font-mono text-slate-500 bg-black/30 px-2 py-1 rounded inline-block">
                                    ID: {record.id.length > 30 ? record.id.substring(0, 30) + '...' : record.id}
                                </div>
                                {record.metadata.source && (
                                    <span className="text-xs text-indigo-400 font-medium px-2 py-1 bg-indigo-500/10 rounded-md">
                                        {record.metadata.source}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{record.metadata.text}</p>
                        </div>

                        <div className="flex flex-col justify-start">
                            <button
                                onClick={() => deleteMemory(record.id)}
                                className="text-xs font-bold px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Prune memory"
                            >
                                Prune
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
