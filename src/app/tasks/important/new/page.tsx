"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddImportantEvent() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("09:00");
    const [priority, setPriority] = useState("High");
    const [type, setType] = useState("Meeting");
    const [location, setLocation] = useState("");
    const [reminder, setReminder] = useState(true);
    const [reminderTime, setReminderTime] = useState("1 hour before");

    const eventTypes = [
        { name: "Meeting", icon: "groups" },
        { name: "Finance", icon: "payments" },
        { name: "Life", icon: "stars" },
        { name: "Urgent", icon: "report" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    date,
                    time,
                    priority,
                    type,
                    location,
                    category: "Important" // Specific category for filtering
                })
            });
            if (res.ok) {
                router.push("/tasks");
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white overflow-x-hidden min-h-screen flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#1A1A1A] px-6 py-3 sticky top-0 z-40">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-inherit no-underline">
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
                    <div className="hidden md:flex items-center bg-[#F0F0F0] dark:bg-[#2A2A2A] rounded-lg px-3 py-1.5 w-64">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                        <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400" placeholder="Global search..." type="text" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <Link href="/settings" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-slate-200" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDOI_xYYzH4WbS5jExKBuWYoROZrnr6eTnf7BzZrT736HwaKwqocrRrO-jMfaU7nLoZri6JzfI57x40QiE37Q_b3ErTt6QYHLyQojDNarWk114sIT6_6Fp8PApBtBOpr0NyJ5VtH0_phffxDHsq_D5mGrBzUXlSKSFbew9iO2PxIkW2FlBYzxcHmsygczx7OWyc354KUJYA0X6tIvN6Fbm7WElFv_EjXS3dlwboedm5yb8Dn8uxkjdSwI8fGl8Z6dSUQmPbcyRjHLQ")' }}></div>
                </div>
            </header>

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <aside className="hidden lg:flex w-64 flex-col border-r border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#1A1A1A] p-6 h-[calc(100vh-61px)] sticky top-[61px]">
                    <div className="flex flex-col gap-8 h-full">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-cover bg-center border border-slate-100" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMAY1xUCzEGLbqSKkHajC8_NN33sGSY-kIfnb9cIPCpetWqJBDXBOi1ADv1-uX0pwczrI1aSqB8uA2XXHEG_gTN5Piz5v5PtgVQQjWHcIWXO1KMxNmgAZd1lD4ALgyyNqT5m0KeP5CDakDn3JkA6KZEmQVIOPW_36ndVyHAE-o2SH5Kl6PRCO5gg-F12ts73P3KlYa6Inf-IWeTvnOgHrfhSNKhePuSn9h1UA99EInqJU5QczGQFFWH5nBoYDpDVvzuurY3P6-g7E")' }}></div>
                            <div>
                                <p className="text-sm font-semibold">John Doe</p>
                                <p className="text-xs text-slate-400">Personal Account</p>
                            </div>
                        </div>
                        <nav className="flex flex-col gap-1">
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all" href="/dashboard">
                                <span className="material-symbols-outlined">dashboard</span>
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-bold transition-all" href="/tasks">
                                <span className="material-symbols-outlined">assignment</span>
                                <span className="text-sm font-medium">My Tasks</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all" href="/routine">
                                <span className="material-symbols-outlined">schedule</span>
                                <span className="text-sm font-medium">Daily Routine</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all" href="/habits">
                                <span className="material-symbols-outlined">calendar_today</span>
                                <span className="text-sm font-medium">Habits</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all" href="/analytics">
                                <span className="material-symbols-outlined">monitoring</span>
                                <span className="text-sm font-medium">Analytics</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all mt-4" href="/settings">
                                <span className="material-symbols-outlined">settings</span>
                                <span className="text-sm font-medium">Settings</span>
                            </Link>
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <Link href="/tasks" className="p-2 hover:bg-white dark:hover:bg-[#1A1A1A] rounded-full transition-all text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Add Important Event</h1>
                                <p className="text-slate-500 text-sm font-medium">Schedule high-priority deadlines and key life milestones</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#222] shadow-sm overflow-hidden">
                            <form className="p-8 flex flex-col gap-8" onSubmit={handleSubmit}>
                                {/* Event Title */}
                                <div className="flex flex-col gap-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Event Title</label>
                                    <input
                                        className="w-full border-slate-200 dark:border-[#2A2A2A] dark:bg-[#222] rounded-xl px-4 py-3.5 focus:ring-primary focus:border-primary text-lg font-medium placeholder:text-slate-400"
                                        placeholder="e.g. Meeting with Team, EMI Due Date"
                                        required
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Deadline Date</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">event</span>
                                            <input
                                                className="w-full border-primary/30 bg-primary/5 dark:border-[#2A2A2A] dark:bg-[#222] rounded-xl pl-10 pr-4 py-3 focus:ring-primary focus:border-primary font-semibold"
                                                type="date"
                                                required
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Deadline Time</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">schedule</span>
                                            <input
                                                className="w-full border-slate-200 dark:border-[#2A2A2A] dark:bg-[#222] rounded-xl pl-10 pr-4 py-3 focus:ring-primary focus:border-primary font-semibold"
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="flex flex-col gap-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Priority Level</label>
                                    <div className="flex gap-4">
                                        {["High", "Medium", "Low"].map((level) => (
                                            <button
                                                key={level}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${priority === level
                                                    ? level === "High" ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20"
                                                        : level === "Medium" ? "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20"
                                                            : "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                                                    : "border-slate-100 dark:border-[#2A2A2A] text-slate-500 hover:bg-slate-50 dark:hover:bg-[#222]"
                                                    }`}
                                                type="button"
                                                onClick={() => setPriority(level)}
                                            >
                                                <span className={`size-2.5 rounded-full ${level === "High" ? "bg-red-500" : level === "Medium" ? "bg-yellow-400" : "bg-blue-400"
                                                    }`}></span>
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Event Type */}
                                <div className="flex flex-col gap-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Event Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {eventTypes.map((et) => (
                                            <button
                                                key={et.name}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${type === et.name
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-100 dark:border-[#2A2A2A] text-slate-400 hover:border-slate-200 hover:text-slate-600 dark:hover:text-slate-300"
                                                    }`}
                                                type="button"
                                                onClick={() => setType(et.name)}
                                            >
                                                <span className="material-symbols-outlined">{et.icon}</span>
                                                <span className="text-xs font-bold uppercase">{et.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Location or Meeting Link</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                                        <input
                                            className="w-full border-slate-200 dark:border-[#2A2A2A] dark:bg-[#222] rounded-xl pl-10 pr-4 py-3 focus:ring-primary focus:border-primary placeholder:text-slate-400"
                                            placeholder="Physical address or Zoom/Meet link"
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Reminder */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#222] rounded-xl border border-slate-100 dark:border-[#2A2A2A]">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Reminder Notification</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <select
                                                className="text-xs border-none bg-transparent p-0 font-medium text-primary focus:ring-0 cursor-pointer"
                                                value={reminderTime}
                                                onChange={(e) => setReminderTime(e.target.value)}
                                            >
                                                <option>1 hour before</option>
                                                <option>1 day before</option>
                                                <option>15 minutes before</option>
                                                <option>At time of event</option>
                                            </select>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={reminder}
                                            onChange={(e) => setReminder(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-[#222]">
                                    <Link href="/tasks" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-[#222] transition-all">Cancel</Link>
                                    <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all" type="submit">
                                        Add to Important
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
