"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

interface Trade {
    id: string;
    symbol: string;
    status: 'Planned' | 'Executed' | 'Completed' | 'Cancelled';
    profitLoss?: number;
    tradeType: string;
    entryPrice: number;
    stopLoss: number;
    target: number;
    riskRewardRatio: number;
    exitPrice?: number;
    quantity?: number;
}

interface DailyPlan {
    id: string;
    date: string;
    plan: string;
    marketBias?: string;
    maxRisk?: number;
    maxRiskPercent?: number;
    accountSize?: number;
    goals?: string;
}

interface Stats {
    totalTrades: number;
    winRate: number;
    totalProfitLoss: number;
    consistencyScore: number;
}

export default function TradingDashboard() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
    const [stats, setStats] = useState<Stats>({
        totalTrades: 0,
        winRate: 0,
        totalProfitLoss: 0,
        consistencyScore: 0
    });

    const fetchTradingData = async () => {
        try {
            // Fetch daily plan
            const planRes = await fetch("/api/trading/daily-plan");
            if (planRes.ok) {
                const plan = await planRes.json();
                setDailyPlan(plan);
            }
            
            // Fetch trades
            const tradesRes = await fetch("/api/trading/trades");
            let tradesData = [];
            if (tradesRes.ok) {
                tradesData = await tradesRes.json();
                setTrades(tradesData);
            }
            
            // Calculate stats using the fresh data
            const completedTrades = tradesData.filter((t: Trade) => t.status === 'Completed');
            const winningTrades = completedTrades.filter((t: Trade) => (t.profitLoss || 0) > 0).length;
            const totalPL = completedTrades.reduce((sum: number, t: Trade) => sum + (t.profitLoss || 0), 0);
            
            setStats({
                totalTrades: tradesData.length,
                winRate: completedTrades.length > 0 ? Math.round((winningTrades / completedTrades.length) * 100) : 0,
                totalProfitLoss: totalPL,
                consistencyScore: Math.round(Math.random() * 100) // Placeholder
            });
        } catch (error) {
            console.error("Error fetching trading data:", error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTradingData();
    }, []);

    return (
        <PageLayout>
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Trading Dashboard 📈</h1>
                        <p className="text-slate-500 text-sm font-medium">Plan, execute, and review trades with discipline</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/trading/plan" className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all">
                            Daily Plan
                        </Link>
                        <Link href="/trading/new" className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all">
                            New Trade
                        </Link>
                    </div>
                </div>

                {/* Daily Plan Section */}
                {dailyPlan && (
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                        <h2 className="text-lg font-bold mb-4">Today&apos;s Trading Plan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Market Bias</p>
                                <p className="text-lg font-bold text-primary">{dailyPlan.marketBias}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Max Risk</p>
                                <p className="text-lg font-bold">${dailyPlan.maxRisk}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Account Size</p>
                                <p className="text-lg font-bold">${dailyPlan.accountSize}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Goals</p>
                                <p className="text-sm font-semibold">{dailyPlan.goals}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Total Trades</p>
                        <h3 className="text-3xl font-black">{stats.totalTrades}</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Win Rate</p>
                        <h3 className="text-3xl font-black text-green-500">{stats.winRate}%</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Total P&L</p>
                        <h3 className={`text-3xl font-black ${stats.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${stats.totalProfitLoss.toFixed(2)}
                        </h3>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Consistency</p>
                        <h3 className="text-3xl font-black text-blue-500">{stats.consistencyScore}%</h3>
                    </div>
                </div>

                {/* Recent Trades */}
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Recent Trades</h2>
                        <Link href="/trading/trades" className="text-primary text-xs font-bold hover:underline">
                            View All
                        </Link>
                    </div>
                    
                    {trades.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-[#333]">
                                        <th className="text-left py-3 px-4 font-bold">Symbol</th>
                                        <th className="text-left py-3 px-4 font-bold">Type</th>
                                        <th className="text-left py-3 px-4 font-bold">Entry</th>
                                        <th className="text-left py-3 px-4 font-bold">Stop Loss</th>
                                        <th className="text-left py-3 px-4 font-bold">Target</th>
                                        <th className="text-left py-3 px-4 font-bold">R:R</th>
                                        <th className="text-left py-3 px-4 font-bold">Status</th>
                                        <th className="text-left py-3 px-4 font-bold">P&L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.slice(0, 5).map(trade => (
                                        <tr key={trade.id} className="border-b border-slate-100 dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#2A2A2A]">
                                            <td className="py-3 px-4 font-bold">{trade.symbol}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${trade.tradeType === 'Long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {trade.tradeType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">${trade.entryPrice.toFixed(2)}</td>
                                            <td className="py-3 px-4">${trade.stopLoss.toFixed(2)}</td>
                                            <td className="py-3 px-4">${trade.target.toFixed(2)}</td>
                                            <td className="py-3 px-4 font-bold">{trade.riskRewardRatio.toFixed(2)}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    trade.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                    trade.status === 'Executed' ? 'bg-yellow-100 text-yellow-700' :
                                                    trade.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {trade.status}
                                                </span>
                                            </td>
                                            <td className={`py-3 px-4 font-bold ${(trade.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                ${(trade.profitLoss || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center py-8 text-slate-400">No trades yet. Create your first trade!</p>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}
