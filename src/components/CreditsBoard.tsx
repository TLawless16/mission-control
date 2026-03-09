'use client';

import { useState, useEffect } from 'react';
import { useClientStore } from '@/lib/clientStore';

interface CreditUsage {
    id: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    cost_usd: string;
    task_description: string;
    created_at: string;
    agents?: { name: string } | null;
}

interface Budget {
    budget_usd: string;
    spent_usd: string;
}

export default function CreditsBoard() {
    const { activeContext } = useClientStore();
    const [budget, setBudget] = useState<Budget | null>(null);
    const [usageLogs, setUsageLogs] = useState<CreditUsage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const orgId = activeContext === 'platform' ? '00000000-0000-0000-0000-000000000001' : activeContext;

    useEffect(() => {
        async function fetchCredits() {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/credits?org_id=${orgId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBudget(data.budget);
                    setUsageLogs(data.usageLogs);
                }
            } catch (error) {
                console.error('Failed to fetch credits dashboard', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (orgId) {
            fetchCredits();
        }
    }, [orgId]);

    if (isLoading) {
        return <div className="p-8 text-gray-500 animate-pulse">Loading API Credit Data...</div>;
    }

    const budgetVal = budget ? parseFloat(budget.budget_usd) : 300;
    const spentVal = budget ? parseFloat(budget.spent_usd) : 0;
    const percentage = Math.min((spentVal / budgetVal) * 100, 100);
    const remainingVal = Math.max(budgetVal - spentVal, 0);

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 pt-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2 mt-4">API Credits & Billing</h1>
                <p className="text-sm text-gray-500">Track your OpenClaw token usage, active limits, and API spending.</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Budget</h3>
                    <div className="text-3xl font-light text-gray-900 mb-4">${budgetVal.toFixed(2)}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
                        <div
                            className={`h-1.5 rounded-full ${percentage > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}% utilized this month</p>
                </div>

                <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Remaining Credits</h3>
                        <div className="text-3xl font-light text-green-600">${remainingVal.toFixed(2)}</div>
                    </div>
                    <p className="text-xs text-gray-500">Available across all active agents</p>
                </div>

                <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Spend</h3>
                        <div className="text-3xl font-light text-gray-900">${spentVal.toFixed(2)}</div>
                    </div>
                    <p className="text-xs text-gray-500">Total API billing accrued</p>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Usage Logs</h2>

                {usageLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="text-md font-medium text-gray-900 mb-1">No API Usage Yet</h3>
                        <p className="text-sm text-gray-500">Agent activity will be securely logged here when operations resume.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Description</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tokens</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {usageLogs.map((log) => {
                                    const totalTokens = (log.input_tokens || 0) + (log.output_tokens || 0);
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.agents?.name || 'System'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                                {log.task_description || 'Background Operation'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {log.model}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {totalTokens.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                ${parseFloat(log.cost_usd).toFixed(4)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
