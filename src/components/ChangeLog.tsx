'use client';
import { useState, useEffect } from 'react';

export default function ChangeLog() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/changelog').then(r => r.ok ? r.json() : []).then(setLogs).catch(() => { });
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">📋 Change Log</h2>

            {logs.length === 0 ? (
                <div className="w-full h-64 bg-[#0F172A] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <div className="text-4xl mb-4">📋</div>
                    <p>No activity logged yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map((l, i) => (
                        <div key={i} className="p-3 bg-[#1E293B] rounded-xl border border-white/5 text-sm flex justify-between">
                            <span className="text-slate-300">{l.description}</span>
                            <span className="text-slate-500">{new Date(l.created_at).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
