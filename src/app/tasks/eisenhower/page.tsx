"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { EisenhowerMatrixQuadrant } from "@/types";

export default function EisenhowerMatrixPage() {
    const [matrix, setMatrix] = useState<EisenhowerMatrixQuadrant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMatrixData();
    }, []);

    const fetchMatrixData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/tasks/eisenhower");
            if (res.ok) {
                const data = await res.json();
                setMatrix(data.matrix);
                setError("");
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to load matrix data");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getQuadrantInfo = (quadrant: string) => {
        switch (quadrant) {
            case 'urgent_important':
                return {
                    title: "Do First",
                    description: "Urgent and Important",
                    color: "bg-red-500",
                    borderColor: "border-red-500",
                    textColor: "text-red-700"
                };
            case 'not_urgent_important':
                return {
                    title: "Schedule",
                    description: "Important but Not Urgent",
                    color: "bg-blue-500",
                    borderColor: "border-blue-500",
                    textColor: "text-blue-700"
                };
            case 'urgent_not_important':
                return {
                    title: "Delegate",
                    description: "Urgent but Not Important",
                    color: "bg-yellow-500",
                    borderColor: "border-yellow-500",
                    textColor: "text-yellow-700"
                };
            case 'not_urgent_not_important':
                return {
                    title: "Eliminate",
                    description: "Neither Urgent nor Important",
                    color: "bg-gray-500",
                    borderColor: "border-gray-500",
                    textColor: "text-gray-700"
                };
            default:
                return {
                    title: "Unknown",
                    description: "",
                    color: "bg-gray-500",
                    borderColor: "border-gray-500",
                    textColor: "text-gray-700"
                };
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'High':
                return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">HIGH</span>;
            case 'Medium':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">MEDIUM</span>;
            case 'Low':
                return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">LOW</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">UNKNOWN</span>;
        }
    };

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
                <Header />
                <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                    <Sidebar />
                    <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <span className="ml-3 text-lg">Loading Eisenhower Matrix...</span>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Eisenhower Matrix</h1>
                            <p className="text-slate-500">Visualize and prioritize your tasks using the Eisenhower Matrix framework</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                                <div className="flex items-center">
                                    <span className="material-symbols-outlined mr-2">error</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {matrix.map((quadrant) => {
                                const info = getQuadrantInfo(quadrant.quadrant);
                                return (
                                    <div 
                                        key={quadrant.quadrant} 
                                        className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] overflow-hidden"
                                    >
                                        <div className={`${info.color} ${info.borderColor} border-b p-4`}>
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-white">{info.title}</h2>
                                                <span className={`px-3 py-1 ${info.textColor} bg-white bg-opacity-20 rounded-full text-sm font-bold`}>
                                                    {quadrant.tasks.length} tasks
                                                </span>
                                            </div>
                                            <p className="text-white text-opacity-90 mt-1">{info.description}</p>
                                        </div>
                                        
                                        <div className="p-4">
                                            {quadrant.tasks.length > 0 ? (
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {quadrant.tasks.slice(0, 10).map((task: any) => (
                                                        <div 
                                                            key={task.id} 
                                                            className="p-3 border border-slate-100 dark:border-[#333] rounded-lg hover:border-primary/30 transition-all"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h3 className="font-semibold text-[#333] dark:text-gray-200 mb-1">
                                                                        {task.title}
                                                                    </h3>
                                                                    {task.description && (
                                                                        <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                                                            {task.description}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex items-center gap-2 text-xs">
                                                                        {task.category && (
                                                                            <span className="px-2 py-1 bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-slate-300 rounded-full">
                                                                                {task.category}
                                                                            </span>
                                                                        )}
                                                                        {task.deadline && (
                                                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                                                                Due: {new Date(task.deadline).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                        {getPriorityBadge(task.priority)}
                                                                    </div>
                                                                </div>
                                                                <div className="ml-3 text-right">
                                                                    <div className="text-sm font-bold text-primary">
                                                                        {task.smartPriority || 'N/A'}%
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        Priority
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {task.priorityResult && (
                                                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#333]">
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                        <div>
                                                                            <span className="text-slate-500">Urgency:</span>
                                                                            <span className="ml-1 font-medium">{task.priorityResult.factors.deadlineUrgency}%</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500">Importance:</span>
                                                                            <span className="ml-1 font-medium">{task.priorityResult.factors.importanceScore}%</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500">Effort:</span>
                                                                            <span className="ml-1 font-medium">{task.priorityResult.factors.estimatedEffort}%</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-slate-500">Likelihood:</span>
                                                                            <span className="ml-1 font-medium">{task.priorityResult.factors.completionLikelihood}%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {quadrant.tasks.length > 10 && (
                                                        <div className="text-center py-2 text-sm text-slate-500">
                                                            + {quadrant.tasks.length - 10} more tasks
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                    <div className="text-4xl mb-2">📋</div>
                                                    <p>No tasks in this category</p>
                                                    <p className="text-sm mt-1">Add tasks to see them here</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Matrix Legend */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                            <h2 className="text-xl font-bold mb-4">How to Use the Eisenhower Matrix</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-semibold text-red-700">Do First (Urgent & Important)</h3>
                                        <p className="text-sm text-slate-600">Tasks that need immediate attention and contribute to your goals</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-semibold text-blue-700">Schedule (Important but Not Urgent)</h3>
                                        <p className="text-sm text-slate-600">Tasks that are important for long-term success but don't need immediate action</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-semibold text-yellow-700">Delegate (Urgent but Not Important)</h3>
                                        <p className="text-sm text-slate-600">Tasks that are time-sensitive but don't require your personal attention</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-gray-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Eliminate (Neither Urgent nor Important)</h3>
                                        <p className="text-sm text-slate-600">Tasks that don't contribute to your goals and should be reconsidered</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}