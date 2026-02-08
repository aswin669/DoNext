"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface CompletedTask {
    id: string;
    title: string;
    description?: string;
    category?: string;
    priority: string;
    completedAt: string;
    createdAt: string;
}

export default function CompletedTasks() {
    const [tasks, setTasks] = useState<CompletedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dayFilter, setDayFilter] = useState("all");

    useEffect(() => {
        const fetchCompletedTasks = async () => {
            try {
                const res = await fetch("/api/tasks?completed=true");
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data);
                }
            } catch (error) {
                console.error("Error fetching completed tasks:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompletedTasks();
    }, []);

    const getFilteredTasks = () => {
        let filtered = tasks;

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter(t => t.category === categoryFilter);
        }

        // Day filter
        if (dayFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(t => {
                const completedDate = new Date(t.completedAt);
                const taskDate = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
                const daysDiff = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));

                switch (dayFilter) {
                    case "today":
                        return daysDiff === 0;
                    case "yesterday":
                        return daysDiff === 1;
                    case "week":
                        return daysDiff >= 0 && daysDiff < 7;
                    case "month":
                        return daysDiff >= 0 && daysDiff < 30;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    };

    const filteredTasks = getFilteredTasks();
    const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <Header />

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background-light dark:bg-background-dark">
                    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Completed Tasks</h1>
                                <p className="text-slate-500 text-sm">View all your finished tasks</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{tasks.length}</p>
                                <p className="text-xs text-slate-400">Total Completed</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col gap-4">
                            {/* Day Filter */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Time Period</p>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => setDayFilter("all")}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                            dayFilter === "all"
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                        }`}
                                    >
                                        All Time
                                    </button>
                                    <button
                                        onClick={() => setDayFilter("today")}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                            dayFilter === "today"
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                        }`}
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={() => setDayFilter("yesterday")}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                            dayFilter === "yesterday"
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                        }`}
                                    >
                                        Yesterday
                                    </button>
                                    <button
                                        onClick={() => setDayFilter("week")}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                            dayFilter === "week"
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                        }`}
                                    >
                                        This Week
                                    </button>
                                    <button
                                        onClick={() => setDayFilter("month")}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                            dayFilter === "month"
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                        }`}
                                    >
                                        This Month
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Category</p>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => setCategoryFilter("all")}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                            categoryFilter === "all"
                                                ? "bg-primary text-white"
                                                : "bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                        }`}
                                    >
                                        All
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoryFilter(cat || "all")}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                                                categoryFilter === cat
                                                    ? "bg-primary text-white"
                                                    : "bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tasks List */}
                        <div className="space-y-3">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#222] rounded-xl p-4 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                                    <h3 className="font-bold text-[#333] dark:text-white">{task.title}</h3>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                                    {task.category && (
                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                            {task.category}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 rounded font-semibold ${
                                                        task.priority === "High" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                                                        task.priority === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                                                        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                    }`}>
                                                        {task.priority}
                                                    </span>
                                                    <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4 block">task_alt</span>
                                    <p className="text-slate-500 dark:text-gray-400">No completed tasks yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
