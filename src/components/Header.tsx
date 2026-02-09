"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

interface HeaderProps {
    isMobileNavOpen?: boolean;
    setIsMobileNavOpen?: (open: boolean) => void;
}

export default function Header({ isMobileNavOpen, setIsMobileNavOpen }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState("");
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
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
        <header className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#1A1A1A] px-4 md:px-6 py-3 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle - Rendered immediately for better UX */}
                <button
                    onClick={() => setIsMobileNavOpen?.(!isMobileNavOpen)}
                    style={{ backgroundColor: "#8BC34A" }}
                    className="lg:hidden flex-shrink-0 flex w-10 h-10 items-center justify-center text-white rounded-xl shadow-lg z-50 cursor-pointer"
                    aria-label="Toggle Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="size-10 flex-shrink-0">
                        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            {/* Rounded background */}
                            <rect x="32" y="32" width="448" height="448" rx="96" fill="#8BC34A"/>
                            
                            {/* Paper */}
                            <rect x="128" y="96" width="256" height="320" rx="32" fill="#FFFFFF"/>
                            
                            {/* Checklist lines */}
                            <rect x="200" y="150" width="120" height="14" rx="7" fill="#8BC34A" opacity="0.4"/>
                            <rect x="200" y="220" width="120" height="14" rx="7" fill="#8BC34A" opacity="0.4"/>
                            <rect x="200" y="290" width="120" height="14" rx="7" fill="#8BC34A" opacity="0.4"/>
                            
                            {/* Checkmarks */}
                            <path d="M156 160 L174 178 L204 144" stroke="#8BC34A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M156 230 L174 248 L204 214" stroke="#8BC34A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M156 300 L174 318 L204 284" stroke="#8BC34A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h2 className="text-xl font-black tracking-tight hidden sm:block">DoNext</h2>
                </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
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
                
                <Link href="/settings" className="hidden sm:flex p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[24px]">settings</span>
                </Link>

                <div className="relative" ref={menuRef}>
                    {!mounted ? (
                        <div className="size-9 rounded-full bg-slate-100 dark:bg-[#222] animate-pulse" />
                    ) : (
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
                    )}

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
