"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState("");
    const [mounted, setMounted] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/settings");
                if (res.ok) {
                    const data = await res.json();
                    setProfilePicture(data.profilePicture || "");
                }
            } catch (error) {
                console.error("Fetch user error:", error);
            }
        };
        fetchUser();
    }, []);

    const toggleDarkMode = async () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);

        // Persist to database
        try {
            await fetch("/api/user/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                router.push("/auth/login");
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
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
                <SearchBar />
            </div>
            <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {mounted && theme === "dark" ? (
                        <span className="material-symbols-outlined text-[24px]">light_mode</span>
                    ) : (
                        <span className="material-symbols-outlined text-[24px]">dark_mode</span>
                    )}
                </button>

                <Link href="/notifications" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors relative">
                    <span className="material-symbols-outlined text-[24px]">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Link>
                <Link href="/settings" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[24px]">settings</span>
                </Link>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="rounded-full size-9 border border-slate-200 flex items-center justify-center hover:border-primary/50 transition-all overflow-hidden"
                    >
                        {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-[20px] text-slate-400">person</span>
                        )}
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-xl border border-slate-100 dark:border-[#222] py-2 z-50 animate-in fade-in zoom-in duration-200">
                            <Link
                                href="/settings"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="material-symbols-outlined text-[18px]">person</span>
                                Profile Settings
                            </Link>
                            <div className="h-px bg-slate-100 dark:bg-[#222] my-1"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
