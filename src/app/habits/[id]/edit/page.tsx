"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function EditHabit() {
    const { id } = useParams();
    const router = useRouter();
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Health");
    const [frequency, setFrequency] = useState("Daily");
    const [emoji, setEmoji] = useState("🧘");
    const [goalValue, setGoalValue] = useState("10");
    const [goalUnit, setGoalUnit] = useState("minutes");
    const [reminderTime, setReminderTime] = useState("08:00");
    const [motivation, setMotivation] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const categories = [
        { name: "Health", color: "emerald", icon: "🧘" },
        { name: "Work", color: "blue", icon: "💻" },
        { name: "Mindset", color: "purple", icon: "🧠" },
        { name: "Personal", color: "orange", icon: "📖" },
        { name: "Other", color: "slate", icon: "✨" },
    ];

    const frequencies = ["Daily", "Weekly", "Specific Days"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/habits");
                if (res.ok) {
                    const data = await res.json();
                    const found = data.find((h: any) => h.id === id);
                    if (found) {
                        setName(found.name);
                        setCategory(found.category);
                        setFrequency(found.frequency);
                        setEmoji(found.icon);
                        setGoalValue(found.goalValue.toString());
                        setGoalUnit(found.goalUnit);
                        setReminderTime(found.reminderTime);
                        setMotivation(found.motivation || "");
                    } else {
                        router.push("/habits");
                    }
                }
            } catch (error) {
                console.error("Fetch error:", error);
                router.push("/habits");
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
            const res = await fetch(`/api/habits/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    icon: emoji,
                    category,
                    frequency,
                    goalValue,
                    goalUnit,
                    reminderTime,
                    motivation
                })
            });
            if (res.ok) {
                router.push("/habits");
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
                            <Link className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-semibold mb-2" href="/habits">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Habits
                            </Link>
                            <h1 className="text-3xl font-black tracking-tight">Edit Habit</h1>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm">
                            <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Habit Name</label>
                                    <div className="flex gap-3">
                                        <button
                                            className="flex-shrink-0 size-12 flex items-center justify-center text-2xl bg-slate-100 dark:bg-[#2A2A2A] rounded-xl border border-slate-200"
                                            type="button"
                                        >
                                            {emoji}
                                        </button>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 h-12 font-medium focus:border-primary focus:ring-primary"
                                            required
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.name}
                                                type="button"
                                                onClick={() => {
                                                    setCategory(cat.name);
                                                    setEmoji(cat.icon);
                                                }}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${category === cat.name
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Daily Goal</label>
                                        <div className="flex">
                                            <input
                                                className="w-20 rounded-l-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 h-12 font-bold focus:border-primary focus:ring-primary"
                                                type="number"
                                                value={goalValue}
                                                onChange={(e) => setGoalValue(e.target.value)}
                                            />
                                            <select
                                                className="flex-1 rounded-r-xl border-l-0 border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 h-12 font-medium focus:border-primary focus:ring-primary"
                                                value={goalUnit}
                                                onChange={(e) => setGoalUnit(e.target.value)}
                                            >
                                                <option>minutes</option>
                                                <option>hours</option>
                                                <option>glass</option>
                                                <option>times</option>
                                                <option>steps</option>
                                                <option>pages</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Reminder</label>
                                        <input
                                            className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 h-12 font-bold focus:border-primary focus:ring-primary"
                                            type="time"
                                            value={reminderTime}
                                            onChange={(e) => setReminderTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Motivation</label>
                                    <textarea
                                        className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3 font-medium focus:border-primary focus:ring-primary"
                                        rows={3}
                                        value={motivation}
                                        onChange={(e) => setMotivation(e.target.value)}
                                    />
                                </div>

                                <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-[#222]">
                                    <Link href="/habits" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all">Cancel</Link>
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

