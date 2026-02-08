"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ placeholder = "Global search..." }: { placeholder?: string }) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-[#F0F0F0] dark:bg-[#2A2A2A] rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-primary/30 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
            <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
                placeholder={placeholder}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="hidden">Search</button>
        </form>
    );
}
