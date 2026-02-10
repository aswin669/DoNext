"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function EditTask() {
    const { id } = useParams();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [category, setCategory] = useState("General");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await fetch(`/api/tasks/${id}`);
                if (res.ok) {
                    const task = await res.json();
                    setTitle(task.title);
                    setDescription(task.description);
                    setPriority(task.priority);
                    setCategory(task.category);
                } else {
                    router.push("/tasks");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                router.push("/tasks");
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, priority, category })
            });
            if (res.ok) {
                router.push("/tasks");
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
                            <Link className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-semibold mb-2" href="/tasks">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Tasks
                            </Link>
                            <h1 className="text-3xl font-black tracking-tight">Edit Task</h1>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm">
                            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest" htmlFor="title">Task Title</label>
                                    <input
                                        className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3 font-medium focus:border-primary focus:ring-primary"
                                        id="title"
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest" htmlFor="description">Description</label>
                                    <textarea
                                        className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3 font-medium focus:border-primary focus:ring-primary"
                                        id="description"
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest" htmlFor="priority">Priority</label>
                                        <select
                                            className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3 font-medium focus:border-primary focus:ring-primary"
                                            id="priority"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest" htmlFor="category">Category</label>
                                        <select
                                            className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3 font-medium focus:border-primary focus:ring-primary"
                                            id="category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option>General</option>
                                            <option>Important</option>
                                            <option>Study</option>
                                            <option>Work</option>
                                            <option>Personal</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-[#222]">
                                    <Link href="/tasks" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all">Cancel</Link>
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

