"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewHabit() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Health");
    const [frequency, setFrequency] = useState("Daily");
    const [emoji, setEmoji] = useState("🧘");
    const [goalValue, setGoalValue] = useState("10");
    const [goalUnit, setGoalUnit] = useState("minutes");
    const [reminderTime, setReminderTime] = useState("08:00");
    const [motivation, setMotivation] = useState("");

    const categories = [
        { name: "Health", color: "emerald", icon: "🧘" },
        { name: "Work", color: "blue", icon: "💻" },
        { name: "Mindset", color: "purple", icon: "🧠" },
        { name: "Personal", color: "orange", icon: "📖" },
        { name: "Other", color: "slate", icon: "✨" },
    ];

    const frequencies = ["Daily", "Weekly", "Specific Days"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/habits", {
                method: "POST",
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
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            {/* Header */}
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
                    <Link href="/notifications" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                    </Link>
                    <Link href="/settings" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </div>
            </header>

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-background-light dark:bg-background-dark">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <Link className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-semibold mb-2" href="/habits">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Habits
                            </Link>
                            <h1 className="text-3xl font-black tracking-tight">Create New Habit</h1>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm overflow-hidden">
                            <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Habit Name</label>
                                    <div className="flex gap-3">
                                        <button
                                            className="flex-shrink-0 size-12 flex items-center justify-center text-2xl bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] rounded-xl border border-slate-200 dark:border-[#333] transition-colors"
                                            type="button"
                                        >
                                            {emoji}
                                        </button>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] dark:text-white px-4 text-base font-medium placeholder:text-slate-400 focus:border-primary focus:ring-primary h-12"
                                            placeholder="e.g. Morning Meditation"
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
                                                onClick={() => {
                                                    setCategory(cat.name);
                                                    setEmoji(cat.icon);
                                                }}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${category === cat.name
                                                    ? `ring-2 ring-offset-2 ring-primary border-transparent bg-primary text-white`
                                                    : `border-slate-100 bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:border-slate-500/20`
                                                    }`}
                                                type="button"
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {frequencies.map((freq) => (
                                            <button
                                                key={freq}
                                                onClick={() => setFrequency(freq)}
                                                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${frequency === freq
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-200 dark:border-[#333] text-slate-500 dark:text-slate-400 hover:border-primary"
                                                    }`}
                                                type="button"
                                            >
                                                {freq}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Daily Goal</label>
                                        <div className="flex">
                                            <input
                                                className="block w-20 rounded-l-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] dark:text-white px-4 focus:border-primary focus:ring-primary h-12"
                                                placeholder="10"
                                                required
                                                type="number"
                                                value={goalValue}
                                                onChange={(e) => setGoalValue(e.target.value)}
                                            />
                                            <select
                                                className="block w-full rounded-r-xl border-l-0 border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] dark:text-white px-4 focus:border-primary focus:ring-primary h-12 text-sm font-medium appearance-none"
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
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Reminder Time</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">schedule</span>
                                            <input
                                                className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] dark:text-white pl-12 pr-4 focus:border-primary focus:ring-primary h-12"
                                                type="time"
                                                value={reminderTime}
                                                onChange={(e) => setReminderTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Motivation / "Why"</label>
                                    <textarea
                                        className="block w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] dark:text-white px-4 py-3 focus:border-primary focus:ring-primary text-sm font-medium placeholder:text-slate-400"
                                        placeholder="I want to feel more grounded and present throughout the day..."
                                        rows={3}
                                        value={motivation}
                                        onChange={(e) => setMotivation(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-[#222]">
                                    <Link href="/habits" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all">Cancel</Link>
                                    <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all" type="submit">Create Habit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
