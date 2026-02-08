"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRoutineStep() {
    const router = useRouter();
    const [task, setTask] = useState("");
    const [time, setTime] = useState("08:00");
    const [period, setPeriod] = useState("AM");
    const [category, setCategory] = useState("Health");
    const [icon, setIcon] = useState("✨");

    const categories = [
        { name: "Health", icon: "🧘" },
        { name: "Work", icon: "💻" },
        { name: "Personal", icon: "📖" },
        { name: "Nutrition", icon: "🥗" },
        { name: "Mindset", icon: "🧠" },
        { name: "Other", icon: "✨" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/routine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task, time, category, icon })
            });
            if (res.ok) {
                router.push("/routine");
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#1A1A1A] px-6 py-3 sticky top-0 z-40">
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
                <div className="flex items-center gap-4">
                    <Link href="/settings" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <Link className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-semibold mb-2" href="/routine">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Routine
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight">Add Routine Step</h1>
                        <p className="text-slate-500 font-medium mt-1">Design your perfect daily flow</p>
                    </div>

                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm overflow-hidden">
                        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                            {/* Task Name & Icon */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Step Description</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-shrink-0 size-12 flex items-center justify-center text-2xl bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] rounded-xl border border-slate-200 dark:border-[#333] transition-colors"
                                    >
                                        {icon}
                                    </button>
                                    <input
                                        className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] dark:text-white px-4 text-base font-medium placeholder:text-slate-400 focus:border-primary focus:ring-primary h-12"
                                        placeholder="e.g. Morning Meditation"
                                        required
                                        type="text"
                                        value={task}
                                        onChange={(e) => setTask(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Scheduled Time</label>
                                <div className="flex gap-3 items-center">
                                    <div className="relative flex-1">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">schedule</span>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] dark:text-white pl-12 pr-4 focus:border-primary focus:ring-primary h-12 font-bold"
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex bg-slate-100 dark:bg-[#2A2A2A] p-1 rounded-xl border border-slate-200 dark:border-[#333]">
                                        <button
                                            type="button"
                                            onClick={() => setPeriod("AM")}
                                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${period === "AM" ? "bg-white dark:bg-[#333] text-primary shadow-sm" : "text-slate-400"}`}
                                        >
                                            AM
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPeriod("PM")}
                                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${period === "PM" ? "bg-white dark:bg-[#333] text-primary shadow-sm" : "text-slate-400"}`}
                                        >
                                            PM
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => {
                                                setCategory(cat.name);
                                                setIcon(cat.icon);
                                            }}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${category === cat.name
                                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                : "border-slate-100 dark:border-[#222] text-slate-500 dark:text-slate-400 hover:border-slate-200"
                                                }`}
                                        >
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-xs font-bold leading-none">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-[#222]">
                                <Link href="/routine" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all">Cancel</Link>
                                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2" type="submit">
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    <span>Save Step</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
