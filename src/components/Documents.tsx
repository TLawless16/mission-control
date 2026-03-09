'use client';
import { useState, useEffect } from 'react';
import { useClientStore } from '@/lib/clientStore';

export default function Documents() {
    const { activeContext } = useClientStore();
    const [docs, setDocs] = useState<any[]>([]);

    useEffect(() => {
        const url = activeContext === 'platform' ? '/api/documents' : `/api/documents?client_id=${activeContext}`;
        fetch(url).then(r => r.ok ? r.json() : []).then(setDocs).catch(() => { });
    }, [activeContext]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">📁 Documents</h2>
                <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Upload Document</button>
            </div>

            {docs.length === 0 ? (
                <div className="w-full h-64 bg-[#0F172A] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <div className="text-4xl mb-4">📁</div>
                    <p>No documents found for this context.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {docs.map((d, i) => (
                        <div key={i} className="p-4 bg-[#1E293B] rounded-xl border border-white/5 flex gap-4 items-center">
                            <span className="text-2xl">📄</span>
                            <div>
                                <h3 className="font-bold text-white">{d.title}</h3>
                                <p className="text-xs text-slate-400">{d.category} • {new Date(d.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
