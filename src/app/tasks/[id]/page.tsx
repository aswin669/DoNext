"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

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

export default function TaskDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTask();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await fetch("/api/tasks");
            if (res.ok) {
                const tasks: Task[] = await res.json();
                const found = tasks.find(t => t.id === id);
                setTask(found || null);
            }
        } catch (error) {
            console.error("Error fetching task:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleComplete = async () => {
        if (!task) return;
        try {
            // Optimistic update
            setTask({ ...task, completed: !task.completed });

            const res = await fetch(`/api/tasks/toggle/${task.id}`, {
                method: "POST"
            });

            if (!res.ok) {
                fetchTask(); // Rollback
            }
        } catch (error) {
            console.error("Toggle error:", error);
            fetchTask();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
                <h2 className="text-2xl font-bold mb-4">Task not found</h2>
                <Link href="/tasks" className="text-primary hover:underline">Back to Tasks</Link>
            </div>
        );
    }

    // Parse description for study goals
    const isStudy = task.category === "Study";

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <header className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#1A1A1A] px-6 py-3 sticky top-0 z-40">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="size-8 text-primary">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 4L6 14V34L24 44L42 34V14L24 4Z" fill="currentColor" fillOpacity="0.2"></path>
                                <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
                                <path d="M24 12V36" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                                <path d="M12 20L24 28L36 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">DoNext</h2>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/settings" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </div>
            </header>

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />

                <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-8 text-slate-500">
                            <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/tasks">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                <span className="text-sm font-medium">Back to My Tasks</span>
                            </Link>
                        </div>

                        <div className={`overflow-hidden rounded-3xl border-2 transition-all shadow-xl shadow-slate-200/20 dark:shadow-none ${task.completed ? "bg-slate-50 dark:bg-[#1A1A1A] border-slate-200 dark:border-[#222]" : "bg-white dark:bg-[#1A1A1A] border-purple-100 dark:border-purple-900/30"}`}>
                            <div className={`h-2 ${isStudy ? "bg-purple-500" : "bg-primary"}`}></div>
                            <div className="p-8 md:p-10">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${isStudy ? "bg-purple-500/10 text-purple-600" : "bg-primary/10 text-primary"}`}>
                                                {task.category || "General"}
                                            </span>
                                            {task.priority === "High" && (
                                                <span className="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider bg-red-500/10 text-red-600">High Priority</span>
                                            )}
                                        </div>
                                        <h1 className={`text-4xl font-black tracking-tight mb-2 ${task.completed ? "line-through text-slate-400" : ""}`}>
                                            {task.title}
                                        </h1>
                                        <p className="text-slate-500 font-medium">
                                            Goal ID: <span className="font-mono text-[10px]">{task.id}</span>
                                        </p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <Link 
                                                href={isStudy ? `/tasks/study/${task.id}/edit` : `/tasks/${task.id}/edit`}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#2A2A2A] rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                                Edit Goal
                                            </Link>
                                        </div>
                                    </div>

                                    <button
                                        onClick={toggleComplete}
                                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 ${task.completed
                                            ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-pointer"
                                            : "bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none hover:brightness-110"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">
                                            {task.completed ? "check_circle" : "radio_button_unchecked"}
                                        </span>
                                        {task.completed ? "Marked as Complete" : "Mark as Read / Done"}
                                    </button>
                                </div>

                                <div className="space-y-10">
                                    {/* Description / Content Section */}
                                    <div className="bg-slate-50/50 dark:bg-[#222] p-8 rounded-2xl border border-slate-100 dark:border-[#333]">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">subject</span>
                                            Content Breakdown
                                        </h3>

                                        {isStudy && task.description.includes("Sub-topics:") ? (
                                            <div className="space-y-8">
                                                {/* Progress Bar */}
                                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-slate-100 dark:border-[#333] shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-sm font-black flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-purple-600 text-[20px]">leaderboard</span>
                                                            Current Progress
                                                        </p>
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {(() => {
                                                                const parts = task.description.split(/Sub-topics:?\s*/i);
                                                                const sPart = parts[1]?.split(/\n\nMotivation:|\n\nMotivation|$|Motivation:/i)[0] || "";
                                                                const ts = sPart.split(/\n/).map(s => s.trim().replace(/^\d+\.\s*/, "")).filter(Boolean);
                                                                const done = ts.filter(t => t.startsWith("✅") || t.startsWith("[x]")).length;
                                                                return `${done} / ${ts.length} Topics Mastered`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-[#2A2A2A] h-2.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${(() => {
                                                                    const parts = task.description.split(/Sub-topics:?\s*/i);
                                                                    const sPart = parts[1]?.split(/\n\nMotivation:|\n\nMotivation|$|Motivation:/i)[0] || "";
                                                                    const ts = sPart.split(/\n/).map(s => s.trim().replace(/^\d+\.\s*/, "")).filter(Boolean);
                                                                    const done = ts.filter(t => t.startsWith("✅") || t.startsWith("[x]")).length;
                                                                    return ts.length > 0 ? (done / ts.length) * 100 : 0;
                                                                })()}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Next Topic Spotlight */}
                                                {(() => {
                                                    const parts = task.description.split(/Sub[- ]?topics:?\s*/i);
                                                    const sPart = parts[1]?.split(/\n\n[A-Z]/)[0] || "";
                                                    const ts = sPart.split(/\n|,/).map(s => s.trim().replace(/^\d+\.\s*/, "")).filter(Boolean);
                                                    const nextTopic = ts.find(t => !t.startsWith("✅") && !t.startsWith("[x]"));

                                                    if (!nextTopic && ts.length > 0) return (
                                                        <div className="bg-emerald-500/10 border-2 border-emerald-500/20 p-6 rounded-2xl text-center">
                                                            <p className="text-emerald-600 font-black">🎉 All sub-topics completed &quot;one by one&quot;!</p>
                                                        </div>
                                                    );

                                                    if (!nextTopic) return null;

                                                    return (
                                                        <div className="bg-purple-600 p-6 rounded-2xl text-white shadow-xl shadow-purple-200/20 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Recommended Next</p>
                                                                <h4 className="text-xl font-black">{nextTopic}</h4>
                                                            </div>
                                                            <button
                                                                onClick={async () => {
                                                                    const cleanTopic = nextTopic.replace(/^✅\s*|^\[x\]\s*/, "");
                                                                    const newTs = ts.map(t => t === nextTopic ? `✅ ${cleanTopic}` : t);

                                                                    const subTopicTag = task.description.match(/Sub[- ]?topics:?\s*/i)?.[0] || "Sub-topics:\n";
                                                                    const before = task.description.split(subTopicTag)[0];
                                                                    const after = task.description.split(subTopicTag)[1]?.split(/\n\n[A-Z]/)[1] || "";
                                                                    const sectionAfterSign = task.description.split(subTopicTag)[1]?.match(/\n\n[A-Z]/)?.[0] || "";

                                                                    const newDesc = `${before}${subTopicTag}${newTs.map((t, i) => `${i + 1}. ${t}`).join("\n")}${sectionAfterSign}${after}`;

                                                                    setTask({ ...task, description: newDesc });
                                                                    await fetch(`/api/tasks/${task.id}`, {
                                                                        method: "PUT",
                                                                        body: JSON.stringify({ ...task, description: newDesc })
                                                                    });
                                                                }}
                                                                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
                                                            >
                                                                Mark Done
                                                            </button>
                                                        </div>
                                                    );
                                                })()}

                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mastery Checklist:</p>
                                                    {(() => {
                                                        const parts = task.description.split(/Sub[- ]?topics:?\s*/i);
                                                        const sPart = parts[1]?.split(/\n\n[A-Z]/)[0] || ""; // Stop at next double-newline section header
                                                        const ts = sPart.split(/\n|,/).map(s => s.trim().replace(/^\d+\.\s*/, "")).filter(Boolean);

                                                        if (ts.length === 0) return (
                                                            <div className="p-6 text-center border-2 border-dashed border-slate-100 dark:border-[#333] rounded-xl text-slate-400 italic text-sm">
                                                                No specific sub-topics defined for this goal yet.
                                                            </div>
                                                        );

                                                        return ts.map((topic, idx) => {
                                                            const isCompleted = topic.startsWith("✅") || topic.startsWith("[x]");
                                                            const cleanTopic = topic.replace(/^✅\s*|^\[x\]\s*/, "");
                                                            return (
                                                                <div key={idx} className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${isCompleted ? "bg-slate-50/50 dark:bg-emerald-950/5 border-emerald-100/50" : "bg-white dark:bg-[#1A1A1A] border-slate-100 dark:border-[#333] hover:border-purple-200"}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`size-8 rounded-lg flex items-center justify-center ${isCompleted ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-400"}`}>
                                                                            <span className="material-symbols-outlined text-[16px]">{isCompleted ? "check_circle" : "bookmark"}</span>
                                                                        </div>
                                                                        <span className={`text-sm font-bold ${isCompleted ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}`}>
                                                                            {cleanTopic}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const newTs = ts.map(t => t.replace(/^✅\s*|^\[x\]\s*/, "") === cleanTopic ? (isCompleted ? cleanTopic : `✅ ${cleanTopic}`) : t);
                                                                            // Robust replace: find the sub-topics section and replace it
                                                                            const subTopicTag = task.description.match(/Sub[- ]?topics:?\s*/i)?.[0] || "Sub-topics:\n";
                                                                            const before = task.description.split(subTopicTag)[0];
                                                                            const after = task.description.split(subTopicTag)[1]?.split(/\n\n[A-Z]/)[1] || "";
                                                                            const sectionAfterSign = task.description.split(subTopicTag)[1]?.match(/\n\n[A-Z]/)?.[0] || "";

                                                                            const newDesc = `${before}${subTopicTag}${newTs.map((t, i) => `${i + 1}. ${t}`).join("\n")}${sectionAfterSign}${after}`;

                                                                            setTask({ ...task, description: newDesc });
                                                                            await fetch(`/api/tasks/${task.id}`, {
                                                                                method: "PUT",
                                                                                body: JSON.stringify({ ...task, description: newDesc })
                                                                            });
                                                                        }}
                                                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-500 hover:bg-purple-600 hover:text-white"}`}
                                                                    >
                                                                        {isCompleted ? "Done" : "Mark as Read / Done"}
                                                                    </button>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                                                {task.description || "No detailed information provided for this task."}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-2xl border border-slate-100 dark:border-[#222] bg-white dark:bg-[#1A1A1A]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className={`font-bold ${task.completed ? "text-primary" : "text-yellow-500"}`}>
                                                {task.completed ? "Success" : "In Progress"}
                                            </p>
                                        </div>
                                        <div className="p-6 rounded-2xl border border-slate-100 dark:border-[#222] bg-white dark:bg-[#1A1A1A]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Created</p>
                                            <p className="font-bold">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => router.push("/tasks")}
                            className="text-sm font-bold text-slate-400 hover:text-purple-500 transition-colors"
                        >
                            Done viewing? Go back to Tasks
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
