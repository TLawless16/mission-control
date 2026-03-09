"use client";

import { useState, useEffect } from "react";

type SocialAccount = {
    id: string;
    platform: string;
    handle: string;
    profile_url: string | null;
    settings: any;
};

export default function SocialMediaWidget({ clientId }: { clientId: string }) {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [platform, setPlatform] = useState("Facebook");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [handle, setHandle] = useState("");
    const [profileUrl, setProfileUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const platforms = [
        "Facebook", "Instagram", "X (Twitter)", "LinkedIn",
        "TikTok", "YouTube", "Pinterest", "Snapchat", "Other"
    ];

    useEffect(() => {
        if (clientId) {
            fetchAccounts();
        }
    }, [clientId]);

    const fetchAccounts = async () => {
        try {
            const res = await fetch(`/api/social-accounts?clientId=${clientId}`);
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/social-accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId,
                    platform,
                    email,
                    password,
                    handle,
                    profileUrl,
                }),
            });

            if (res.ok) {
                // Reset form
                setEmail("");
                setPassword("");
                setHandle("");
                setProfileUrl("");
                // Refresh list
                fetchAccounts();
            } else {
                alert("Failed to add social account.");
            }
        } catch (error) {
            console.error(error);
            alert("Error adding social account.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 my-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" /></svg>
                Social Media Credentials
            </h3>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 bg-slate-800/50 p-4 rounded border border-slate-700">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Platform</label>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-sm rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    >
                        {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">@Handle</label>
                    <input
                        type="text" required placeholder="@katemonroe"
                        value={handle} onChange={(e) => setHandle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-sm rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Login Email</label>
                    <input
                        type="email" required placeholder="social@company.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-sm rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Password</label>
                    <input
                        type="text" required placeholder="SecurePass123!"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-sm rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Adding..." : "+ Add Account"}
                    </button>
                </div>
            </form>

            {/* Display Grid */}
            {isLoading ? (
                <div className="text-sm text-slate-400 animate-pulse">Loading accounts...</div>
            ) : accounts.length === 0 ? (
                <div className="text-sm text-slate-500 italic text-center py-8">No social media accounts configured yet.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(account => (
                        <div key={account.id} className="bg-slate-950 border border-slate-800 rounded p-4 hover:border-slate-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-white">{account.platform}</span>
                                <span className="text-xs bg-slate-800 text-blue-400 px-2 py-1 rounded-full font-mono">{account.handle}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span className="text-slate-500 text-xs">Email</span>
                                    <span className="text-slate-300 font-mono text-xs">{account.settings?.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                    <span className="text-slate-500 text-xs">Password</span>
                                    <span className="text-slate-300 font-mono text-xs">{account.settings?.password || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
