"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface SearchResult {
    id: string;
    title: string;
    type: 'Task' | 'Habit' | 'Routine';
    category?: string;
    href: string;
}

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    if (loading) {
        return <div className="p-8 text-center">Searching for &quot;{query}&quot;...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Search Results</h1>
                <p className="text-slate-500">Found {results.length} items for &quot;{query}&quot;</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {results.length > 0 ? results.map((item) => (
                    <Link
                        key={`${item.type}-${item.id}`}
                        href={item.href}
                        className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-slate-200 dark:border-[#222] shadow-sm flex items-center justify-between hover:border-primary/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-full flex items-center justify-center ${item.type === 'Task' ? 'bg-blue-100 text-blue-500' :
                                    item.type === 'Habit' ? 'bg-emerald-100 text-emerald-500' : 'bg-purple-100 text-purple-500'
                                }`}>
                                <span className="material-symbols-outlined text-[20px]">
                                    {item.type === 'Task' ? 'assignment' : item.type === 'Habit' ? 'calendar_today' : 'schedule'}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{item.title}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black uppercase text-slate-400">{item.type}</span>
                                    <span className="text-[10px] text-slate-300">•</span>
                                    <span className="text-[10px] font-bold text-slate-400">{item.category}</span>
                                </div>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                    </Link>
                )) : (
                    <div className="bg-slate-50 dark:bg-[#1A1A1A] border-2 border-dashed border-slate-200 dark:border-[#222] rounded-3xl p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">search_off</span>
                        <h3 className="text-lg font-bold">No results found</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">We couldn&apos;t find anything matching your search. Try different keywords or check your spelling.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchResults() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
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
            </header>

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Suspense fallback={<div>Loading search...</div>}>
                        <SearchResultsContent />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
