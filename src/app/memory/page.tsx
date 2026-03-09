import React from 'react';

export default function MemoryManagement() {
    return (
        <main className="min-h-screen p-8 text-white">
            <header className="mb-12">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    Neural Pathway (Pinecone Vector DB)
                </h1>
                <p className="text-gray-400 mt-2">Manage your active RAG nodes and ingest new documents.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingestion Panel */}
                <div className="glass-panel p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                    <h2 className="text-xl font-semibold mb-6">Ingest New Context</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Source Name</label>
                            <input type="text" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Q3 Financial Report" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Raw Text Data</label>
                            <textarea className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Paste transcript or document here..."></textarea>
                        </div>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-indigo-600/30">
                            Generate Embeddings & Upsert to Pinecone
                        </button>
                    </div>
                </div>

                {/* Existing Vectors View */}
                <div className="glass-panel p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col">
                    <h2 className="text-xl font-semibold mb-6">Live Memory Clusters</h2>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 bg-black/20 border border-white/5 rounded-xl flex items-start gap-4">
                                <div className="bg-green-500/20 text-green-400 p-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-medium">Client Strategy Call #{i}</h4>
                                    <p className="text-sm text-gray-400 mt-1 truncate w-64">Vector ID: vx-{i}0934...</p>
                                    <p className="text-xs text-indigo-400 mt-2">12 Embeddings • 5 mins ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
