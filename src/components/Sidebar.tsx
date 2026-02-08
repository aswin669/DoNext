"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Tasks", href: "/tasks", icon: "assignment", submenu: [
        { label: "Active Tasks", href: "/tasks" },
        { label: "Completed Tasks", href: "/tasks/completed" }
    ]},
    { label: "Daily Routine", href: "/routine", icon: "schedule" },
    { label: "Habits", href: "/habits", icon: "calendar_today" },
    { label: "Trading", href: "/trading", icon: "trending_up" },
    { label: "Analytics", href: "/analytics", icon: "monitoring" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string, email: string, profilePicture?: string } | null>(null);
    const [mounted] = useState(true);

    useEffect(() => {
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
                            {NAV_ITEMS.map((item: { href: string; icon: string; label: string; submenu?: Array<{ href: string; label: string }> }) => {
                                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                const hasSubmenu = item.submenu && item.submenu.length > 0;
                                const showSubmenu = hasSubmenu && (pathname.startsWith(item.href));
                                
                                return (
                                    <div key={item.href}>
                                        <Link
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
                                        {showSubmenu && hasSubmenu && (
                                            <div className="ml-6 mt-1 flex flex-col gap-1">
                                                {item.submenu?.map((subitem: { href: string; label: string }) => (
                                                    <Link
                                                        key={subitem.href}
                                                        href={subitem.href}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                                                            pathname === subitem.href
                                                                ? "bg-primary/10 text-primary font-bold"
                                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        }`}
                                                    >
                                                        <span className="w-1 h-1 rounded-full bg-current"></span>
                                                        {subitem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
