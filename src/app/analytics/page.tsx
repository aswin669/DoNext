"use client";

import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";

interface AnalyticsData {
    weeklyStats: Array<{ day: string; tasks: number; completed: number }>;
    monthlyStats: Array<{ week: number; tasks: number; completed: number }>;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgCompletion?: number;
    bestStreak?: number;
    intensityData?: Record<string, number>;
    weeklyTrend?: number[];
    categoryAnalysis?: Array<{ name: string; percentage: number }>;
    habitStats?: Array<{ name: string; percentage: number; streak?: number }>;
}

export default function Analytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/analytics");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Analytics fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleDayClick = (dayIndex: number) => {
        setSelectedDay(dayIndex);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <PageLayout>
            <div className="flex flex-col gap-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Productivity Analytics & Insights</h1>
                        <p className="text-slate-500 text-sm">Review your consistency and goal progress over time</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select className="bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] rounded-xl px-4 py-2 text-sm font-semibold shadow-sm focus:ring-primary focus:border-primary text-[#333] dark:text-white appearance-none">
                            <option>Last 12 Months</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                        <button className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all">
                            <span className="material-symbols-outlined text-[20px]">file_download</span>
                            <span>Export Data</span>
                        </button>
                    </div>
                </div>

                <section className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#222] shadow-sm p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold">Consistency Overview</h2>
                            <p className="text-xs text-slate-400">Productivity activity mapping and completion trends</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg. Completion</p>
                                <p className="text-xl font-black text-primary">{data?.avgCompletion || 0}%</p>
                            </div>
                            <div className="w-[1px] bg-slate-100 dark:bg-slate-800"></div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Best Streak</p>
                                <p className="text-xl font-black text-primary">{data?.bestStreak || 0} Days</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#333] dark:text-white">
                                <span className="material-symbols-outlined text-primary text-sm">grid_view</span>
                                Task Intensity Heatmap
                            </h3>
                            <div className="flex flex-col gap-1 overflow-x-auto no-scrollbar pb-2">
                                {[0, 1, 2].map((row) => (
                                    <div key={row} className="flex gap-1">
                                        {Array.from({ length: 30 }).map((_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - (90 - (row * 30 + i)));
                                            const dateStr = d.toISOString().split('T')[0];
                                            const count = data?.intensityData?.[dateStr] || 0;
                                            const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 6 ? 3 : 4;
                                            return (
                                                <div key={i} className={`heatmap-cell heatmap-cell-${level}`} title={`${dateStr}: ${count} tasks`}></div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                        </div>

                        <div className="lg:col-span-5 border-l border-slate-50 dark:border-slate-800 lg:pl-10">
                            <h3 className="text-sm font-bold mb-4 flex items-center justify-between text-[#333] dark:text-white">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
                                    Completion Trend
                                </span>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Weekly</span>
                            </h3>
                            <div className="relative h-24 flex items-end gap-2 px-1">
                                {(data?.weeklyTrend || [60, 75, 95, 80, 40, 85, 90]).map((height: number, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => handleDayClick(i)}
                                        className={`flex-1 rounded-t h-full relative group transition-all cursor-pointer ${
                                            selectedDay === i 
                                                ? "bg-primary/20" 
                                                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        <div
                                            className={`absolute bottom-0 left-0 right-0 rounded-t transition-all ${
                                                selectedDay === i
                                                    ? "bg-primary"
                                                    : "bg-primary/30 group-hover:bg-primary"
                                            }`}
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded z-10">{height}%</div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#222] shadow-sm p-6 text-[#333] dark:text-white">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Category Analysis</h2>
                            <span className="material-symbols-outlined text-slate-300">more_horiz</span>
                        </div>
                        <div className="space-y-6">
                            {(data?.categoryAnalysis || []).map((cat: { name: string; percentage: number }) => (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold flex items-center gap-2">
                                            <span className={`size-2 rounded-full ${cat.name === 'Study' ? 'bg-blue-400' : 'bg-primary'}`}></span> {cat.name}
                                        </span>
                                        <span className="font-bold">{cat.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${cat.name === 'Study' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.3)]' : 'bg-primary shadow-[0_0_8px_rgba(139,195,74,0.4)]'}`}
                                            style={{ width: `${cat.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                                    <span className="font-bold text-slate-700 dark:text-white">Insight:</span> Your study sessions are most productive between 8 AM and 11 AM. Consider moving high-priority tasks to this window.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#222] shadow-sm p-6 text-[#333] dark:text-white">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Habit Statistics</h2>
                            <button className="text-xs font-bold text-primary hover:underline">Manage Habits</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {(data?.habitStats || []).length > 0 ? data?.habitStats?.map((habit: { name: string; percentage: number; streak?: number }) => (
                                <div key={habit.name} className="p-4 border border-slate-50 dark:border-[#222] rounded-2xl flex flex-col items-center text-center">
                                    <div className="relative size-16 mb-3">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                            <circle className="stroke-slate-100 dark:stroke-slate-800" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                                            <circle
                                                className="stroke-primary transition-all duration-500"
                                                cx="18" cy="18" fill="none" r="16"
                                                strokeWidth="3"
                                                strokeDasharray="100"
                                                strokeDashoffset={100 - habit.percentage}
                                                strokeLinecap="round"
                                            ></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{habit.percentage}%</div>
                                    </div>
                                    <p className="text-xs font-bold truncate w-full">{habit.name}</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-orange-400 text-[14px]">local_fire_department</span>
                                        <span className="text-[10px] font-bold text-slate-400">{habit.streak}d Streak</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 py-4 text-center">
                                    <p className="text-xs text-slate-400">No habit data yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <style jsx>{`
                .heatmap-cell {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                    transition: all 0.2s;
                }
                .heatmap-cell-0 { background-color: #f1f5f9; }
                .heatmap-cell-1 { background-color: rgba(139, 195, 74, 0.2); }
                .heatmap-cell-2 { background-color: rgba(139, 195, 74, 0.4); }
                .heatmap-cell-3 { background-color: rgba(139, 195, 74, 0.7); }
                .heatmap-cell-4 { background-color: #8BC34A; }
                
                :global(.dark) .heatmap-cell-0 { background-color: #1e293b; }
                
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </PageLayout>
    );
}
