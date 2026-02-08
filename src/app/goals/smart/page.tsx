"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function SmartGoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState("active");

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        specific: "",
        measurable: "",
        achievable: true,
        relevant: "",
        timeBound: "",
        targetValue: "",
        unit: "",
        category: "",
        priority: "Medium"
    });

    useEffect(() => {
        fetchGoals();
        fetchAnalytics();
    }, [activeTab]);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const status = activeTab === "active" ? "Active" : 
                          activeTab === "completed" ? "Completed" : 
                          activeTab === "archived" ? "Archived" : undefined;
            
            const res = await fetch(`/api/goals${status ? `?status=${status}` : ""}`);
            if (res.ok) {
                const data = await res.json();
                setGoals(data.goals);
                setError("");
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to load goals");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/goals?type=analytics");
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data.analytics);
            }
        } catch (err) {
            console.error("Analytics fetch error:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create",
                    ...formData,
                    targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                setGoals([data.goal, ...goals]);
                resetForm();
                setShowCreateModal(false);
                fetchAnalytics(); // Refresh analytics
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create goal");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Submit error:", err);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            specific: "",
            measurable: "",
            achievable: true,
            relevant: "",
            timeBound: "",
            targetValue: "",
            unit: "",
            category: "",
            priority: "Medium"
        });
    };

    const updateGoalProgress = async (goalId: string, currentValue: number) => {
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateProgress",
                    goalId,
                    currentValue
                })
            });
            
            if (res.ok) {
                fetchGoals(); // Refresh goals
                fetchAnalytics(); // Refresh analytics
            }
        } catch (err) {
            console.error("Progress update error:", err);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-500';
            case 'Medium': return 'text-yellow-500';
            case 'Low': return 'text-green-500';
            default: return 'text-slate-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-slate-100 text-slate-800';
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
                                <span className="ml-3 text-lg">Loading SMART Goals...</span>
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
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">SMART Goals</h1>
                                    <p className="text-slate-500">Set Specific, Measurable, Achievable, Relevant, and Time-bound goals</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Create Goal
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                                <div className="flex items-center">
                                    <span className="material-symbols-outlined mr-2">error</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        {analytics && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-3xl">flag</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Goals</p>
                                            <h3 className="text-2xl font-black">{analytics.totalGoals}</h3>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                            <span className="material-symbols-outlined text-3xl">bolt</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Goals</p>
                                            <h3 className="text-2xl font-black">{analytics.activeGoals}</h3>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</p>
                                            <h3 className="text-2xl font-black">{analytics.completedGoals}</h3>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                                            <span className="material-symbols-outlined text-3xl">trending_up</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Success Rate</p>
                                            <h3 className="text-2xl font-black">{analytics.completionRate}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-[#222] p-1 rounded-xl w-fit">
                            {['active', 'completed', 'archived'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Goals List */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                            {goals.length > 0 ? (
                                <div className="space-y-4">
                                    {goals.map((goal) => (
                                        <div key={goal.id} className="p-5 border border-slate-100 dark:border-[#333] rounded-xl hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-[#333] dark:text-gray-200">{goal.title}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(goal.status)}`}>
                                                            {goal.status}
                                                        </span>
                                                        <span className={`text-xs font-bold ${getPriorityColor(goal.priority)}`}>
                                                            {goal.priority} Priority
                                                        </span>
                                                    </div>
                                                    {goal.description && (
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{goal.description}</p>
                                                    )}
                                                    {goal.category && (
                                                        <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-slate-300 text-xs rounded-full">
                                                            {goal.category}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="text-right ml-4">
                                                    <div className="text-2xl font-black text-primary">{Math.round(goal.progress)}%</div>
                                                    <div className="text-xs text-slate-500">Progress</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-100 dark:bg-[#222] rounded-full h-3 mb-4">
                                                <div 
                                                    className="bg-primary h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${goal.progress}%` }}
                                                ></div>
                                            </div>

                                            {/* SMART Criteria Display */}
                                            {(goal.specific || goal.measurable || goal.relevant) && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                                                    {goal.specific && (
                                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                            <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">Specific</div>
                                                            <div className="text-slate-600 dark:text-slate-400">{goal.specific}</div>
                                                        </div>
                                                    )}
                                                    {goal.measurable && (
                                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                            <div className="font-bold text-green-700 dark:text-green-300 mb-1">Measurable</div>
                                                            <div className="text-slate-600 dark:text-slate-400">{goal.measurable}</div>
                                                        </div>
                                                    )}
                                                    {goal.relevant && (
                                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                            <div className="font-bold text-purple-700 dark:text-purple-300 mb-1">Relevant</div>
                                                            <div className="text-slate-600 dark:text-slate-400">{goal.relevant}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Progress Update */}
                                            {goal.status === 'Active' && goal.targetValue && (
                                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-[#333]">
                                                    <span className="text-sm text-slate-500">Update Progress:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={goal.targetValue}
                                                        defaultValue={goal.currentValue || 0}
                                                        className="w-24 px-3 py-1 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] text-sm"
                                                        onBlur={(e) => updateGoalProgress(goal.id, parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                updateGoalProgress(goal.id, parseFloat((e.target as HTMLInputElement).value) || 0);
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm text-slate-500">
                                                        of {goal.targetValue} {goal.unit}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Deadline */}
                                            {goal.deadline && (
                                                <div className="flex items-center gap-2 mt-3 text-sm">
                                                    <span className="material-symbols-outlined text-[16px] text-slate-400">event</span>
                                                    <span className="text-slate-500">
                                                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-4">🎯</div>
                                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        No {activeTab} goals yet
                                    </h3>
                                    <p className="text-slate-500 mb-6">
                                        {activeTab === 'active' 
                                            ? 'Create your first SMART goal to get started'
                                            : `No ${activeTab} goals found`
                        }
                                    </p>
                                    {activeTab === 'active' && (
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
                                        >
                                            Create Your First Goal
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Goal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Create SMART Goal</h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Goal Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] h-20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        placeholder="e.g., Career, Health, Learning"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Target Value</label>
                                    <input
                                        type="number"
                                        value={formData.targetValue}
                                        onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        placeholder="e.g., 100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit</label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        placeholder="e.g., pages, hours, items"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Deadline *</label>
                                <input
                                    type="date"
                                    value={formData.timeBound}
                                    onChange={(e) => setFormData({...formData, timeBound: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                >
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}