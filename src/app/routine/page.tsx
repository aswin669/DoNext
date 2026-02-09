"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";

interface RoutineItem {
    id: string;
    time: string;
    task: string;
    icon: string;
    category: string;
    active: boolean;
    completed: boolean;
}

export default function RoutineManagement() {
    const [routine, setRoutine] = useState<RoutineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutine();
    }, []);

    const fetchRoutine = async () => {
        try {
            const res = await fetch("/api/routine");
            if (res.ok) {
                const data = await res.json();
                setRoutine(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleComplete = async (id: string) => {
        try {
            // Optimistic update
            setRoutine(routine.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            ));

            const res = await fetch(`/api/routine/toggle/${id}`, {
                method: "POST"
            });

            if (!res.ok) {
                // Revert if failed
                fetchRoutine();
            }
        } catch (error) {
            console.error("Toggle error:", error);
            fetchRoutine();
        }
    };

    const activeRoutine = routine.filter(item => item.active);
    const completedCount = activeRoutine.filter(item => item.completed).length;
    const totalCount = activeRoutine.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daily Routine Management</h1>
                        <p className="text-slate-500 text-sm font-medium">Optimize your day with a perfectly timed schedule</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#222] px-4 py-2 rounded-xl shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Today</span>
                            <span className="text-sm font-black text-primary">{progressPercent}% Done</span>
                        </div>
                        <Link href="/routine/new" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            <span>Add New Step</span>
                        </Link>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm flex flex-col md:flex-row md:items-center gap-8">
                    <div className="relative size-32 flex-shrink-0 mx-auto md:mx-0">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <circle className="stroke-slate-100 dark:stroke-slate-800" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                            <circle
                                className="stroke-primary transition-all duration-700 ease-out"
                                cx="18" cy="18" fill="none" r="16"
                                strokeWidth="3"
                                strokeDasharray="100"
                                strokeDashoffset={100 - progressPercent}
                                strokeLinecap="round"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-primary">{progressPercent}%</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Today</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h2 className="text-xl font-bold">Today&apos;s Routine Progress</h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {totalCount > 0
                                    ? `You've completed ${completedCount} out of ${totalCount} routine steps today.`
                                    : "You haven't added any routine steps for today yet."}
                            </p>
                        </div>
                        {totalCount > 0 && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
                                    <span className="font-bold text-slate-700 dark:text-white">{totalCount - completedCount} Steps</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Routine List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#222] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 dark:border-[#222] flex items-center justify-between">
                                <h2 className="font-bold">Routine Timeline</h2>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                {routine.length > 0 ? (
                                    routine.map((item, idx) => (
                                        <div key={item.id} className="relative group">
                                            {idx !== routine.length - 1 && (
                                                <div className="absolute left-[23px] top-10 bottom-[-16px] w-[2px] bg-slate-100 dark:bg-slate-800 z-0"></div>
                                            )}
                                            <div
                                                onClick={() => item.active && toggleComplete(item.id)}
                                                className={`relative z-10 flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${item.active ? 'border-transparent bg-white dark:bg-[#1A1A1A] group-hover:border-primary/20 shadow-sm' : 'border-slate-50 dark:border-[#222] bg-slate-50/50 dark:bg-slate-900/30 opacity-60'}`}
                                            >
                                                <div className={`size-12 rounded-full flex items-center justify-center text-xl shadow-inner transition-all transform ${item.completed ? 'bg-primary text-white scale-110' : item.active ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-400'}`}>
                                                    {item.completed ? <span className="material-symbols-outlined font-black">check</span> : item.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className={`text-sm font-bold transition-all ${item.completed ? 'text-slate-400 line-through decoration-primary decoration-2' : item.active ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{item.task}</p>
                                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 px-2 py-0.5 rounded">{item.time}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium">{item.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-400 font-medium">No routine steps yet. Click &quot;Add New Step&quot; to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm">
                            <h3 className="font-bold text-lg mb-6">Routine Performance</h3>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <span className="text-sm font-black text-primary">{progressPercent}%</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Consistency</p>
                                        <p className="text-sm font-bold">{progressPercent > 70 ? 'Excellent' : 'Getting Started'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
