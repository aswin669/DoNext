"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

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
        <PageLayout>
            <Suspense fallback={<div>Loading search...</div>}>
                <SearchResultsContent />
            </Suspense>
        </PageLayout>
    );
}
