"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function HabitGamificationPage() {
    const [gamificationData, setGamificationData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchGamificationData();
    }, []);

    const fetchGamificationData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/habits/gamification");
            if (res.ok) {
                const data = await res.json();
                setGamificationData(data);
                setError("");
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to load gamification data");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
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
                                <span className="ml-3 text-lg">Loading Habit Gamification...</span>
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
                            <h1 className="text-3xl font-bold mb-2">Habit Gamification</h1>
                            <p className="text-slate-500">Track your progress, earn achievements, and build unstoppable habits</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                                <div className="flex items-center">
                                    <span className="material-symbols-outlined mr-2">error</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        {gamificationData && (
                            <>
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-3xl">fitness_center</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Habits</p>
                                                <h3 className="text-2xl font-black">{gamificationData.stats.totalHabits}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                                <span className="material-symbols-outlined text-3xl">done_all</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Completions</p>
                                                <h3 className="text-2xl font-black">{gamificationData.stats.totalCompletions}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                                <span className="material-symbols-outlined text-3xl">trending_up</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Habits</p>
                                                <h3 className="text-2xl font-black">{gamificationData.stats.activeHabits}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                                                <span className="material-symbols-outlined text-3xl">percent</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completion Rate</p>
                                                <h3 className="text-2xl font-black">{gamificationData.stats.completionRate}%</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Streak Tracking */}
                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">local_fire_department</span>
                                            Streak Tracking
                                        </h2>
                                        
                                        <div className="space-y-4">
                                            {gamificationData.streaks.map((streak: any) => (
                                                <div key={streak.habitId} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{streak.habit.icon}</span>
                                                            <div>
                                                                <h3 className="font-semibold">{streak.habitName}</h3>
                                                                <p className="text-sm text-slate-500">
                                                                    {streak.isActive ? "🔥 Active" : "❄️ Inactive"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {streak.currentStreak > 0 && (
                                                            <div className="text-right">
                                                                <div className="text-2xl font-black text-primary">
                                                                    {streak.currentStreak}
                                                                </div>
                                                                <div className="text-xs text-slate-500">days</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-500">Current Streak</span>
                                                        <span className="font-medium">
                                                            {streak.currentStreak} days
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="w-full bg-slate-100 dark:bg-[#222] rounded-full h-2 mt-2">
                                                        <div 
                                                            className="bg-primary h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min((streak.currentStreak / streak.longestStreak) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-xs mt-1 text-slate-400">
                                                        <span>Longest: {streak.longestStreak} days</span>
                                                        <span>Goal: 30 days</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Achievements */}
                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">workspace_premium</span>
                                            Achievements
                                        </h2>
                                        
                                        <div className="space-y-3">
                                            {gamificationData.achievements.map((achievement: any) => (
                                                <div 
                                                    key={achievement.id} 
                                                    className="p-4 bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 rounded-xl"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-3xl">{achievement.icon}</div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-[#333] dark:text-gray-200">{achievement.name}</h3>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {achievement.description}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Locked achievements */}
                                            <div className="p-4 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl opacity-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-3xl text-slate-300">🔒</div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-slate-400">7-Day Streak</h3>
                                                        <p className="text-sm text-slate-500">Maintain any habit for 7 consecutive days</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl opacity-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-3xl text-slate-300">🔒</div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-slate-400">Habit Master</h3>
                                                        <p className="text-sm text-slate-500">Maintain 5 active habits for 30 days</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Habit Progress */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 mt-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">trending_up</span>
                                        Habit Progress
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {gamificationData.habits.map((habit: any) => (
                                            <div key={habit.id} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-2xl">{habit.icon}</span>
                                                    <div>
                                                        <h3 className="font-semibold">{habit.name}</h3>
                                                        <p className="text-xs text-slate-500">{habit.category}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-500">Completions</span>
                                                        <span className="font-medium">{habit.completions}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-500">Last Done</span>
                                                        <span className="font-medium">
                                                            {habit.lastCompleted 
                                                                ? new Date(habit.lastCompleted).toLocaleDateString()
                                                                : 'Never'
                                                            }
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="w-full bg-slate-100 dark:bg-[#222] rounded-full h-2">
                                                        <div 
                                                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min((habit.completions / 30) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}