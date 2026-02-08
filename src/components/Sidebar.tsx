"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Tasks", href: "/tasks", icon: "assignment" },
    { label: "Eisenhower Matrix", href: "/tasks/eisenhower", icon: "grid_view" },
    { label: "Daily Routine", href: "/routine", icon: "schedule" },
    { label: "Habits", href: "/habits", icon: "calendar_today" },
    { label: "Habit Gamification", href: "/habits/gamification", icon: "workspace_premium" },
    { label: "Pomodoro Timer", href: "/focus/pomodoro", icon: "timer" },
    { label: "Time Blocking", href: "/focus/time-blocking", icon: "calendar_month" },
    { label: "Productivity Insights", href: "/insights/productivity", icon: "auto_awesome" },
    { label: "SMART Goals", href: "/goals/smart", icon: "flag" },
    { label: "Team Collaboration", href: "/teams/collaboration", icon: "groups" },
    { label: "Accountability Partners", href: "/accountability/partners", icon: "handshake" },
    { label: "Trading", href: "/trading", icon: "trending_up" },
    { label: "Advanced Analytics", href: "/analytics/advanced", icon: "analytics" },
    { label: "Predictive Analytics", href: "/analytics/predictive", icon: "show_chart" },
    { label: "Calendar Integration", href: "/calendar/integration", icon: "calendar_month" },
    { label: "Communication Integration", href: "/communication/integration", icon: "notifications" },
    { label: "Analytics", href: "/analytics", icon: "monitoring" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string, email: string, profilePicture?: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/settings");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Sidebar fetch user error:", error);
            }
        };
        fetchUser();
    }, []);

    return (
        <aside className="hidden lg:flex w-64 flex-col border-r border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#1A1A1A] p-6 h-[calc(100vh-61px)] sticky top-[61px]">
            <div className="flex flex-col gap-8 h-full">
                <div className="flex items-center gap-3 min-h-[40px]">
                    {mounted && user ? (
                        <>
                            <div className="size-10 rounded-full border border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.email || "account@example.com"}</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 animate-pulse w-full">
                            <div className="size-10 rounded-full bg-slate-100 dark:bg-[#222]" />
                            <div className="flex-1">
                                <div className="h-3 w-20 bg-slate-100 dark:bg-[#222] rounded mb-1" />
                                <div className="h-2 w-24 bg-slate-50 dark:bg-[#222]/50 rounded" />
                            </div>
                        </div>
                    )}
                </div>
                <nav className="flex flex-col gap-1">
                    {mounted ? (
                        <>
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined ${item.icon === "schedule" ? "text-[22px]" : ""}`}>
                                            {item.icon}
                                        </span>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            <Link
                                href="/settings"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mt-4 ${pathname === "/settings"
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                                    }`}
                            >
                                <span className="material-symbols-outlined">settings</span>
                                <span className="text-sm font-medium">Settings</span>
                            </Link>
                        </>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse">
                                    <div className="size-6 rounded bg-slate-100 dark:bg-[#222]" />
                                    <div className="h-4 w-24 bg-slate-100 dark:bg-[#222] rounded" />
                                </div>
                            ))}
                        </div>
                    )}
                </nav>
            </div>
        </aside>
    );
}
