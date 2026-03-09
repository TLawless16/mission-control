'use client';
import { useClientStore } from '@/lib/clientStore';
import { useState, useEffect } from 'react';

export default function ClientPersona() {
    const { activeContext } = useClientStore();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editAudience, setEditAudience] = useState('');
    const [editVoice, setEditVoice] = useState('');
    const [editBio, setEditBio] = useState('');

    useEffect(() => {
        async function fetchClient() {
            setLoading(true);
            try {
                const res = await fetch(`/api/clients`);
                if (res.ok) {
                    const data = await res.json();
                    const current = data.find((c: any) => c.id === activeContext);
                    setClient(current);
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        if (activeContext && activeContext !== 'platform') {
            fetchClient();
        }
    }, [activeContext]);

    if (loading) return <div className="p-8 text-slate-400 animate-pulse">Loading Persona...</div>;
    if (!client) return <div className="p-8 text-slate-400">Client not found.</div>;

    const startEdit = () => {
        setEditAudience(client.target_audience || '');
        setEditVoice(client.brand_voice || '');
        setEditBio(client.bio || '');
        setIsEditing(true);
    };

    const saveEdit = async () => {
        try {
            const res = await fetch('/api/clients', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: client.id,
                    target_audience: editAudience,
                    brand_voice: editVoice,
                    bio: editBio
                })
            });
            if (res.ok) {
                setClient({ ...client, target_audience: editAudience, brand_voice: editVoice, bio: editBio });
                setIsEditing(false);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="w-full bg-[#0F172A] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="text-5xl">{client.icon || '👤'}</div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">{client.name}</h2>
                        <p className="text-slate-400">{client.industry || 'General Business'} • Active Profiling</p>
                    </div>
                </div>
                <div>
                    {!isEditing ? (
                        <button onClick={startEdit} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1E293B] hover:bg-[#2A3B52] transition-colors border border-white/10 text-white">
                            ✏️ Edit Persona
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={saveEdit} className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 hover:bg-teal-600 transition-colors text-white">
                                Save
                            </button>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-transparent hover:bg-white/5 transition-colors border border-white/10 text-slate-300">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 flex flex-col">
                    <h3 className="text-lg font-semibold text-teal-400 mb-2">🎯 Target Audience</h3>
                    {!isEditing ? (
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                            {client.target_audience || 'Not defined yet. The Onboarding Agent will populate this.'}
                        </p>
                    ) : (
                        <textarea value={editAudience} onChange={e => setEditAudience(e.target.value)}
                            className="flex-1 w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-teal-500/50 resize-y" rows={4} placeholder="Describe the target audience..." />
                    )}
                </div>

                <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 flex flex-col">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">🗣️ Brand Voice</h3>
                    {!isEditing ? (
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                            {client.brand_voice || 'Not defined yet. Let the AI analyze the brand tone.'}
                        </p>
                    ) : (
                        <textarea value={editVoice} onChange={e => setEditVoice(e.target.value)}
                            className="flex-1 w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-purple-500/50 resize-y" rows={4} placeholder="Describe the brand voice..." />
                    )}
                </div>

                <div className="bg-[#1E293B] p-6 rounded-xl border border-white/5 md:col-span-2 flex flex-col">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">📖 Full Master Persona (Markdown)</h3>
                    {!isEditing ? (
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1 bg-[#0F172A] p-4 rounded-lg border border-white/5 font-mono overflow-auto max-h-[600px]">
                            {client.bio || 'Mission Control needs more context. Run the onboarding protocol to learn everything about this brand.'}
                        </div>
                    ) : (
                        <textarea value={editBio} onChange={e => setEditBio(e.target.value)}
                            className="flex-1 w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-emerald-500/50 resize-y font-mono" rows={20} placeholder="Provide the full markdown persona brief..." />
                    )}
                </div>
            </div>
        </div>
    );
}
