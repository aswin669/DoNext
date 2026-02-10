"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

interface HabitCompletion {
    id: string;
    date: string;
}

interface Habit {
    id: string;
    name: string;
    icon: string;
    completions: HabitCompletion[];
}

export default function Habits() {
    const [habitsData, setHabitsData] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonthName, setCurrentMonthName] = useState("");
    const [daysInMonth, setDaysInMonth] = useState<number[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activeDay, setActiveDay] = useState<number | null>(null);

    useEffect(() => {
        const date = new Date();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        setCurrentMonthName(`${month} ${year}`);

        const numDays = new Date(year, date.getMonth() + 1, 0).getDate();
        setDaysInMonth(Array.from({ length: numDays }, (_, i) => i + 1));

        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await fetch("/api/habits");
            if (res.ok) {
                const data = await res.json();
                setHabitsData(data);
            }
        } catch (error) {
            console.error("Fetch habits error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleHabit = async (habitId: string, day: number) => {
        const date = new Date();
        date.setDate(day);
        const dateStr = date.toISOString().split('T')[0];

        try {
            // Optimistic UI update could be added here
            const res = await fetch(`/api/habits/toggle/${habitId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: dateStr })
            });

            if (res.ok) {
                fetchHabits(); // Refresh data
            }
        } catch (error) {
            console.error("Toggle habit error:", error);
        }
    };

    const deleteHabit = async (habitId: string) => {
        if (!confirm("Are you sure you want to delete this habit and all its completions?")) return;
        try {
            const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
            if (res.ok) {
                setHabitsData(prev => prev.filter(h => h.id !== habitId));
            }
        } catch (error) {
            console.error("Delete habit error:", error);
        }
    };

    const isDone = (habit: Habit, day: number) => {
        return habit.completions.some(c => {
            const d = new Date(c.date);
            return d.getDate() === day && d.getMonth() === new Date().getMonth();
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <PageLayout>
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black tracking-tight">{currentMonthName}</h1>
                        <div className="flex bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#222] rounded-xl p-1 shadow-sm">
                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-all text-slate-400"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-all text-slate-400"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                        </div>
                    </div>
                    <Link href="/habits/new" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        <span>Create New Habit</span>
                    </Link>
                </div>

                {/* Habit Grid */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-200 dark:border-[#222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 dark:border-[#222] flex items-center justify-between">
                        <h2 className="font-bold">Habit Tracker Heatmap</h2>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase font-bold">
                                <span className="size-3 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-white text-[10px]">check</span></span> Done
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase font-bold">
                                <span className="size-3 rounded-full border border-slate-300"></span> Open
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-max">
                            <div className="grid grid-cols-[240px_repeat(31,48px)]">
                                {/* Grid Header */}
                                <div className="sticky left-0 bg-slate-50 dark:bg-[#1F1F1F] p-4 font-bold text-xs text-slate-500 uppercase border-r border-slate-100 dark:border-[#333] border-b z-30 flex items-center">
                                    Habit Name
                                </div>
                                {daysInMonth.map((day) => {
                                    const isActive = day === activeDay;
                                    return (
                                        <div key={day} className={`h-12 flex items-center justify-center text-[10px] font-bold text-slate-400 border-r border-slate-100 dark:border-[#333] border-b ${isActive ? 'bg-primary/5 dark:bg-primary/10 !text-primary border-b-2 border-b-primary shadow-inner' : ''}`}>
                                            {day}
                                        </div>
                                    );
                                })}

                                {/* Habit Rows */}
                                {habitsData.length > 0 ? habitsData.map((habit) => (
                                    <div key={habit.id} className="contents">
                                        <div className="sticky left-0 bg-white dark:bg-[#1A1A1A] p-4 flex items-center justify-between text-sm font-semibold border-r border-slate-100 dark:border-[#333] border-b z-30 shadow-[4px_0_8px_rgba(0,0,0,0.02)] group">
                                            <div className="flex items-center gap-3 truncate">
                                                <span className="text-xl">{habit.icon}</span> 
                                                <span className="truncate">{habit.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <Link 
                                                    href={`/habits/${habit.id}/edit`}
                                                    className="size-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                </Link>
                                                <button 
                                                    onClick={() => deleteHabit(habit.id)}
                                                    className="size-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        {daysInMonth.map((day) => {
                                            const done = isDone(habit, day);
                                            const isActive = day === activeDay;
                                            return (
                                                <div key={day} className={`h-16 flex items-center justify-center border-r border-slate-100 dark:border-[#333] border-b ${isActive ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                                    <div
                                                        onClick={() => toggleHabit(habit.id, day)}
                                                        className={`size-7 rounded-full cursor-pointer flex items-center justify-center transition-all ${done ? 'bg-primary text-white shadow-md scale-110' : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                                                    >
                                                        {done && <span className="material-symbols-outlined text-[18px] font-black">check</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )) : (
                                    <div className="col-span-full p-12 text-center">
                                        <p className="text-slate-400 font-medium">No habits trackable for this month yet.</p>
                                        <Link href="/habits/new" className="text-primary font-bold hover:underline mt-2 inline-block">Start by creating a habit</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habitsData.slice(0, 3).map((habit) => {
                        const count = habit.completions.length;
                        const percent = Math.round((count / daysInMonth.length) * 100);
                        return (
                            <div key={habit.id} className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-slate-200 dark:border-[#222] shadow-sm relative group">
                                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link 
                                        href={`/habits/${habit.id}/edit`}
                                        className="size-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100 dark:border-[#333]"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </Link>
                                    <button 
                                        onClick={() => deleteHabit(habit.id)}
                                        className="size-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-100 dark:border-[#333]"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                                        {habit.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{habit.name}</h3>
                                        <p className="text-xs text-slate-400 uppercase font-black">{count} Days Completed</p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-700" style={{ width: `${percent}%` }}></div>
                                </div>
                                <p className="mt-2 text-right text-[10px] font-bold text-primary">{percent}% Efficiency</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </PageLayout>
    );
}
