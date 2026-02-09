"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";

interface PageLayoutProps {
    children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col relative" suppressHydrationWarning>
            <Header isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
            <div className="flex flex-1 w-full overflow-hidden">
                {/* Sidebar - Desktop only */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>
                
                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                    {children}
                </main>
            </div>

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileNavOpen(false)}
                />
                <nav className={`absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#1A1A1A] border-r border-[#E0E0E0] dark:border-[#222] overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-out ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
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
                                <h2 className="text-xl font-bold tracking-tight">DoNext</h2>
                            </div>
                            <button 
                                onClick={() => setIsMobileNavOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <Sidebar onClose={() => setIsMobileNavOpen(false)} />
                    </div>
                </nav>
            </div>
        </div>
    );
}
