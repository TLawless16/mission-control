'use client';
import { useState, useEffect } from 'react';
import { useClientStore } from '@/lib/clientStore';

export default function Notes() {
    const { activeContext } = useClientStore();
    const [notes, setNotes] = useState<any[]>([]);

    useEffect(() => {
        const url = activeContext === 'platform' ? '/api/notes' : `/api/notes?client_id=${activeContext}`;
        fetch(url).then(r => r.ok ? r.json() : []).then(setNotes).catch(() => { });
    }, [activeContext]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">📝 Notes</h2>
                <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">New Note</button>
            </div>

            {notes.length === 0 ? (
                <div className="w-full h-64 bg-[#0F172A] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <div className="text-4xl mb-4">📝</div>
                    <p>No notes found for this context.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.map((n, i) => (
                        <div key={i} className="p-4 bg-[#1E293B] rounded-xl border border-white/5">
                            <h3 className="font-bold text-white mb-2">{n.title || 'Untitled'}</h3>
                            <p className="text-sm text-slate-300">{n.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
