'use client';
import { useState } from 'react';
import SocialMediaWidget from './SocialMediaWidget';

export default function OnboardingAgent() {
    const [messages, setMessages] = useState([
        { role: 'agent', text: 'Hello! I am the Master Onboarding Agent. To provision your social media pipelines, please provide your brand name or main website URL.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSocialWidget, setShowSocialWidget] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');
        setLoading(true);

        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { role: 'agent', text: `Got it. I'm scanning the web for social media footprints associated with that URL now...` },
                { role: 'agent', text: `I found a LinkedIn Company Page and a Twitter/X handle. Do you want me to configure Make.com webhooks for these channels?` }
            ]);
            setLoading(false);
            setShowSocialWidget(true);
        }, 2000);
    };

    return (
        <>
            <div className="w-full max-w-4xl mx-auto bg-[#0F172A] rounded-2xl border border-white/5 shadow-2xl flex flex-col overflow-hidden" style={{ height: '70vh' }}>
                <div className="p-4 bg-teal-500/10 border-b border-teal-500/20 flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                        <h2 className="text-lg font-bold text-teal-400">Onboarding Agent</h2>
                        <p className="text-xs text-teal-500/70">Master Provisioning Protocol</p>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-xl text-sm ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-[#1E293B] text-slate-200 border border-white/5 rounded-bl-none'
                                }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-[#1E293B] text-slate-400 border border-white/5 p-4 rounded-xl rounded-bl-none text-sm animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-[#1E293B] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>

            {showSocialWidget && (
                <div className="w-full max-w-4xl mx-auto mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <SocialMediaWidget clientId="temp-onboarding-client" />
                </div>
            )}
        </>
    );
}
