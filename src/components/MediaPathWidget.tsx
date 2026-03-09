'use client';
import { useState } from 'react';

export default function MediaPathWidget() {
    const defaultPath = "C:\\Users\\Busin\\OneDrive\\Documents\\AI Projects\\BIAB Project\\EMP Project\\Clients\\Kate Monroe, CEO\\Photos";
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(defaultPath);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl p-5 flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold flex items-center gap-2 flex-shrink-0">
                    📂 MC Onboarding Media Path
                </h3>
                {copied && <span className="text-xs text-teal-400 font-medium">Copied!</span>}
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                Use this exact path when triggering the Asset Ingestion pipeline for new client media.
            </p>
            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <code className="flex-1 text-xs font-mono text-blue-400 break-all select-all overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {defaultPath}
                </code>
                <button
                    onClick={handleCopy}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white"
                    title="Copy Path"
                >
                    📋
                </button>
            </div>
        </div>
    );
}
