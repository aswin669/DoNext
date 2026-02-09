"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import PWADashboard from "@/components/PWADashboard";
import { PWAService } from "@/lib/pwa-service";

interface RoutineItem {
    id: string;
    task: string;
    time: string;
    completed: boolean;
}

interface WeeklyActivityItem {
    day: string;
    tasks: number;
    focus: number;
}

interface ImportantTask {
    id: string;
    title: string;
    description?: string;
    date?: string;
    time?: string;
}

interface LearningProgressItem {
    id: string;
    title: string;
    progress: number;
    icon?: string;
}

interface Stats {
    tasksCompleted: number;
    totalTasks: number;
    activeHabits: number;
    focusTimeToday: string;
    weeklyActivity: WeeklyActivityItem[];
    importantTasks: ImportantTask[];
    learningProgress: LearningProgressItem[];
}

export default function Dashboard() {
    const [currentDate, setCurrentDate] = useState("");
    const [greeting, setGreeting] = useState("Welcome");
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [routine, setRoutine] = useState<RoutineItem[]>([]);
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState<Stats>({
        tasksCompleted: 0,
        totalTasks: 0,
        activeHabits: 0,
        focusTimeToday: "0h 0m",
        weeklyActivity: [],
        importantTasks: [],
        learningProgress: []
    });

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user/settings");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Dashboard fetch user error:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Fetch stats error:", error);
        }
    };

    const fetchRoutine = async () => {
        try {
            const res = await fetch("/api/routine");
            if (res.ok) {
                const data = await res.json();
                setRoutine(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        setMounted(true);
        // Initialize PWA service
        PWAService.initialize();
        
        // Set initial date and greeting - Client Side Only
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', options);
        const hour = now.getHours();
        const greetingText = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
        
        setCurrentDate(dateStr);
        setGreeting(greetingText);

        fetchRoutine();
        fetchStats();
        fetchUser();
    }, []);

    return (
        <PageLayout>
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Welcome back, {user?.name?.split(' ')[0] || "there"}! 👋</h1>
                        <p className="text-slate-500 text-sm font-medium">Today is {mounted ? currentDate : "Loading..."}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-[#1A1A1A] px-4 py-2 rounded-xl border border-slate-200 dark:border-[#222] shadow-sm">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                            {mounted && greeting === "Good Morning" ? "wb_sunny" : (mounted && greeting === "Good Afternoon" ? "light_mode" : "nights_stay")}
                        </span>
                        <span>{mounted ? greeting : "Welcome"}</span>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">task_alt</span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tasks Completed</p>
                            <h3 className="text-2xl font-black">{stats.tasksCompleted}/{stats.totalTasks}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                            <span className="material-symbols-outlined text-3xl">rebase</span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Habits</p>
                            <h3 className="text-2xl font-black">{stats.activeHabits}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                            <span className="material-symbols-outlined text-3xl">timer</span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Focus Time</p>
                            <h3 className="text-2xl font-black">{stats.focusTimeToday}</h3>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Daily Routine */}
                        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold">Daily Routine</h2>
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Today</span>
                                </div>
                                <Link className="text-primary text-xs font-bold hover:underline" href="/routine">View All</Link>
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="relative size-32 flex-shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle className="text-slate-100 dark:text-[#222] stroke-current" cx="18" cy="18" fill="transparent" r="16" strokeWidth="3"></circle>
                                        <circle
                                            className="text-primary stroke-current progress-ring-circle transition-all duration-700"
                                            cx="18" cy="18" fill="transparent" r="16"
                                            strokeWidth="3"
                                            strokeDasharray="100"
                                            strokeDashoffset={100 - (routine.length > 0 ? Math.round((routine.filter(r => r.completed).length / routine.length) * 100) : 0)}
                                            strokeLinecap="round"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-black">{routine.length > 0 ? Math.round((routine.filter(r => r.completed).length / routine.length) * 100) : 0}%</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Done</span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full flex flex-col gap-3">
                                    {routine.length > 0 ? (
                                        routine.slice(0, 4).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-[#333] hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-2 rounded-full ${item.completed ? 'bg-primary' : 'bg-slate-300'}`}></div>
                                                    <span className={`text-sm font-semibold ${item.completed ? 'text-slate-400 line-through' : 'text-[#333] dark:text-gray-200'}`}>{item.task}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-xs font-medium text-slate-400">No routine steps for today.</p>
                                            <Link href="/routine/new" className="text-xs font-bold text-primary hover:underline mt-1 inline-block">Add your first step</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Weekly Activity */}
                        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-[#333] dark:text-white">Weekly Activity</h2>
                                    <p className="text-xs text-slate-400">Visualizing productivity trends</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><span className="size-2 rounded-full bg-primary"></span>Tasks</span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><span className="size-2 rounded-full bg-primary/30"></span>Focus</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between h-40 gap-2">
                                {stats.weeklyActivity.length > 0 ? stats.weeklyActivity.map((item: WeeklyActivityItem) => (
                                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full flex flex-col justify-end h-full gap-1">
                                            <div className="w-full bg-primary/30 rounded-t-sm transition-all group-hover:bg-primary/40" style={{ height: `${Math.min(item.focus * 20, 100)}%` }}></div>
                                            <div className="w-full bg-primary rounded-t-sm transition-all group-hover:brightness-110" style={{ height: `${Math.min(item.tasks * 20, 100)}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.day}</span>
                                    </div>
                                )) : (
                                    [...Array(7)].map((_, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-slate-100 dark:bg-[#222] h-full rounded-t-sm"></div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">-</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* PWA Dashboard */}
                        <PWADashboard />

                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Important */}
                        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-[#333] dark:text-white">Critical Tasks</h2>
                                <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                            </div>
                            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                                {stats.importantTasks && stats.importantTasks.length > 0 ? stats.importantTasks.map((item: ImportantTask) => {

                                    return (
                                        <Link key={item.id} href={`/tasks/${item.id}`} className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 group cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex-shrink-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Critical</span>
                                                <span className="text-[11px] font-bold text-red-600">
                                                    {item.time || (item.date ? new Date(item.date).toLocaleDateString() : 'Immediate')}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-red-900 dark:text-red-100">{item.title}</h4>
                                            <p className="text-xs text-red-700/60 dark:text-red-400/60 font-medium">{item.description || 'No description provided'}</p>
                                        </Link>
                                    );
                                }) : (
                                    <div className="py-6 text-center border-2 border-dashed border-slate-100 dark:border-[#222] rounded-xl">
                                        <p className="text-xs font-medium text-slate-400">No high-priority tasks.</p>
                                        <Link href="/tasks/important/new" className="text-[10px] font-black text-primary uppercase mt-1 inline-block hover:underline">+ Add Urgent</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Learning Progress */}
                        <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                            <h2 className="text-lg font-bold mb-5 text-[#333] dark:text-white">Learning Progress</h2>
                            <div className="flex flex-col gap-5">
                                {stats.learningProgress && stats.learningProgress.length > 0 ? (
                                    stats.learningProgress.map((item: LearningProgressItem) => (
                                        <div key={item.id}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs font-bold text-[#333] dark:text-gray-200 flex items-center gap-2">
                                                    {item.icon && <span className="text-base">{item.icon === 'school' ? '🎓' : item.icon}</span>}
                                                    {item.title}
                                                </span>
                                                <span className={`text-xs font-bold ${item.progress >= 80 ? 'text-primary' : 'text-blue-500'}`}>{item.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${item.progress >= 80 ? 'bg-primary' : 'bg-blue-500'}`}
                                                    style={{ width: `${item.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-slate-400 text-xs italic">
                                        No study habits or tasks found.
                                    </div>
                                )}
                                <Link href="/habits" className="mt-2 w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl text-xs font-bold text-slate-400 hover:text-primary hover:border-primary transition-all flex items-center justify-center">
                                    + Add Study Goal
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
