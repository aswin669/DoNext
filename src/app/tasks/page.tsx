"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: string;
    category: string;
    type: string;
    date: string;
    time: string;
    location: string;
}

export default function MyTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [routine, setRoutine] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, routineRes] = await Promise.all([
                fetch("/api/tasks"),
                fetch("/api/routine")
            ]);

            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                setTasks(tasksData);
            }
            if (routineRes.ok) {
                const routineData = await routineRes.json();
                setRoutine(routineData);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (id: string, isRoutine: boolean = false) => {
        try {
            if (isRoutine) {
                // Optimistic update for routine
                setRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
                await fetch(`/api/routine/toggle/${id}`, { method: "POST" });
            } else {
                // Optimistic update for task
                setTasks(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
                await fetch(`/api/tasks/toggle/${id}`, { method: "POST" });
            }
        } catch (error) {
            console.error("Toggle error:", error);
            fetchData();
        }
    };

    const importantTasks = tasks.filter(t => t.category === "Important" || t.priority === "High");
    const otherTasks = tasks.filter(t => t.category !== "Important" && t.priority !== "High" && t.category !== "Study");
    
    // Group tasks by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = tasks.filter(t => {
        if (!t.date) return false;
        const taskDate = new Date(t.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });
    
    const previousDaysTasks = tasks.filter(t => {
        if (!t.date) return false;
        const taskDate = new Date(t.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() < today.getTime();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight tracking-tight">My Tasks</h1>
                                <p className="text-slate-500 text-sm font-medium">Syncing with your progress database</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/tasks/important/new" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    <span>New Task</span>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 flex flex-col gap-8">
                                {/* Daily Routine Sync */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">today</span>
                                            <h2 className="text-lg font-bold">Daily Routine</h2>
                                        </div>
                                        <Link href="/routine" className="text-xs font-bold text-primary hover:underline uppercase">Manage Routine</Link>
                                    </div>
                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#222] shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <tbody className="divide-y divide-slate-50 dark:divide-[#222]">
                                                    {routine.length > 0 ? routine.map((item, i) => (
                                                        <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors">
                                                            <td className="px-5 py-4 w-12 text-center">
                                                                <input
                                                                    checked={item.completed}
                                                                    onChange={() => toggleTask(item.id, true)}
                                                                    className="rounded border-slate-300 text-primary focus:ring-primary size-5 cursor-pointer"
                                                                    type="checkbox"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className={`flex items-center gap-3 ${item.completed ? "opacity-50" : ""}`}>
                                                                    <span className="text-lg">{item.icon}</span>
                                                                    <div className="flex flex-col">
                                                                        <span className={`font-bold text-sm ${item.completed ? "line-through" : ""}`}>{item.task}</span>
                                                                        <span className="text-[11px] text-slate-400">{item.time}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.completed ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                                                                    {item.completed ? "Done" : "To-Do"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={3} className="p-8 text-center text-slate-400 font-medium italic">No routine steps found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* General Tasks */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">list_alt</span>
                                        <h2 className="text-lg font-bold">General Tasks</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {otherTasks.length > 0 ? otherTasks.map((task) => (
                                            <div key={task.id} className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => toggleTask(task.id)}
                                                        className="size-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                    <div>
                                                        <p className={`text-sm font-bold ${task.completed ? "line-through text-slate-400" : ""}`}>{task.title}</p>
                                                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{task.description || "No description"}</p>
                                                    </div>
                                                </div>
                                                <div className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-[16px] text-slate-400">more_vert</span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 dark:border-[#222] rounded-3xl text-slate-400 italic font-medium">
                                                No general tasks yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Study Plan Section */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-purple-500">menu_book</span>
                                            <h2 className="text-lg font-bold">Study Plan</h2>
                                        </div>
                                        <Link href="/tasks/study/new" className="text-xs font-bold text-purple-500 hover:underline uppercase">Add Focus Goal</Link>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {tasks.filter(t => t.category === "Study").length > 0 ? tasks.filter(t => t.category === "Study").map((task) => (
                                            <div key={task.id} className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm flex items-center justify-between group hover:border-purple-200 transition-all">
                                                <Link href={`/tasks/${task.id}`} className="flex items-center gap-4 flex-1 cursor-pointer">
                                                    <div className={`size-10 rounded-xl ${task.completed ? "bg-slate-100 text-slate-400" : "bg-purple-50 dark:bg-purple-900/20 text-purple-600"} flex items-center justify-center`}>
                                                        <span className="material-symbols-outlined">{task.completed ? "check_circle" : "school"}</span>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${task.completed ? "line-through text-slate-400" : ""}`}>{task.title}</p>
                                                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{task.description?.split('\n')[0]}</p>
                                                    </div>
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleTask(task.id)}
                                                        className={`size-8 rounded-full flex items-center justify-center transition-all ${task.completed ? "bg-primary text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-purple-500"}`}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">{task.completed ? "done" : "circle"}</span>
                                                    </button>
                                                    <Link href={`/tasks/${task.id}`} className="size-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100">
                                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        )) : (
                                            <Link href="/tasks/study/new" className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 dark:border-[#222] rounded-3xl text-slate-400 hover:text-purple-500 hover:border-purple-500 transition-all italic font-medium">
                                                No study goals set. Click to create one.
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Previous Days Tasks */}
                                {previousDaysTasks.length > 0 && (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">history</span>
                                            <h2 className="text-lg font-bold">Previous Days</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {previousDaysTasks.map((task) => {
                                                const taskDate = new Date(task.date);
                                                const dateStr = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                return (
                                                    <div key={task.id} className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={task.completed}
                                                                onChange={() => toggleTask(task.id)}
                                                                className="size-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                            />
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-bold ${task.completed ? "line-through text-slate-400" : ""}`}>{task.title}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-slate-400">{dateStr}</span>
                                                                    {task.category && (
                                                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                                                            {task.category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${task.completed ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}>
                                                            {task.completed ? "Done" : "Pending"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar: Important & Critical Tasks */}
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500">stars</span>
                                        <h2 className="text-lg font-bold">Critical</h2>
                                    </div>
                                    <span className="text-[10px] font-black text-red-500 uppercase bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded tracking-tighter">High Priority</span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {importantTasks.length > 0 ? importantTasks.map((task) => (
                                        <div key={task.id} className={`relative p-5 rounded-2xl overflow-hidden group hover:shadow-md transition-all border-2 ${task.completed ? "bg-slate-50 dark:bg-[#222] border-slate-100 dark:border-[#333]" : "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30"}`}>
                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                <span className="material-symbols-outlined text-6xl">priority_high</span>
                                            </div>
                                            <div className="relative z-10 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${task.completed ? "bg-slate-400 text-white" : "bg-red-500 text-white"}`}>
                                                        {task.completed ? "Resolved" : (task.type || "Important")}
                                                    </span>
                                                    <span className={`text-xs font-bold ${task.completed ? "text-slate-400" : "text-red-600"}`}>
                                                        {task.date ? new Date(task.date).toLocaleDateString() : "No Date"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className={`text-base font-extrabold ${task.completed ? "text-slate-400 line-through" : "text-red-900 dark:text-red-100"}`}>{task.title}</h3>
                                                    <p className="text-sm text-red-700/70 dark:text-red-400/70 truncate">{task.location || "No location set"}</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleTask(task.id)}
                                                    className={`w-full py-2 rounded-xl text-xs font-black uppercase transition-all ${task.completed ? "bg-slate-200 text-slate-500" : "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:brightness-110"}`}
                                                >
                                                    {task.completed ? "Reactivate" : "Mark as Resolved"}
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center border-2 border-dashed border-red-100 dark:border-red-900/10 rounded-3xl text-slate-400 italic">
                                            No critical tasks. Focus on your routine!
                                        </div>
                                    )}

                                    <Link className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-[#222] p-4 rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all group" href="/tasks/important/new">
                                        <span className="material-symbols-outlined">add_circle</span>
                                        <span className="text-sm font-bold">Add Critical Task</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
