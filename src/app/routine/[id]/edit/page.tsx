"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function EditRoutineStep() {
    const { id } = useParams();
    const router = useRouter();
    const [task, setTask] = useState("");
    const [time, setTime] = useState("08:00");
    const [category, setCategory] = useState("Health");
    const [icon, setIcon] = useState("✨");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const categories = [
        { name: "Health", icon: "🧘" },
        { name: "Work", icon: "💻" },
        { name: "Personal", icon: "📖" },
        { name: "Nutrition", icon: "🥗" },
        { name: "Mindset", icon: "🧠" },
        { name: "Other", icon: "✨" }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/routine");
                if (res.ok) {
                    const data = await res.json();
                    const found = data.find((item: any) => item.id === id);
                    if (found) {
                        setTask(found.task);
                        setTime(found.time);
                        setCategory(found.category);
                        setIcon(found.icon);
                    } else {
                        router.push("/routine");
                    }
                }
            } catch (error) {
                console.error("Fetch error:", error);
                router.push("/routine");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/routine/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task, time, category, icon })
            });
            if (res.ok) {
                router.push("/routine");
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
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
            </header>

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <Link className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-semibold mb-2" href="/routine">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Routine
                            </Link>
                            <h1 className="text-3xl font-black tracking-tight">Edit Routine Step</h1>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm">
                            <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Step Description</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="flex-shrink-0 size-12 flex items-center justify-center text-2xl bg-slate-100 dark:bg-[#2A2A2A] rounded-xl border border-slate-200 dark:border-[#333]"
                                        >
                                            {icon}
                                        </button>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 h-12 font-medium focus:border-primary focus:ring-primary"
                                            required
                                            type="text"
                                            value={task}
                                            onChange={(e) => setTask(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Scheduled Time</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">schedule</span>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] pl-12 pr-4 h-12 font-bold focus:border-primary focus:ring-primary"
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

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
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-100 dark:border-[#222] text-slate-500 hover:border-slate-200"
                                                    }`}
                                            >
                                                <span className="text-xl">{cat.icon}</span>
                                                <span className="text-xs font-bold">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-[#222]">
                                    <Link href="/routine" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all">Cancel</Link>
                                    <button
                                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                                        type="submit"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

