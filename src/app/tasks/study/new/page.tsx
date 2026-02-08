"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function CreateStudyGoal() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [time, setTime] = useState("25");
    const [link, setLink] = useState("");
    const [motivation, setMotivation] = useState("");
    const [subTopics, setSubTopics] = useState(["", ""]);
    const [loading, setLoading] = useState(false);

    const handleAddSubTopic = () => {
        setSubTopics([...subTopics, ""]);
    };

    const handleRemoveSubTopic = (index: number) => {
        const newTopics = subTopics.filter((_, i) => i !== index);
        setSubTopics(newTopics);
    };

    const handleSubTopicChange = (index: number, value: string) => {
        const newTopics = [...subTopics];
        newTopics[index] = value;
        setSubTopics(newTopics);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Combining subtopics into description for now, or we could extend the schema
            const description = `Subject: ${subject}\nTarget Focus Time: ${time}m\nMaterial: ${link}\n\nSub-topics:\n${subTopics.filter(t => t.trim()).map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nMotivation: ${motivation}`;

            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    priority: "High", // Study goals are usually high priority
                    category: "Study",
                    type: "Milestone"
                })
            });

            if (res.ok) {
                router.push("/tasks");
            }
        } catch (error) {
            console.error("Failed to save study goal:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white overflow-x-hidden min-h-screen flex flex-col">
            {/* Header */}
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
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <Link href="/settings" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-slate-200" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDOI_xYYzH4WbS5jExKBuWYoROZrnr6eTnf7BzZrT736HwaKwqocrRrO-jMfaU7nLoZri6JzfI57x40QiE37Q_b3ErTt6QYHLyQojDNarWk114sIT6_6Fp8PApBtBOpr0NyJ5VtH0_phffxDHsq_D5mGrBzUXlSKSFbew9iO2PxIkW2FlBYzxcHmsygczx7OWyc354KUJYA0X6tIvN6Fbm7WElFv_EjXS3dlwboedm5yb8Dn8uxkjdSwI8fGl8Z6dSUQmPbcyRjHLQ")' }}></div>
                </div>
            </header>

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />

                <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F0F0F]">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-8 text-slate-500">
                            <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/tasks">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                <span className="text-sm font-medium">Back to Tasks</span>
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-[#E0E0E0] dark:border-[#222] overflow-hidden">
                            <div className="p-8 md:p-10">
                                <div className="mb-10">
                                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create Study Goal</h1>
                                    <p className="text-slate-500 font-medium">Define your objectives and set up your focus session.</p>
                                </div>

                                <form className="space-y-8" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="title">Study Goal Title</label>
                                        <input
                                            className="w-full text-xl md:text-2xl font-semibold bg-slate-50 dark:bg-[#252525] border-slate-200 dark:border-[#333] rounded-xl px-4 py-4 focus:bg-white transition-all placeholder:text-slate-300 dark:text-white"
                                            id="title"
                                            placeholder="e.g., Master React Hooks"
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="subject">Subject</label>
                                            <div className="relative group">
                                                <select
                                                    className="w-full appearance-none bg-slate-50 dark:bg-[#252525] border-slate-200 dark:border-[#333] rounded-xl px-4 py-3.5 pl-11 text-sm font-medium focus:bg-white transition-all dark:text-white"
                                                    id="subject"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select a subject</option>
                                                    <option value="coding">💻 Coding</option>
                                                    <option value="science">🔬 Science</option>
                                                    <option value="languages">🗣️ Languages</option>
                                                    <option value="math">📐 Mathematics</option>
                                                    <option value="history">📚 History</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary pointer-events-none text-[20px]">category</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="time">Target Focus Time</label>
                                            <div className="relative group">
                                                <select
                                                    className="w-full appearance-none bg-slate-50 dark:bg-[#252525] border-slate-200 dark:border-[#333] rounded-xl px-4 py-3.5 pl-11 text-sm font-medium focus:bg-white transition-all dark:text-white"
                                                    id="time"
                                                    value={time}
                                                    onChange={(e) => setTime(e.target.value)}
                                                >
                                                    <option value="25">25 Minutes (Pomodoro)</option>
                                                    <option value="45">45 Minutes (Deep Focus)</option>
                                                    <option value="60">60 Minutes (Standard)</option>
                                                    <option value="90">90 Minutes (Intensive)</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary pointer-events-none text-[20px]">timer</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="link">Material Link</label>
                                        <div className="relative group">
                                            <input
                                                className="w-full bg-slate-50 dark:bg-[#252525] border-slate-200 dark:border-[#333] rounded-xl px-4 py-3.5 pl-11 text-sm focus:bg-white transition-all placeholder:text-slate-400 dark:text-white"
                                                id="link"
                                                placeholder="Paste course URL, documentation, or PDF link"
                                                type="url"
                                                value={link}
                                                onChange={(e) => setLink(e.target.value)}
                                            />
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary pointer-events-none text-[20px]">link</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                            Sub-topics / Steps
                                            <span className="text-[10px] text-slate-400 font-normal normal-case">Optional - break down your goal</span>
                                        </label>
                                        <div className="space-y-3">
                                            {subTopics.map((topic, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="size-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#2A2A2A] text-[10px] font-bold text-slate-500">{index + 1}</div>
                                                    <input
                                                        className="flex-1 bg-transparent border-b border-slate-200 dark:border-[#333] focus:border-primary focus:ring-0 py-1 text-sm transition-all dark:text-white"
                                                        placeholder={`e.g., Step ${index + 1}`}
                                                        type="text"
                                                        value={topic}
                                                        onChange={(e) => handleSubTopicChange(index, e.target.value)}
                                                    />
                                                    <button
                                                        className="text-slate-300 hover:text-red-400 transition-colors"
                                                        type="button"
                                                        onClick={() => handleRemoveSubTopic(index)}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className="flex items-center gap-2 text-primary text-xs font-bold mt-2 hover:opacity-80 transition-all"
                                                type="button"
                                                onClick={handleAddSubTopic}
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                                Add another sub-topic
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider" htmlFor="motivation">Why is this goal important?</label>
                                        <textarea
                                            className="w-full bg-slate-50 dark:bg-[#252525] border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-sm focus:bg-white transition-all min-h-[100px] placeholder:text-slate-400 dark:text-white"
                                            id="motivation"
                                            placeholder="Explain your motivation..."
                                            value={motivation}
                                            onChange={(e) => setMotivation(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-[#222]">
                                        <button
                                            className="w-full sm:w-auto px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-[#252525] rounded-xl transition-all"
                                            type="button"
                                            onClick={() => router.push("/tasks")}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="w-full sm:w-auto px-10 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? "Adding..." : "Add to Study Plan"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-6 opacity-50">
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                Encrypted Data
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className="material-symbols-outlined text-[16px]">cloud_done</span>
                                Auto-saving
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
