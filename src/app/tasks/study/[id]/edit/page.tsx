"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function EditStudyGoal() {
    const { id } = useParams();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [time, setTime] = useState("25");
    const [link, setLink] = useState("");
    const [motivation, setMotivation] = useState("");
    const [subTopics, setSubTopics] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await fetch(`/api/tasks/${id}`);
                if (res.ok) {
                    const task = await res.json();
                    setTitle(task.title);
                    
                    // Parse description
                    const desc = task.description || "";
                    const subjectMatch = desc.match(/Subject: (.*)\n/);
                    const timeMatch = desc.match(/Target Focus Time: (\d+)m/);
                    const linkMatch = desc.match(/Material: (.*)\n/);
                    const motivationMatch = desc.match(/\n\nMotivation: (.*)$/);
                    
                    if (subjectMatch) setSubject(subjectMatch[1]);
                    if (timeMatch) setTime(timeMatch[1]);
                    if (linkMatch) setLink(linkMatch[1]);
                    if (motivationMatch) setMotivation(motivationMatch[1]);

                    const parts = desc.split(/Sub[- ]?topics:?\s*/i);
                    if (parts[1]) {
                        const sPart = parts[1].split(/\n\nMotivation:/)[0] || "";
                        const ts = sPart.split(/\n/).map((s: string) => s.trim().replace(/^\d+\.\s*/, "")).filter(Boolean);
                        setSubTopics(ts);
                    } else {
                        setSubTopics(["", ""]);
                    }
                } else {
                    router.push("/tasks");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                router.push("/tasks");
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [id, router]);

    const handleAddSubTopic = () => {
        setSubTopics([...subTopics, ""]);
    };

    const handleRemoveSubTopic = (index: number) => {
        setSubTopics(subTopics.filter((_, i) => i !== index));
    };

    const handleSubTopicChange = (index: number, value: string) => {
        const newTopics = [...subTopics];
        newTopics[index] = value;
        setSubTopics(newTopics);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const description = `Subject: ${subject}\nTarget Focus Time: ${time}m\nMaterial: ${link}\n\nSub-topics:\n${subTopics.filter(t => t.trim()).map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nMotivation: ${motivation}`;
            
            const res = await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, category: "Study", priority: "High" })
            });
            if (res.ok) {
                router.push("/tasks");
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <header className="flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#222] bg-white dark:bg-[#1A1A1A] px-6 py-3 sticky top-0 z-40">
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
            </header>

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-8 text-slate-500">
                            <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/tasks">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                <span className="text-sm font-medium">Back to Tasks</span>
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#222] shadow-sm">
                            <div className="p-8 md:p-10">
                                <h1 className="text-3xl font-black tracking-tight mb-8">Edit Study Goal</h1>
                                <form className="space-y-8" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Goal Title</label>
                                        <input
                                            className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-4 text-xl font-bold focus:border-primary focus:ring-primary"
                                            required
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Subject</label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3.5 focus:border-primary focus:ring-primary"
                                                required
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="coding">💻 Coding</option>
                                                <option value="science">🔬 Science</option>
                                                <option value="languages">🗣️ Languages</option>
                                                <option value="math">📐 Mathematics</option>
                                                <option value="history">📚 History</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Focus Time (min)</label>
                                            <select
                                                className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3.5 focus:border-primary focus:ring-primary"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                            >
                                                <option value="25">25</option>
                                                <option value="45">45</option>
                                                <option value="60">60</option>
                                                <option value="90">90</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Material Link</label>
                                        <input
                                            className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3.5 focus:border-primary focus:ring-primary"
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sub-topics</label>
                                        <div className="space-y-3">
                                            {subTopics.map((topic, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-slate-400 w-4">{index + 1}.</span>
                                                    <input
                                                        className="flex-1 bg-transparent border-b border-slate-200 dark:border-[#333] py-2 focus:border-primary focus:ring-0"
                                                        type="text"
                                                        value={topic}
                                                        onChange={(e) => handleSubTopicChange(index, e.target.value)}
                                                    />
                                                    <button type="button" onClick={() => handleRemoveSubTopic(index)} className="text-slate-300 hover:text-red-500">
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={handleAddSubTopic} className="text-primary text-xs font-bold flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                                Add Sub-topic
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Motivation</label>
                                        <textarea
                                            className="w-full rounded-xl border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-4 py-3 focus:border-primary focus:ring-primary"
                                            rows={3}
                                            value={motivation}
                                            onChange={(e) => setMotivation(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-[#222]">
                                        <Link href="/tasks" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all">Cancel</Link>
                                        <button
                                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                                            type="submit"
                                            disabled={saving}
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

